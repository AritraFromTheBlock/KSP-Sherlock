import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { FilterState } from '../components/analytics/FilterBar';
import { fetchCrimeAnalyticsData, CrimeAnalyticsData } from '../services/crimeAnalyticsApi';

interface CrimeAnalyticsContextProps {
  data: CrimeAnalyticsData | null;
  loading: boolean;
  error: Error | null;
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  refreshData: () => Promise<void>;
}

const CrimeAnalyticsContext = createContext<CrimeAnalyticsContextProps | undefined>(undefined);

export const CrimeAnalyticsProvider = ({ children }: { children: ReactNode }) => {
  const [filters, setFilters] = useState<FilterState>({
    dateRange: '30d',
    district: '',
    station: '',
    category: '',
    status: '',
    search: '',
  });

  const [data, setData] = useState<CrimeAnalyticsData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchCrimeAnalyticsData(filters);
      setData(result);
    } catch (err: any) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [filters]); // Re-fetch when filters change

  return (
    <CrimeAnalyticsContext.Provider value={{ data, loading, error, filters, setFilters, refreshData: loadData }}>
      {children}
    </CrimeAnalyticsContext.Provider>
  );
};

export const useCrimeAnalytics = () => {
  const context = useContext(CrimeAnalyticsContext);
  if (!context) {
    throw new Error('useCrimeAnalytics must be used within a CrimeAnalyticsProvider');
  }
  return context;
};
