'use client';

import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Star, MapPin, Building2, Briefcase, AlertCircle, Crosshair } from 'lucide-react';
import type { NHSHospital } from '@/lib/mockHospitalData';

// Fix Leaflet default icon issue with Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Create custom marker icons for hospitals
const createHospitalIcon = (isSelected: boolean, isUrgent: boolean) => {
  const size = isSelected ? 48 : 40;
  const color = isUrgent ? '#ef4444' : '#3b82f6'; // red for urgent, blue otherwise
  const borderColor = isSelected ? '#8b5cf6' : '#ffffff'; // purple border when selected
  const borderWidth = isSelected ? 4 : 2;

  return L.divIcon({
    html: `
      <div style="
        width: ${size}px;
        height: ${size}px;
        background: ${color};
        border: ${borderWidth}px solid ${borderColor};
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        cursor: pointer;
        transition: all 0.2s;
        position: relative;
      ">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
          <polyline points="9 22 9 12 15 12 15 22"></polyline>
        </svg>
        ${
          isUrgent
            ? `<div style="
          position: absolute;
          top: -2px;
          right: -2px;
          width: 12px;
          height: 12px;
          background: #fbbf24;
          border: 2px solid white;
          border-radius: 50%;
        "></div>`
            : ''
        }
      </div>
    `,
    className: 'custom-hospital-marker',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
};

// Create user location marker
const createUserIcon = () => {
  return L.divIcon({
    html: `
      <div style="
        width: 24px;
        height: 24px;
        background: #06B6D4;
        border: 4px solid white;
        border-radius: 50%;
        box-shadow: 0 0 0 4px rgba(6, 182, 212, 0.3), 0 4px 12px rgba(0, 0, 0, 0.2);
        animation: pulse 2s infinite;
      ">
      </div>
      <style>
        @keyframes pulse {
          0%, 100% { box-shadow: 0 0 0 4px rgba(6, 182, 212, 0.3), 0 4px 12px rgba(0, 0, 0, 0.2); }
          50% { box-shadow: 0 0 0 8px rgba(6, 182, 212, 0.1), 0 4px 12px rgba(0, 0, 0, 0.2); }
        }
      </style>
    `,
    className: 'user-marker',
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
};

// Component to recenter map when user location changes
function RecenterMap({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
}

// Component for recenter button
function RecenterButton({ center }: { center: [number, number] | null }) {
  const map = useMap();

  const handleRecenter = () => {
    if (center) {
      map.setView(center, 13, { animate: true });
    }
  };

  if (!center) return null;

  return (
    <button
      onClick={handleRecenter}
      className="leaflet-control-zoom-in"
      style={{
        position: 'absolute',
        top: '120px',
        right: '10px',
        zIndex: 1000,
        width: '30px',
        height: '30px',
        backgroundColor: 'white',
        border: '2px solid rgba(0,0,0,0.2)',
        borderRadius: '4px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 1px 5px rgba(0,0,0,0.4)',
      }}
      title="Re-center map"
    >
      <Crosshair className="w-4 h-4 text-gray-700" />
    </button>
  );
}

interface HospitalMapViewProps {
  hospitals: (NHSHospital & { distance?: number })[];
  userLocation: { lat: number; lng: number } | null;
  selectedHospital: NHSHospital | null;
  onSelectHospital: (hospital: NHSHospital) => void;
}

export default function HospitalMapView({ hospitals, userLocation, selectedHospital, onSelectHospital }: HospitalMapViewProps) {
  const [mapCenter, setMapCenter] = useState<[number, number]>([51.5074, -0.1278]); // Default to London
  const [mapZoom, setMapZoom] = useState(12);
  const [isMounted, setIsMounted] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  const [mapKey, setMapKey] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Ensure component is mounted before rendering map
  useEffect(() => {
    setIsMounted(true);
    // Small delay to ensure Leaflet loads properly
    const timer = setTimeout(() => {
      setMapReady(true);
      setMapKey(prev => prev + 1); // Force remount with unique key
    }, 100);

    return () => {
      clearTimeout(timer);
      setMapReady(false);
    };
  }, []);

  // Force map to invalidate size on mount and when container resizes (important for mobile)
  useEffect(() => {
    if (mapReady && containerRef.current) {
      const resizeObserver = new ResizeObserver(() => {
        // Trigger map resize after a short delay
        setTimeout(() => {
          const mapElement = containerRef.current?.querySelector('.leaflet-container') as any;
          if (mapElement?._leaflet_id) {
            const map = (window as any).L?.map?._targets?.[mapElement._leaflet_id];
            map?.invalidateSize();
          }
        }, 100);
      });

      resizeObserver.observe(containerRef.current);

      return () => {
        resizeObserver.disconnect();
      };
    }
  }, [mapReady]);

  // Update map center when user location is available
  useEffect(() => {
    if (userLocation) {
      setMapCenter([userLocation.lat, userLocation.lng]);
      setMapZoom(12);
    } else if (hospitals.length > 0 && hospitals[0].location) {
      // Default to first hospital's location
      setMapCenter([hospitals[0].location.lat, hospitals[0].location.lng]);
    }
  }, [userLocation, hospitals]);

  // Show loading state until mounted and ready
  if (!isMounted || !mapReady) {
    return (
      <div className="relative h-full w-full flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading map...</p>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative h-full w-full">
      <MapContainer
        key={mapKey}
        center={mapCenter}
        zoom={mapZoom}
        minZoom={10}
        maxZoom={16}
        style={{ height: '100%', width: '100%', background: '#e0f2fe' }}
        zoomControl={true}
        scrollWheelZoom={true}
        touchZoom={true}
        doubleClickZoom={true}
        dragging={true}
        whenReady={(mapInstance) => {
          // Map is fully initialized - force size recalculation for mobile
          setTimeout(() => {
            mapInstance.target.invalidateSize();
          }, 100);
        }}
      >
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CartoDB</a>'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />

        <RecenterMap center={mapCenter} />
        <RecenterButton center={userLocation} />

        {/* User Location Marker */}
        {userLocation && (
          <Marker position={[userLocation.lat, userLocation.lng]} icon={createUserIcon()}>
            <Popup>
              <div className="p-2">
                <p className="font-semibold text-cyan-600">Your Location</p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Journey Line to Selected Hospital */}
        {selectedHospital && userLocation && selectedHospital.location && (
          <>
            {/* Outer darker line for depth */}
            <Polyline
              positions={[
                [userLocation.lat, userLocation.lng],
                [selectedHospital.location.lat, selectedHospital.location.lng]
              ]}
              pathOptions={{
                color: '#5b21b6',
                weight: 6,
                opacity: 0.4,
                lineCap: 'round',
                lineJoin: 'round'
              }}
            />
            {/* Inner main line */}
            <Polyline
              positions={[
                [userLocation.lat, userLocation.lng],
                [selectedHospital.location.lat, selectedHospital.location.lng]
              ]}
              pathOptions={{
                color: '#8b5cf6',
                weight: 3,
                opacity: 1,
                lineCap: 'round',
                lineJoin: 'round'
              }}
            />
          </>
        )}

        {/* Hospital Markers */}
        {hospitals.map((hospital) => {
          if (!hospital.location) return null;

          const isSelected = selectedHospital?.id === hospital.id;

          return (
            <Marker
              key={hospital.id}
              position={[hospital.location.lat, hospital.location.lng]}
              icon={createHospitalIcon(isSelected, hospital.urgentNeeds)}
              eventHandlers={{
                click: () => {
                  onSelectHospital(hospital);
                },
              }}
            >
              <Popup maxWidth={320} className="custom-popup">
                <div className="p-2 sm:p-3 w-full max-w-[280px] sm:min-w-[280px]">
                  {/* Hospital Header */}
                  <div className="flex items-start space-x-2 sm:space-x-3 mb-2 sm:mb-3">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-gradient-to-br from-blue-500 via-cyan-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                      <Building2 className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-1">
                        <h3 className="font-bold text-gray-900 text-sm sm:text-base truncate">
                          {hospital.name}
                        </h3>
                        {hospital.urgentNeeds && (
                          <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-xs sm:text-sm text-gray-600 truncate">{hospital.trust}</p>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center space-x-2 sm:space-x-4 mb-2 sm:mb-3 pb-2 sm:pb-3 border-b border-gray-200 text-xs sm:text-sm">
                    <div className="flex items-center space-x-0.5 sm:space-x-1 text-amber-500">
                      <Star className="w-3 h-3 sm:w-4 sm:h-4 fill-current" />
                      <span className="font-semibold">{hospital.rating.toFixed(1)}</span>
                    </div>
                    <div className="flex items-center space-x-0.5 sm:space-x-1 text-gray-600">
                      <Briefcase className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span>{hospital.shifts.length} shifts</span>
                    </div>
                  </div>

                  {/* Location */}
                  <div className="mb-2 sm:mb-3">
                    <div className="flex items-start space-x-2 text-gray-600">
                      <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 mt-0.5 flex-shrink-0" />
                      <div className="text-xs">
                        <p className="font-medium text-gray-900">{hospital.address}</p>
                        <p className="text-gray-500">{hospital.postcode}</p>
                      </div>
                    </div>
                  </div>

                  {/* Distance Badge */}
                  {hospital.distance !== undefined && (
                    <div className="mb-2 sm:mb-3">
                      <div className="inline-flex items-center px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
                        <MapPin className="w-3 h-3 mr-1" />
                        {hospital.distance.toFixed(1)} km away
                      </div>
                    </div>
                  )}

                  {/* Specialties */}
                  {hospital.specialties && hospital.specialties.length > 0 && (
                    <div className="mb-3">
                      <div className="flex flex-wrap gap-1">
                        {hospital.specialties.slice(0, 2).map((specialty, index) => (
                          <span
                            key={index}
                            className="px-2 py-0.5 bg-gradient-to-r from-blue-50 to-cyan-50 text-blue-700 rounded text-xs"
                          >
                            {specialty}
                          </span>
                        ))}
                        {hospital.specialties.length > 2 && (
                          <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
                            +{hospital.specialties.length - 2} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Available Shifts Preview */}
                  {hospital.shifts.length > 0 && (
                    <div className="mb-3 space-y-1">
                      <p className="text-xs font-medium text-gray-700">Available Shifts:</p>
                      {hospital.shifts.slice(0, 2).map((shift, idx) => (
                        <div key={idx} className="text-xs text-gray-600 flex items-center justify-between">
                          <span>{shift.role} ({shift.band})</span>
                          <span className="font-bold text-blue-600">Competitive</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex space-x-1.5 sm:space-x-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectHospital(hospital);
                      }}
                      className="flex-1 px-2 sm:px-3 py-1.5 sm:py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-colors text-xs sm:text-sm font-medium"
                    >
                      View Hospital
                    </button>
                  </div>

                  {/* Urgent Badge */}
                  {hospital.urgentNeeds && (
                    <div className="mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-gray-200">
                      <div className="flex items-center space-x-2 text-red-600">
                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                        <span className="text-xs font-medium">Urgent Needs</span>
                      </div>
                    </div>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* Available Hospitals Counter - Upper Right - DESKTOP ONLY */}
      <div className="hidden md:block absolute top-6 right-6 bg-blue-50 rounded-xl shadow-2xl border border-blue-200 p-4 z-[1000]">
        <div className="text-center">
          <div className="text-3xl font-bold text-blue-700">{hospitals.length}</div>
          <div className="text-xs text-blue-600 font-medium mt-1">Available Hospitals</div>
        </div>
      </div>
    </div>
  );
}
