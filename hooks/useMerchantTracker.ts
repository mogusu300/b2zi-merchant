import { useState, useEffect, useCallback } from 'react';
import { isTokenExpired, ensureHunterTokenValid } from '../lib/tokenManager';

interface Merchant {
  id: string;
  merchantId: string;
  businessName: string;
  ownerName: string;
  email: string;
  phone: string;
  businessType?: string;
  status: string;
  merchantStatus: string;
  isVerified: boolean;
  onboardingStartedAt: Date;
  completedAt?: Date;
  onboardingDaysElapsed: number;
  documents: any[];
  activityLog: any[];
}

interface HunterMerchantsResponse {
  success: boolean;
  hunterId: string;
  summary: {
    totalMerchants: number;
    onboarded: number;
    inProgress: number;
    notStarted: number;
    rejected: number;
  };
  merchants: Merchant[];
}

export function useMerchantTracker(hunterId: string | null) {
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [summary, setSummary] = useState({
    totalMerchants: 0,
    onboarded: 0,
    inProgress: 0,
    notStarted: 0,
    rejected: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMerchants = useCallback(async () => {
    if (!hunterId) {
      console.warn('⚠️ hunterId is not set, trying to fetch all merchants instead');
      // Fallback: fetch all merchants
      setLoading(true);
      setError(null);
      try {
        const url = `/api/merchants-all`;
        console.log('📡 Fetching all merchants from:', url);
        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error(`API returned ${response.status}`);
        }

        const data: HunterMerchantsResponse = await response.json();
        console.log('✅ All merchants fetched:', data.merchants.length);
        
        if (data.success) {
          setMerchants(data.merchants);
          setSummary(data.summary);
        } else {
          setError('Failed to fetch merchants');
        }
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'An error occurred';
        setError(errorMsg);
        console.error('❌ Error fetching merchants:', errorMsg);
      } finally {
        setLoading(false);
      }
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // ✅ NEW: Check token expiration before fetch
      const token = localStorage.getItem('hunterToken');
      if (token && isTokenExpired(token, 5)) {
        console.log('[MERCHANT TRACKER] ⚠️  Token expired or expiring soon, attempting refresh...');
        const validToken = await ensureHunterTokenValid();
        if (!validToken) {
          console.error('[MERCHANT TRACKER] ❌ Token refresh failed - clearing session');
          setError('Your session has expired. Please log in again.');
          return;
        }
        console.log('[MERCHANT TRACKER] ✅ Token refreshed successfully');
      }
      
      const url = `/api/merchant-hunters/${hunterId}/merchants`;
      console.log('📡 Fetching merchants from:', url);
      
      const response = await fetch(url);
      
      if (!response.ok) {
        const text = await response.text();
        console.error('❌ API Error:', response.status, response.statusText);
        console.error('Response:', text.substring(0, 200));
        throw new Error(`API returned ${response.status}: ${response.statusText}`);
      }

      const data: HunterMerchantsResponse = await response.json();
      console.log('✅ Merchants fetched:', data.merchants.length);
      console.log('Activity logs per merchant:', data.merchants.map(m => ({ 
        merchant: m.businessName, 
        logs: m.activityLog.length 
      })));
      
      if (data.success) {
        setMerchants(data.merchants);
        setSummary(data.summary);
      } else {
        setError('Failed to fetch merchants');
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMsg);
      console.error('❌ Error fetching merchants:', errorMsg);
    } finally {
      setLoading(false);
    }
  }, [hunterId]);

  // Initial fetch
  useEffect(() => {
    fetchMerchants();
  }, [fetchMerchants]);

  // Poll for live updates every 30 seconds
  useEffect(() => {
    if (!hunterId) return;

    const interval = setInterval(() => {
      fetchMerchants();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [hunterId, fetchMerchants]);

  const updateMerchantStatus = useCallback(
    async (merchantId: string, newStatus: string, merchantStatus?: string) => {
      if (!hunterId) return;

      try {
        console.log('🔄 Calling PUT endpoint:', {
          url: `/api/merchant-hunters/${hunterId}/merchants/${merchantId}`,
          body: { status: newStatus, merchantStatus }
        });

        const response = await fetch(
          `/api/merchant-hunters/${hunterId}/merchants/${merchantId}`,
          {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus, merchantStatus }),
          }
        );

        if (!response.ok) {
          throw new Error('Failed to update status');
        }

        const result = await response.json();
        console.log('✅ Update response:', result);

        // Wait a moment then refresh to ensure database is updated
        await new Promise(resolve => setTimeout(resolve, 500));
        await fetchMerchants();
        return true;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to update status');
        console.error('❌ Update error:', err);
        return false;
      }
    },
    [hunterId, fetchMerchants]
  );

  const refreshData = useCallback(() => {
    return fetchMerchants();
  }, [fetchMerchants]);

  // Fetch activity logs for a specific merchant
  const fetchActivityLogs = useCallback(async (merchantId: string) => {
    try {
      // ✅ NEW: Check token expiration before fetch
      const token = localStorage.getItem('hunterToken');
      if (token && isTokenExpired(token, 5)) {
        console.log('[ACTIVITY LOGS] ⚠️  Token expired or expiring soon, attempting refresh...');
        const validToken = await ensureHunterTokenValid();
        if (!validToken) {
          console.error('[ACTIVITY LOGS] ❌ Token refresh failed - cannot fetch logs');
          return [];
        }
        console.log('[ACTIVITY LOGS] ✅ Token refreshed successfully');
      }
      
      const response = await fetch(`/api/merchants/${merchantId}/activity-logs-simple`);
      if (!response.ok) throw new Error('Failed to fetch logs');
      
      const data = await response.json();
      console.log(`📋 Fetched ${data.logs.length} logs for merchant ${merchantId}`);
      return data.logs;
    } catch (err) {
      console.error('Error fetching activity logs:', err);
      return [];
    }
  }, []);

  return {
    merchants,
    summary,
    loading,
    error,
    updateMerchantStatus,
    refreshData,
    fetchActivityLogs,
  };
}
