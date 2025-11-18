'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Activity,
  Stethoscope,
  Camera,
  Scissors,
  Settings,
  Users,
  Package,
  Wind,
  Thermometer,
  Monitor,
  Shield,
  Heart,
  ChevronRight,
  ArrowLeft,
  Search
} from 'lucide-react';

interface EquipmentViewProps {
  onBack?: () => void;
  isAdmin?: boolean;
}

interface EquipmentCategory {
  id: string;
  name: string;
  icon: any;
  color: string;
  bgColor: string;
  borderColor: string;
  items: string[];
  count: number;
}

const EQUIPMENT_CATEGORIES: EquipmentCategory[] = [
  {
    id: 'patient-care',
    name: 'Patient Care & Monitoring',
    icon: Activity,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    items: [
      'Patient monitors (ECG, NIBP, IBP, SpO₂, EtCO₂)',
      'Anesthesia machines & ventilators',
      'Capnography, BIS monitors',
      'Syringe & infusion pumps',
      'Temperature monitoring & warming devices',
      'Defibrillators & resuscitation equipment'
    ],
    count: 124
  },
  {
    id: 'imaging',
    name: 'Imaging & Guidance',
    icon: Camera,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    items: [
      'C-arm fluoroscopy machines',
      'Mobile X-ray, ultrasound',
      'Endoscopy towers, arthroscopy systems',
      'Surgical navigation systems',
      'Intraoperative CT/MRI'
    ],
    count: 45
  },
  {
    id: 'surgical-instruments',
    name: 'Surgical Instruments & Sets',
    icon: Scissors,
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    items: [
      'Standard instrument sets (general, ortho, vascular, neuro, ENT, OB/GYN)',
      'Laparoscopic instruments',
      'Robotic surgery instruments',
      'Microsurgical instruments',
      'Power tools (saws, drills, dermatomes)'
    ],
    count: 312
  },
  {
    id: 'surgical-equipment',
    name: 'Surgical Equipment & Devices',
    icon: Settings,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    items: [
      'Electrosurgical units (diathermy, Ligasure, Harmonic)',
      'Suction & smoke evacuation systems',
      'Tourniquet devices',
      'Surgical lights',
      'Operating tables & accessories',
      'Positioning & fixation devices'
    ],
    count: 89
  },
  {
    id: 'patient-handling',
    name: 'Patient Handling & Transfer',
    icon: Users,
    color: 'text-teal-600',
    bgColor: 'bg-teal-50',
    borderColor: 'border-teal-200',
    items: [
      'Patient trolleys & stretchers',
      'Hover mattresses, slide sheets',
      'Hoists, lifters',
      'Wheelchair docking'
    ],
    count: 56
  },
  {
    id: 'sterile-processing',
    name: 'Sterile Processing & Storage',
    icon: Package,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    items: [
      'Autoclaves & sterilizers',
      'Washer-disinfectors & ultrasonic cleaners',
      'Instrument tracking/Barcode systems',
      'Sterile storage cabinets',
      'Peelers, wrappers, sealing machines'
    ],
    count: 34
  },
  {
    id: 'airway-anesthesia',
    name: 'Airway & Anesthesia Support',
    icon: Wind,
    color: 'text-cyan-600',
    bgColor: 'bg-cyan-50',
    borderColor: 'border-cyan-200',
    items: [
      'Laryngoscopes, video scopes',
      'Fiberoptic intubation devices',
      'Difficult airway carts',
      'Anesthesia trolleys',
      'Gas scavenging and pipeline systems'
    ],
    count: 67
  },
  {
    id: 'environmental',
    name: 'Environmental Controls & Theatre Infrastructure',
    icon: Thermometer,
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50',
    borderColor: 'border-indigo-200',
    items: [
      'Laminar airflow systems (AHU)',
      'Temperature/humidity & infection control',
      'Operating lights (Ceiling & exam)',
      'Pendant systems (electrical/gas/IT)',
      'Telemedicine and AV integration'
    ],
    count: 28
  },
  {
    id: 'information-digital',
    name: 'Information & Digital Systems',
    icon: Monitor,
    color: 'text-violet-600',
    bgColor: 'bg-violet-50',
    borderColor: 'border-violet-200',
    items: [
      'Theatre management software (ORMIS)',
      'PACS & imaging viewers',
      'Electronic patient records (EPR)',
      'Barcode scanners & RFID tracking',
      'OR audiovisual capture/live streaming'
    ],
    count: 15
  },
  {
    id: 'safety-emergency',
    name: 'Safety & Emergency Equipment',
    icon: Shield,
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    items: [
      'Fire extinguishers, drench showers',
      'Spill response kits',
      'Crash carts/Emergency response trolleys',
      'Lead aprons & radiation shields',
      'PPE (masks, gowns, visors, gloves)'
    ],
    count: 78
  },
  {
    id: 'pacu',
    name: 'Post-Operative (PACU) Equipment',
    icon: Heart,
    color: 'text-pink-600',
    bgColor: 'bg-pink-50',
    borderColor: 'border-pink-200',
    items: [
      'Recovery monitors',
      'Warming blankets',
      'Oxygen delivery systems',
      'Pain management pumps (PCA)',
      'Resuscitation equipment'
    ],
    count: 92
  }
];

export default function EquipmentView({ onBack, isAdmin = false }: EquipmentViewProps) {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<EquipmentCategory | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const handleCategoryClick = (category: EquipmentCategory) => {
    setSelectedCategory(category);
  };

  const handleBack = () => {
    if (selectedCategory) {
      setSelectedCategory(null);
    } else if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  const filteredCategories = EQUIPMENT_CATEGORIES.filter(cat =>
    cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cat.items.some(item => item.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (selectedCategory) {
    // Detail view for selected category
    return (
      <div className="h-full flex flex-col bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 p-4">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-3"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Back to Categories</span>
          </button>
          <div className="flex items-center gap-3">
            <div className={`${selectedCategory.bgColor} ${selectedCategory.borderColor} border p-3 rounded-lg`}>
              <selectedCategory.icon className={`w-6 h-6 ${selectedCategory.color}`} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{selectedCategory.name}</h2>
              <p className="text-sm text-gray-600">{selectedCategory.count} items in this category</p>
            </div>
          </div>
        </div>

        {/* Items List */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {selectedCategory.items.map((item, index) => (
              <div
                key={index}
                className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all cursor-pointer hover:border-gray-300"
              >
                <div className="flex items-start gap-3">
                  <div className={`${selectedCategory.bgColor} p-2 rounded`}>
                    <selectedCategory.icon className={`w-5 h-5 ${selectedCategory.color}`} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 text-sm mb-1">{item}</h3>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>Available: {Math.floor(Math.random() * 20) + 5}</span>
                      <span>•</span>
                      <span>In Use: {Math.floor(Math.random() * 10)}</span>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Main category grid view
  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header with Search */}
      <div className="bg-white border-b border-gray-200 p-4 md:p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Equipment Categories</h1>

        {/* Search Bar */}
        <div className="relative max-w-2xl">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search equipment categories or items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Category Grid */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredCategories.map((category) => (
            <button
              key={category.id}
              onClick={() => handleCategoryClick(category)}
              className="group bg-white border border-gray-200 rounded-lg p-5 hover:shadow-lg transition-all text-left hover:border-gray-300"
            >
              <div className="flex items-start gap-4">
                <div className={`${category.bgColor} ${category.borderColor} border p-3 rounded-lg group-hover:scale-110 transition-transform`}>
                  <category.icon className={`w-6 h-6 ${category.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 text-sm mb-1 line-clamp-2">
                    {category.name}
                  </h3>
                  <p className="text-xs text-gray-600 mb-2">
                    {category.count} items
                  </p>
                  <div className="flex items-center gap-1 text-xs text-blue-600 font-medium">
                    <span>View items</span>
                    <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>

              {/* Preview Items */}
              <div className="mt-3 pt-3 border-t border-gray-100">
                <p className="text-xs text-gray-500 line-clamp-2">
                  {category.items[0]}
                  {category.items.length > 1 && `, ${category.items[1].split(',')[0]}...`}
                </p>
              </div>
            </button>
          ))}
        </div>

        {filteredCategories.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-2">
              <Search className="w-12 h-12 mx-auto" />
            </div>
            <p className="text-gray-600">No categories found matching "{searchTerm}"</p>
          </div>
        )}
      </div>

      {/* Stats Footer */}
      <div className="bg-white border-t border-gray-200 p-4 md:p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{EQUIPMENT_CATEGORIES.length}</div>
            <div className="text-xs text-gray-600">Categories</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              {EQUIPMENT_CATEGORIES.reduce((sum, cat) => sum + cat.count, 0)}
            </div>
            <div className="text-xs text-gray-600">Total Items</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">95%</div>
            <div className="text-xs text-gray-600">Available</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">5%</div>
            <div className="text-xs text-gray-600">In Use</div>
          </div>
        </div>
      </div>
    </div>
  );
}
