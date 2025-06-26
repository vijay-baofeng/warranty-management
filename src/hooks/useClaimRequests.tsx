
import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { ClaimRequest } from "@/types/serialNumberTypes";
import { fetchAllClaimRequestsAPI, fetchUserClaimRequestsAPI } from "@/services/claimRequestApiService";
import { useAuth } from "@/providers/AuthProvider";

export function useClaimRequests() {
  const [claimRequests, setClaimRequests] = useState<ClaimRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user, role, loading: authLoading } = useAuth();

  const fetchClaimRequests = useCallback(async () => {
    if (!user) {
      console.log('No user found, clearing claim requests');
      setClaimRequests([]);
      setLoading(false);
      return;
    }
    
    setLoading(true);
    try {
      console.log('Fetching claim requests for user:', user.id, 'with role:', role);
      
      let data: ClaimRequest[];
      
      // Both admin and regular users can use the same API call
      // RLS policies will automatically filter the results
      data = await fetchAllClaimRequestsAPI();
      
      console.log('Successfully fetched claim requests:', data.length, 'for user:', user.id);
      setClaimRequests(data);
    } catch (error) {
      console.error('Error fetching claim requests:', error);
      toast({
        title: "Error",
        description: "Failed to fetch claim requests",
        variant: "destructive",
      });
      setClaimRequests([]);
    } finally {
      setLoading(false);
    }
  }, [toast, user, role]);

  useEffect(() => {
    if (authLoading) {
      console.log('Auth loading, waiting...');
      setLoading(true);
      setClaimRequests([]);
      return;
    }

    if (user) {
      console.log('User authenticated, fetching claim requests for user:', user.id);
      fetchClaimRequests();
    } else {
      console.log('No user, clearing claim requests');
      setClaimRequests([]);
      setLoading(false);
    }
  }, [user, role, authLoading, fetchClaimRequests]);

  return {
    claimRequests,
    loading,
    fetchClaimRequests,
    refreshClaimRequests: fetchClaimRequests,
  };
}
