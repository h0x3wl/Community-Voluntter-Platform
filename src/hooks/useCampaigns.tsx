import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { api } from '../lib/api';

interface CampaignsContextType {
    campaigns: any[];
    isLoading: boolean;
    error: string | null;
}

const CampaignsContext = createContext<CampaignsContextType>({
    campaigns: [],
    isLoading: true,
    error: null,
});

/**
 * Provides a single shared campaigns fetch for all landing page components.
 * This eliminates duplicate API calls from Hero, Stats, and FeaturedCampaigns.
 */
export function CampaignsProvider({ children }: { children: ReactNode }) {
    const [campaigns, setCampaigns] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;

        const fetchCampaigns = async () => {
            try {
                const res = await api.getCampaigns();
                if (!cancelled) {
                    setCampaigns(res.data || []);
                }
            } catch (err: any) {
                if (!cancelled) {
                    setError(err.message || 'Failed to fetch campaigns');
                    console.error('Failed to fetch campaigns', err);
                }
            } finally {
                if (!cancelled) {
                    setIsLoading(false);
                }
            }
        };

        fetchCampaigns();

        return () => {
            cancelled = true;
        };
    }, []);

    return (
        <CampaignsContext.Provider value={{ campaigns, isLoading, error }}>
            {children}
        </CampaignsContext.Provider>
    );
}

/**
 * Hook to consume the shared campaigns data.
 * Must be used within a <CampaignsProvider>.
 */
export function useCampaigns() {
    const context = useContext(CampaignsContext);
    if (!context) {
        throw new Error('useCampaigns must be used within a CampaignsProvider');
    }
    return context;
}
