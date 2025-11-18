'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  Activity,
  Clock,
  CheckCircle,
  Download,
  ArrowUp,
  ArrowDown,
  Zap,
  Award,
  Target,
  Lightbulb,
  RotateCcw,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface AnalyticsViewProps {
  onBack?: () => void;
}

// Animated Counter Component
function AnimatedCounter({ end, duration = 2000, prefix = '', suffix = '' }: { end: number; duration?: number; prefix?: string; suffix?: string }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number | null = null;
    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      setCount(Math.floor(progress * end));
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    requestAnimationFrame(animate);
  }, [end, duration]);

  return <span>{prefix}{count}{suffix}</span>;
}

// Flip Card Component with Front/Back - Front shows CHARTS, Back shows INSIGHTS
function FlipCard({
  title,
  value,
  subtitle,
  icon: Icon,
  chartData,
  chartType = 'bar',
  chartLabels,
  insights,
  recommendations,
  trend,
  color = 'slate'
}: {
  title: string;
  value: string | number;
  subtitle: string;
  icon: any;
  chartData: number[];
  chartType?: 'bar' | 'line' | 'area' | 'gauge';
  chartLabels?: string[];
  insights: string[];
  recommendations: string[];
  trend: 'up' | 'down' | 'neutral';
  color?: 'slate' | 'blue' | 'purple' | 'emerald';
}) {
  const [isFlipped, setIsFlipped] = useState(false);

  const colorSchemes = {
    slate: {
      bg: 'from-slate-50 to-slate-100',
      accent: 'bg-slate-400',
      accentHex: '#94a3b8',
      text: 'text-slate-600',
      border: 'border-slate-200',
      glow: 'shadow-slate-200/50'
    },
    blue: {
      bg: 'from-blue-50 to-blue-100',
      accent: 'bg-blue-400',
      accentHex: '#60a5fa',
      text: 'text-blue-600',
      border: 'border-blue-200',
      glow: 'shadow-blue-200/50'
    },
    purple: {
      bg: 'from-purple-50 to-purple-100',
      accent: 'bg-purple-400',
      accentHex: '#c084fc',
      text: 'text-purple-600',
      border: 'border-purple-200',
      glow: 'shadow-purple-200/50'
    },
    emerald: {
      bg: 'from-emerald-50 to-emerald-100',
      accent: 'bg-emerald-400',
      accentHex: '#34d399',
      text: 'text-emerald-600',
      border: 'border-emerald-200',
      glow: 'shadow-emerald-200/50'
    }
  };

  const scheme = colorSchemes[color];

  return (
    <div className="perspective-1000 h-[280px]">
      <motion.div
        className="relative w-full h-full cursor-pointer"
        onClick={() => setIsFlipped(!isFlipped)}
        style={{ transformStyle: 'preserve-3d' }}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, type: 'spring', stiffness: 100 }}
      >
        {/* Front of Card */}
        <motion.div
          className={`absolute inset-0 bg-gradient-to-br ${scheme.bg} rounded-xl border ${scheme.border} ${scheme.glow} shadow-lg overflow-hidden`}
          style={{ backfaceVisibility: 'hidden' }}
        >
          <div className="p-6 h-full flex flex-col">
            {/* Header */}
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className={`${scheme.accent} p-2.5 rounded-lg`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-700">{title}</h3>
                  <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>
                </div>
              </div>
              <RotateCcw className="w-4 h-4 text-gray-400" />
            </div>

            {/* Chart Visualization */}
            <div className="flex-1 flex flex-col justify-center">
              {chartType === 'bar' && (
                <div className="space-y-3">
                  {chartData.map((val, i) => {
                    const percentage = (val / Math.max(...chartData)) * 100;
                    return (
                      <div key={i}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-medium text-gray-600">{chartLabels?.[i] || `Item ${i + 1}`}</span>
                          <span className="text-xs font-bold text-gray-900">{val}{typeof value === 'string' && value.includes('%') ? '%' : ''}</span>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${scheme.accent} rounded-full transition-all duration-1000`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {chartType === 'line' && (
                <svg width="100%" height="140" className="mt-2">
                  <defs>
                    <linearGradient id={`area-gradient-${title}`} x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor={scheme.accentHex} stopOpacity="0.2" />
                      <stop offset="100%" stopColor={scheme.accentHex} stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  {/* Area fill */}
                  <path
                    d={`M 0 140 ${chartData.map((val, i) =>
                      `L ${(i * 100) / (chartData.length - 1)}% ${140 - (val / Math.max(...chartData)) * 100}`
                    ).join(' ')} L 100% 140 Z`}
                    fill={`url(#area-gradient-${title})`}
                  />
                  {/* Line */}
                  <polyline
                    points={chartData.map((val, i) =>
                      `${(i * 100) / (chartData.length - 1)}%,${140 - (val / Math.max(...chartData)) * 100}`
                    ).join(' ')}
                    fill="none"
                    stroke={scheme.accentHex}
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                  {/* Data points */}
                  {chartData.map((val, i) => (
                    <circle
                      key={i}
                      cx={`${(i * 100) / (chartData.length - 1)}%`}
                      cy={140 - (val / Math.max(...chartData)) * 100}
                      r="4"
                      fill="white"
                      stroke={scheme.accentHex}
                      strokeWidth="2"
                    />
                  ))}
                </svg>
              )}

              {chartType === 'gauge' && (
                <div className="flex flex-col items-center justify-center">
                  <PremiumCircularProgress
                    value={typeof value === 'number' ? value : parseInt(value.toString())}
                    size={120}
                    strokeWidth={10}
                    color={scheme.accentHex}
                    glowColor={scheme.accentHex}
                    label={subtitle}
                  />
                  <div className="mt-3 text-center">
                    {trend !== 'neutral' && (
                      <div className={`flex items-center gap-1.5 text-xs font-medium justify-center ${trend === 'up' ? 'text-emerald-600' : 'text-red-600'}`}>
                        {trend === 'up' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        <span>{trend === 'up' ? 'Improving' : 'Declining'}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="text-xs text-gray-500 text-center mt-3">Click to view AI insights</div>
          </div>
        </motion.div>

        {/* Back of Card */}
        <motion.div
          className={`absolute inset-0 bg-gradient-to-br ${scheme.bg} rounded-xl border ${scheme.border} ${scheme.glow} shadow-lg overflow-hidden`}
          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
        >
          <div className="p-6 h-full flex flex-col overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-amber-500" />
                <h3 className="text-sm font-medium text-gray-900">AI Insights</h3>
              </div>
              <RotateCcw className="w-4 h-4 text-gray-400" />
            </div>

            {/* Insights */}
            <div className="mb-4">
              <h4 className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-2">Key Patterns</h4>
              <ul className="space-y-2">
                {insights.map((insight, idx) => (
                  <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                    <span className="text-emerald-600 mt-1">•</span>
                    <span>{insight}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Recommendations */}
            <div className="mt-auto">
              <h4 className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-2">Recommendations</h4>
              <ul className="space-y-2">
                {recommendations.map((rec, idx) => (
                  <li key={idx} className="text-sm text-amber-700 flex items-start gap-2">
                    <span className="text-amber-500 mt-1">→</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}

// Premium Circular Progress with Glow
function PremiumCircularProgress({
  value,
  size = 140,
  strokeWidth = 8,
  color = '#3b82f6',
  glowColor = '#3b82f6',
  label,
  sublabel
}: {
  value: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  glowColor?: string;
  label?: string;
  sublabel?: string;
}) {
  const [animatedValue, setAnimatedValue] = useState(0);

  useEffect(() => {
    setTimeout(() => setAnimatedValue(value), 100);
  }, [value]);

  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (animatedValue / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center group">
      <svg width={size} height={size} className="transform -rotate-90">
        <defs>
          <filter id={`glow-${value}`}>
            <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
          <linearGradient id={`gradient-${value}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={color} />
            <stop offset="100%" stopColor={glowColor} />
          </linearGradient>
        </defs>
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#e5e7eb"
          strokeWidth={strokeWidth}
          fill="none"
          className="opacity-20"
        />
        {/* Progress circle with glow */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={`url(#gradient-${value})`}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-[2000ms] ease-out"
          filter={`url(#glow-${value})`}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="text-3xl font-black bg-gradient-to-br from-gray-900 to-gray-600 bg-clip-text text-transparent">
          {Math.round(animatedValue)}%
        </div>
        {label && <div className="text-xs font-semibold text-gray-500 mt-1">{label}</div>}
        {sublabel && <div className="text-[10px] text-gray-400">{sublabel}</div>}
      </div>
    </div>
  );
}

// Premium Metric Card with 3D Effect
function PremiumMetricCard({
  title,
  value,
  change,
  trend,
  icon: Icon,
  gradient,
  sparklineData
}: {
  title: string;
  value: string | number;
  change: number;
  trend: 'up' | 'down';
  icon: any;
  gradient: string;
  sparklineData?: number[];
}) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative group"
    >
      {/* Glow effect - Desktop only */}
      <div className={`hidden md:block absolute -inset-0.5 bg-gradient-to-r ${gradient} rounded-2xl opacity-0 group-hover:opacity-20 blur-xl transition-all duration-500`} />

      <div className={`relative bg-white md:bg-white rounded-md md:rounded-2xl p-3 md:p-6 border border-gray-200 md:border-gray-100 md:shadow-lg transition-all duration-500 ${isHovered ? 'md:transform md:scale-105 md:shadow-2xl' : ''}`}>
        {/* Icon - simplified on mobile */}
        <div className="flex items-start justify-between mb-2 md:mb-0">
          <div className={`hidden md:flex w-8 h-8 md:w-12 md:h-12 rounded-lg md:rounded-xl bg-gradient-to-br ${gradient} items-center justify-center mb-0 md:mb-4 shadow-lg transform transition-transform duration-500 ${isHovered ? 'scale-110 rotate-6' : ''}`}>
            <Icon className="w-4 h-4 md:w-6 md:h-6 text-white" />
          </div>
          <div className="md:hidden">
            <Icon className="w-4 h-4 text-gray-400" />
          </div>
        </div>

        <div className="text-[10px] md:text-sm font-medium md:font-semibold text-gray-500 uppercase tracking-wide mb-1 md:mb-2">{title}</div>
        <div className="text-xl md:text-3xl font-bold md:font-black text-gray-900 mb-1 md:mb-2">
          <AnimatedCounter end={typeof value === 'number' ? value : parseInt(value.replace(/\D/g, '')) || 0} suffix={typeof value === 'string' && value.includes('%') ? '%' : ''} />
        </div>

        {/* Trend indicator */}
        <div className="flex items-center justify-between">
          <div className={`flex items-center gap-1 text-xs md:text-sm font-medium md:font-bold ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
            {trend === 'up' ? <ArrowUp className="w-3 h-3 md:w-4 md:h-4" /> : <ArrowDown className="w-3 h-3 md:w-4 md:h-4" />}
            <span>{change}%</span>
          </div>

          {/* Sparkline */}
          {sparklineData && (
            <svg width="60" height="20" className="opacity-60 hidden md:block">
              <defs>
                <linearGradient id={`sparkline-${title}`} x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor={trend === 'up' ? '#10b981' : '#ef4444'} stopOpacity="0.3" />
                  <stop offset="100%" stopColor={trend === 'up' ? '#10b981' : '#ef4444'} stopOpacity="0" />
                </linearGradient>
              </defs>
              {/* Area */}
              <path
                d={`M 0 24 ${sparklineData.map((val, i) =>
                  `L ${(i * 80) / (sparklineData.length - 1)} ${24 - (val / Math.max(...sparklineData)) * 20}`
                ).join(' ')} L 80 24 Z`}
                fill={`url(#sparkline-${title})`}
              />
              {/* Line */}
              <polyline
                points={sparklineData.map((val, i) =>
                  `${(i * 80) / (sparklineData.length - 1)},${24 - (val / Math.max(...sparklineData)) * 20}`
                ).join(' ')}
                fill="none"
                stroke={trend === 'up' ? '#10b981' : '#ef4444'}
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          )}
        </div>
      </div>
    </div>
  );
}

// Premium Radial Chart
function PremiumRadialChart({ data, size = 200 }: { data: { label: string; value: number; color: string }[]; size?: number }) {
  const [animationProgress, setAnimationProgress] = useState(0);

  useEffect(() => {
    setTimeout(() => setAnimationProgress(1), 100);
  }, []);

  const centerX = size / 2;
  const centerY = size / 2;
  const maxRadius = size / 2 - 25;
  const barWidth = 14;
  const gap = 6;

  return (
    <div className="relative">
      <svg width={size} height={size} className="filter drop-shadow-lg">
        <defs>
          {data.map((item, index) => (
            <linearGradient key={index} id={`radial-gradient-${index}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={item.color} stopOpacity="1" />
              <stop offset="100%" stopColor={item.color} stopOpacity="0.6" />
            </linearGradient>
          ))}
        </defs>
        {data.map((item, index) => {
          const radius = maxRadius - (index * (barWidth + gap));
          const circumference = 2 * Math.PI * radius;
          const percentage = item.value / 100;
          const offset = circumference - (percentage * circumference * animationProgress);

          return (
            <g key={index}>
              {/* Background circle */}
              <circle
                cx={centerX}
                cy={centerY}
                r={radius}
                stroke="#e5e7eb"
                strokeWidth={barWidth}
                fill="none"
                opacity="0.2"
              />
              {/* Value circle */}
              <circle
                cx={centerX}
                cy={centerY}
                r={radius}
                stroke={`url(#radial-gradient-${index})`}
                strokeWidth={barWidth}
                fill="none"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                strokeLinecap="round"
                transform={`rotate(-90 ${centerX} ${centerY})`}
                className="transition-all duration-[2000ms] ease-out"
                style={{ filter: `drop-shadow(0 0 6px ${item.color}40)` }}
              />
            </g>
          );
        })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <div className="text-4xl font-black bg-gradient-to-br from-blue-600 to-purple-600 bg-clip-text text-transparent">
          <AnimatedCounter end={88} suffix="%" />
        </div>
        <div className="text-xs font-semibold text-gray-500 mt-1">Average</div>
      </div>
    </div>
  );
}

// Premium Donut Chart
function PremiumDonutChart({
  data,
  size = 200
}: {
  data: { label: string; value: number; color: string }[];
  size?: number;
}) {
  const [animationProgress, setAnimationProgress] = useState(0);

  useEffect(() => {
    setTimeout(() => setAnimationProgress(1), 100);
  }, []);

  const total = data.reduce((sum, item) => sum + item.value, 0);
  const strokeWidth = 32;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  let accumulatedOffset = 0;

  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        <svg width={size} height={size} className="transform -rotate-90 filter drop-shadow-xl">
          <defs>
            {data.map((item, index) => (
              <linearGradient key={index} id={`donut-gradient-${index}`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={item.color} />
                <stop offset="100%" stopColor={item.color} stopOpacity="0.7" />
              </linearGradient>
            ))}
          </defs>
          {data.map((item, index) => {
            const percentage = item.value / total;
            const dashArray = `${percentage * circumference * animationProgress} ${circumference}`;
            const offset = -accumulatedOffset * animationProgress;
            accumulatedOffset += percentage * circumference;

            return (
              <circle
                key={index}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                stroke={`url(#donut-gradient-${index})`}
                strokeWidth={strokeWidth}
                fill="none"
                strokeDasharray={dashArray}
                strokeDashoffset={offset}
                className="transition-all duration-[2000ms] ease-out hover:stroke-width-[36] cursor-pointer"
                style={{ filter: `drop-shadow(0 0 8px ${item.color}40)` }}
              />
            );
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-3xl font-black bg-gradient-to-br from-purple-600 to-pink-600 bg-clip-text text-transparent">
            <AnimatedCounter end={total} />
          </div>
          <div className="text-xs font-semibold text-gray-500 mt-1">Total Cases</div>
        </div>
      </div>
      <div className="mt-6 space-y-2 w-full">
        {data.map((item, index) => (
          <div key={index} className="flex items-center justify-between text-sm group cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors">
            <div className="flex items-center gap-3">
              <div
                className="w-4 h-4 rounded-full shadow-lg transform group-hover:scale-125 transition-transform"
                style={{ backgroundColor: item.color, boxShadow: `0 0 12px ${item.color}80` }}
              />
              <span className="text-gray-700 font-medium group-hover:text-gray-900">{item.label}</span>
            </div>
            <span className="font-bold text-gray-900">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Theatre Performance Card with 3D Effect
function TheatrePerformanceCard({ theatre }: { theatre: { name: string; utilization: number; cases: number } }) {
  const [isHovered, setIsHovered] = useState(false);

  const getColor = () => {
    if (theatre.utilization >= 90) return { main: '#10b981', glow: '#10b98140', bg: 'bg-green-50', text: 'text-green-700' };
    if (theatre.utilization >= 85) return { main: '#3b82f6', glow: '#3b82f640', bg: 'bg-blue-50', text: 'text-blue-700' };
    if (theatre.utilization >= 80) return { main: '#f59e0b', glow: '#f59e0b40', bg: 'bg-orange-50', text: 'text-orange-700' };
    return { main: '#ef4444', glow: '#ef444440', bg: 'bg-red-50', text: 'text-red-700' };
  };

  const color = getColor();

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative group"
    >
      <div
        className={`hidden md:block absolute -inset-1 rounded-lg md:rounded-2xl opacity-0 group-hover:opacity-100 blur-lg transition-all duration-500`}
        style={{ background: color.glow }}
      />
      <div className={`relative flex flex-col items-center p-3 md:p-5 bg-white rounded-md md:rounded-2xl border border-gray-200 md:border-gray-100 md:shadow-md transition-all duration-500 ${isHovered ? 'md:transform md:scale-110 md:shadow-2xl' : ''}`}>
        {/* Mobile: Simple text-based design */}
        <div className="md:hidden w-full">
          <div className="flex items-center justify-between mb-2">
            <div className="text-xs font-semibold text-gray-900">{theatre.name}</div>
            <div className={`text-xs font-bold ${color.text}`}>{theatre.utilization}%</div>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-1.5 mb-1">
            <div className={`h-1.5 rounded-full ${color.bg.replace('bg-', 'bg-')}`} style={{ width: `${theatre.utilization}%`, backgroundColor: color.main }}></div>
          </div>
          <div className="text-[10px] text-gray-500">
            {theatre.cases} cases
          </div>
        </div>

        {/* Desktop: Circular progress */}
        <div className="hidden md:block">
          <PremiumCircularProgress
            value={theatre.utilization}
            size={60}
            strokeWidth={6}
            color={color.main}
            glowColor={color.main}
          />
          <div className="mt-2 md:mt-4 text-center">
            <div className="text-[10px] md:text-sm font-bold text-gray-900">{theatre.name}</div>
            <div className="text-[9px] md:text-xs text-gray-500 mt-0.5 md:mt-1">
              <AnimatedCounter end={theatre.cases} /> cases
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AnalyticsView({ onBack }: AnalyticsViewProps) {
  const router = useRouter();
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'quarter' | 'year'>('month');
  const [isConfigCollapsed, setIsConfigCollapsed] = useState(false);

  // Configuration state - what to display
  const [showTheatreUtilization, setShowTheatreUtilization] = useState(true);
  const [showStaffEfficiency, setShowStaffEfficiency] = useState(true);
  const [showEquipmentStatus, setShowEquipmentStatus] = useState(true);
  const [showProcedureVolume, setShowProcedureVolume] = useState(true);
  const [showSpecialtyDistribution, setShowSpecialtyDistribution] = useState(true);
  const [showTheatrePerformance, setShowTheatrePerformance] = useState(true);
  const [showQuickStats, setShowQuickStats] = useState(true);

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  const theatreUtilizationData = [
    { name: 'Theatre 1', utilization: 92, cases: 145 },
    { name: 'Theatre 2', utilization: 88, cases: 132 },
    { name: 'Theatre 3', utilization: 95, cases: 158 },
    { name: 'Theatre 4', utilization: 78, cases: 98 },
    { name: 'Theatre 5', utilization: 85, cases: 115 },
    { name: 'Theatre 6', utilization: 90, cases: 140 },
  ];

  const specialtyDistribution = [
    { label: 'Trauma & Ortho', value: 245, color: '#3b82f6' },
    { label: 'General Surgery', value: 198, color: '#8b5cf6' },
    { label: 'Neurosurgery', value: 65, color: '#f59e0b' },
    { label: 'ENT', value: 156, color: '#10b981' },
  ];

  const radialData = [
    { label: 'Theatre 1', value: 92, color: '#3b82f6' },
    { label: 'Theatre 2', value: 88, color: '#8b5cf6' },
    { label: 'Theatre 3', value: 95, color: '#10b981' },
    { label: 'Theatre 4', value: 78, color: '#f59e0b' },
  ];

  return (
    <div className="h-full flex flex-col md:flex-row bg-gray-50 overflow-hidden">
      {/* LEFT PANEL: Analytics Display Configuration - Desktop Only */}
      <div className={`hidden md:flex flex-col bg-white border-r border-gray-200 flex-shrink-0 transition-all duration-300 ${isConfigCollapsed ? 'w-12' : 'w-80'}`}>
        {!isConfigCollapsed ? (
          <>
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Analytics Configuration</h2>
                <p className="text-xs text-gray-600 mt-1">Customize your dashboard view</p>
              </div>
              <button
                onClick={() => setIsConfigCollapsed(true)}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                title="Collapse panel"
              >
                <ChevronLeft className="w-4 h-4 text-gray-600" />
              </button>
            </div>

        <div className="p-6 space-y-6">
          {/* Time Range */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Time Range</h3>
            <div className="grid grid-cols-2 gap-2">
              {(['week', 'month', 'quarter', 'year'] as const).map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                    timeRange === range
                      ? 'bg-blue-500 text-white shadow-sm'
                      : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  {range === 'week' ? 'Week' : range === 'month' ? 'Month' : range === 'quarter' ? 'Quarter' : 'Year'}
                </button>
              ))}
            </div>
          </div>

          {/* Metrics Display */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Metrics to Display</h3>
            <div className="space-y-2">
              <label className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showTheatreUtilization}
                  onChange={(e) => setShowTheatreUtilization(e.target.checked)}
                  className="w-4 h-4 text-blue-500 rounded"
                />
                <span className="text-sm text-gray-700">Theatre Utilization</span>
              </label>
              <label className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showStaffEfficiency}
                  onChange={(e) => setShowStaffEfficiency(e.target.checked)}
                  className="w-4 h-4 text-blue-500 rounded"
                />
                <span className="text-sm text-gray-700">Staff Efficiency</span>
              </label>
              <label className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showEquipmentStatus}
                  onChange={(e) => setShowEquipmentStatus(e.target.checked)}
                  className="w-4 h-4 text-blue-500 rounded"
                />
                <span className="text-sm text-gray-700">Equipment Status</span>
              </label>
              <label className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showProcedureVolume}
                  onChange={(e) => setShowProcedureVolume(e.target.checked)}
                  className="w-4 h-4 text-blue-500 rounded"
                />
                <span className="text-sm text-gray-700">Procedure Volume</span>
              </label>
              <label className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showSpecialtyDistribution}
                  onChange={(e) => setShowSpecialtyDistribution(e.target.checked)}
                  className="w-4 h-4 text-blue-500 rounded"
                />
                <span className="text-sm text-gray-700">Specialty Distribution</span>
              </label>
              <label className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showTheatrePerformance}
                  onChange={(e) => setShowTheatrePerformance(e.target.checked)}
                  className="w-4 h-4 text-blue-500 rounded"
                />
                <span className="text-sm text-gray-700">Theatre Performance</span>
              </label>
              <label className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showQuickStats}
                  onChange={(e) => setShowQuickStats(e.target.checked)}
                  className="w-4 h-4 text-blue-500 rounded"
                />
                <span className="text-sm text-gray-700">Quick Stats</span>
              </label>
            </div>
          </div>

            {/* Actions */}
            <div className="pt-4 border-t border-gray-200">
              <button className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-all shadow-sm">
                <Download className="w-4 h-4" />
                Export Report
              </button>
            </div>
          </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center py-6">
            <button
              onClick={() => setIsConfigCollapsed(false)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Expand panel"
            >
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        )}
      </div>

      {/* RIGHT PANEL: Insights Display */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Header */}
        <div className="md:hidden bg-white border-b border-gray-200 p-4">
          <h1 className="text-xl font-bold text-gray-900">Analytics Insights</h1>
          <p className="text-xs text-gray-600 mt-1">Real-time performance data</p>
        </div>

        {/* Desktop Header */}
        <div className="hidden md:block bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Insights</h1>
              <p className="text-sm text-gray-600 mt-1">Real-time performance analytics</p>
            </div>
            <button className="md:hidden flex items-center gap-2 px-4 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-all shadow-sm">
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>

        {/* Insights Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 pb-20 md:pb-6">
          <div className="space-y-4 md:space-y-6">
            {/* Interactive Flip Cards - Key Metrics */}
            {(showTheatreUtilization || showStaffEfficiency || showEquipmentStatus || showProcedureVolume) && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                {showTheatreUtilization && (
                  <FlipCard
                    title="Theatre Utilization"
                    value={88}
                    subtitle="Average across all theatres"
                    icon={Activity}
                    chartType="bar"
                    chartData={[92, 88, 95, 78, 85, 90]}
                    chartLabels={['Theatre 1', 'Theatre 2', 'Theatre 3', 'Theatre 4', 'Theatre 5', 'Theatre 6']}
                    trend="up"
                    color="blue"
                    insights={[
                      'Theatre 3 leads with 95% utilization, 158 completed cases',
                      'Theatre 4 underperforming at 78%, needs investigation',
                      'Overall utilization increased 3.2% from last period',
                      'Peak efficiency occurs Wednesday afternoons'
                    ]}
                    recommendations={[
                      'Redistribute cases from Theatre 3 to Theatre 4',
                      'Schedule complex procedures during peak hours',
                      'Review Theatre 4 turnover times for delays'
                    ]}
                  />
                )}

                {showStaffEfficiency && (
                  <FlipCard
                    title="Staff Efficiency"
                    value={92}
                    subtitle="On-time procedure starts"
                    icon={Users}
                    chartType="line"
                    chartData={[88, 89, 90, 91, 91, 92, 92]}
                    chartLabels={['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']}
                    trend="up"
                    color="emerald"
                    insights={[
                      '92% of procedures started on time, up 1.8%',
                      'Morning slots have 96% on-time rate vs 87% afternoon',
                      'Average setup time reduced by 8 minutes',
                      'Staff handovers improved coordination'
                    ]}
                    recommendations={[
                      'Apply morning protocols to afternoon shifts',
                      'Increase buffer time between complex cases',
                      'Standardize pre-op checklists across all theatres'
                    ]}
                  />
                )}

                {showEquipmentStatus && (
                  <FlipCard
                    title="Equipment Status"
                    value={95}
                    subtitle="Operational availability"
                    icon={Target}
                    chartType="gauge"
                    chartData={[95]}
                    trend="up"
                    color="purple"
                    insights={[
                      '95% equipment availability, 5% improvement',
                      'Preventive maintenance reduced downtime by 40%',
                      'Theatre 2 experienced 3 equipment delays this week',
                      'New sterilization workflow increased throughput'
                    ]}
                    recommendations={[
                      'Prioritize Theatre 2 equipment audit',
                      'Expand preventive maintenance schedule',
                      'Add backup equipment for critical instruments'
                    ]}
                  />
                )}

                {showProcedureVolume && (
                  <FlipCard
                    title="Procedure Volume"
                    value={1243}
                    subtitle="Cases completed this month"
                    icon={BarChart3}
                    chartType="bar"
                    chartData={[245, 198, 156, 65]}
                    chartLabels={['Trauma & Ortho', 'General Surgery', 'ENT', 'Neurosurgery']}
                    trend="up"
                    color="slate"
                    insights={[
                      '1,243 procedures completed, 12.5% increase',
                      'Trauma & Ortho leads with 245 cases (37%)',
                      'Average procedure duration reduced to 128 minutes',
                      'Cancellation rate decreased to 2.1%'
                    ]}
                    recommendations={[
                      'Optimize scheduling for high-volume specialties',
                      'Allocate additional resources to Trauma & Ortho',
                      'Continue cancellation reduction initiatives'
                    ]}
                  />
                )}
              </div>
            )}

            {/* Specialty Distribution with Donut Chart */}
            {showSpecialtyDistribution && (
              <div className="bg-white rounded-xl p-4 md:p-6 border border-gray-200 shadow-sm">
          <h2 className="text-base md:text-lg font-medium text-gray-900 mb-6 flex items-center gap-2">
            <Award className="w-5 h-5 text-purple-500" />
            Cases by Specialty
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Donut Chart */}
            <div className="flex items-center justify-center">
              <PremiumDonutChart data={specialtyDistribution} size={220} />
            </div>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 gap-3">
              {specialtyDistribution.map((item, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:border-gray-300 transition-all hover:scale-105 cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-4 h-4 rounded-full shadow-md"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-sm font-medium text-gray-700">{item.label}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold text-gray-900">{item.value}</div>
                      <div className="text-xs text-gray-500">cases</div>
                    </div>
                  </div>
                </div>
              ))}
              </div>
            </div>
              </div>
            )}

            {/* Theatre Performance Grid with Radial Chart */}
            {showTheatrePerformance && (
              <div className="bg-white rounded-xl p-4 md:p-6 border border-gray-200 shadow-sm">
          <h2 className="text-base md:text-lg font-medium text-gray-900 mb-6 flex items-center gap-2">
            <Target className="w-5 h-5 text-blue-500" />
            Individual Theatre Performance
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Radial Chart */}
            <div className="flex items-center justify-center">
              <PremiumRadialChart data={radialData} size={240} />
            </div>
            {/* Theatre Cards */}
            <div className="grid grid-cols-2 gap-3">
              {theatreUtilizationData.map((theatre) => {
                const getColor = () => {
                  if (theatre.utilization >= 90) return { bg: 'bg-emerald-400', text: 'text-emerald-600', border: 'border-emerald-200', light: 'bg-emerald-50' };
                  if (theatre.utilization >= 85) return { bg: 'bg-blue-400', text: 'text-blue-600', border: 'border-blue-200', light: 'bg-blue-50' };
                  if (theatre.utilization >= 80) return { bg: 'bg-orange-400', text: 'text-orange-600', border: 'border-orange-200', light: 'bg-orange-50' };
                  return { bg: 'bg-red-400', text: 'text-red-600', border: 'border-red-200', light: 'bg-red-50' };
                };
                const color = getColor();

                return (
                  <div key={theatre.name} className={`${color.light} rounded-lg p-3 border ${color.border} hover:border-gray-300 transition-all hover:scale-105 cursor-pointer`}>
                    <div className="text-xs font-medium text-gray-600 mb-2">{theatre.name}</div>
                    <div className={`text-xl font-bold ${color.text} mb-1`}>
                      <AnimatedCounter end={theatre.utilization} suffix="%" />
                    </div>
                    <div className="text-xs text-gray-500 mb-2">{theatre.cases} cases</div>
                    <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div className={`h-full ${color.bg} rounded-full transition-all`} style={{ width: `${theatre.utilization}%` }}></div>
                    </div>
                  </div>
                );
              })}
              </div>
            </div>
              </div>
            )}

            {/* Quick Stats */}
            {showQuickStats && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
          <div className="bg-white rounded-lg p-4 border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-emerald-100 rounded-lg">
                <TrendingUp className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <div className="text-xs text-gray-500">Top Performer</div>
                <div className="text-lg font-medium text-gray-900">Theatre 3</div>
              </div>
            </div>
            <div className="text-xs text-gray-600">95% utilization • 158 cases</div>
          </div>

          <div className="bg-white rounded-lg p-4 border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Clock className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <div className="text-xs text-gray-500">Avg Duration</div>
                <div className="text-lg font-medium text-gray-900">128 min</div>
              </div>
            </div>
            <div className="text-xs text-gray-600">3.8% reduction from last period</div>
          </div>

          <div className="bg-white rounded-lg p-4 border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-purple-100 rounded-lg">
                <CheckCircle className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <div className="text-xs text-gray-500">Cancellation Rate</div>
                <div className="text-lg font-medium text-gray-900">2.1%</div>
              </div>
            </div>
            <div className="text-xs text-gray-600">Below 3% target threshold</div>
          </div>
        </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
