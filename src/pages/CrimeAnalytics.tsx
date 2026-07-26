import React from 'react';
import FilterBar from '../components/analytics/FilterBar';
import KPISection from '../components/analytics/KPISection';
import CrimeTrendChart from '../components/analytics/CrimeTrendChart';
import CategoryChart from '../components/analytics/CategoryChart';
import TemporalHeatmap from '../components/analytics/TemporalHeatmap';
import CrimeHotspotMap from '../components/analytics/CrimeHotspotMap';
import StationPerformance from '../components/analytics/StationPerformance';
import PredictionCard from '../components/analytics/PredictionCard';
import AIInsights from '../components/analytics/AIInsights';
import { CrimeAnalyticsProvider } from '../context/CrimeAnalyticsContext';

export default function CrimeAnalytics() {
  return (
    <CrimeAnalyticsProvider>
      <div className="p-4 sm:p-6 max-w-[1600px] mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-display font-bold text-slate-200">Intelligence & Analytics</h1>
            <p className="text-sm text-slate-400 mt-1">Real-time spatial analysis and predictive modeling</p>
          </div>
        </div>

        {/* Global Filters */}
        <FilterBar />

        {/* Top KPIs */}
        <KPISection />

        {/* Map - Full Width Centerpiece */}
        <div className="w-full">
          <CrimeHotspotMap />
        </div>

        {/* Analytics Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Row 1: Trend (2/3) & Category (1/3) */}
          <div className="lg:col-span-2">
            <CrimeTrendChart />
          </div>
          <div className="lg:col-span-1">
            <CategoryChart />
          </div>

          {/* Row 2: Heatmap (2/3) & Prediction (1/3) */}
          <div className="lg:col-span-2">
            <TemporalHeatmap />
          </div>
          <div className="lg:col-span-1">
            <PredictionCard />
          </div>

          {/* Row 3: Performance (2/3) & AI Insights (1/3) */}
          <div className="lg:col-span-2">
            <StationPerformance />
          </div>
          <div className="lg:col-span-1">
            <AIInsights />
          </div>

        </div>
      </div>
    </CrimeAnalyticsProvider>
  );
}