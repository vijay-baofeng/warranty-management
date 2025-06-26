
import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { SerialNumber } from "@/types/serialNumberTypes";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/providers/AuthProvider";

const USER_SERIAL_NUMBER_SELECT_QUERY = `
  id,
  serial_number,
  product_id,
  status,
  customer_name,
  customer_email,
  customer_phone,
  registration_date,
  created_at,
  updated_at,
  purchase_source,
  purchase_date,
  purchase_receipt_url,
  claim_request_id,
  user_id,
  products (
    id,
    name,
    manufacturer_name,
    description,
    serial_no_prefix,
    warranty_duration
  )
`;

const mapSupabaseDataToSerialNumber = (data: any): SerialNumber => {
  if (!data) return data;
  return {
    ...data,
    status: data.status as 'available' | 'registered' | 'claimed',
    products: data.products ? {
        id: data.products.id,
        name: data.products.name,
        manufacturer_name: data.products.manufacturer_name,
        description: data.products.description,
        serial_no_prefix: data.products.serial_no_prefix,
        warranty_duration: data.products.warranty_duration,
    } : undefined,
  };
};

export function useUserWarranties() {
  const [userWarranties, setUserWarranties] = useState<SerialNumber[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();

  const fetchUserWarranties = useCallback(async () => {
    if (!user) {
      console.log('No user found, clearing user warranties');
      setUserWarranties([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      console.log('Fetching user warranties for user:', user.id);
      
      // Fetch serial numbers that belong to the current user
      // RLS policies will automatically filter to show only user's own warranties
      const { data, error } = await supabase
        .from('serial_numbers')
        .select(USER_SERIAL_NUMBER_SELECT_QUERY)
        .eq('user_id', user.id)
        .in('status', ['registered', 'claimed'])
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching user warranties:', error);
        throw error;
      }
      
      const warranties = (data || []).map(mapSupabaseDataToSerialNumber);
      console.log('Successfully fetched user warranties:', warranties.length);
      setUserWarranties(warranties);
    } catch (error) {
      console.error('Error fetching user warranties:', error);
      toast({
        title: "Error",
        description: "Failed to fetch your warranties",
        variant: "destructive",
      });
      setUserWarranties([]);
    } finally {
      setLoading(false);
    }
  }, [toast, user]);

  useEffect(() => {
    if (authLoading) {
      console.log('Auth loading, waiting...');
      setLoading(true);
      setUserWarranties([]);
      return;
    }

    if (user) {
      console.log('User authenticated, fetching warranties for user:', user.id);
      fetchUserWarranties();
    } else {
      console.log('No user, clearing warranties');
      setUserWarranties([]);
      setLoading(false);
    }
  }, [user, authLoading, fetchUserWarranties]);

  return {
    userWarranties,
    loading,
    refreshUserWarranties: fetchUserWarranties,
  };
}
