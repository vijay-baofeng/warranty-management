
import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { SerialNumber, CreateSerialNumberPayload, UpdateSerialNumberPayload, CreateClaimRequestPayload } from "@/types/serialNumberTypes";
import { 
  fetchSerialNumbersAPI, 
  fetchAvailableSerialNumbersAPI,
  createSerialNumberAPI, 
  updateSerialNumberAPI, 
  deleteSerialNumberAPI,
  validateAndRegisterSerialNumberAPI
} from "@/services/serialNumberApiService";
import { createClaimRequestAPI } from "@/services/claimRequestApiService";
import { useAuth } from "@/providers/AuthProvider";

export function useSerialNumbers() {
  const [serialNumbers, setSerialNumbers] = useState<SerialNumber[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user, role, loading: authLoading } = useAuth();

  const fetchSerialNumbers = useCallback(async () => {
    // Only admins can fetch serial numbers for management
    if (!user) {
      console.log('No user found, clearing serial numbers');
      setSerialNumbers([]);
      setLoading(false);
      return;
    }

    if (role !== 'admin') {
      console.log('User is not admin, cannot fetch serial numbers for management');
      setSerialNumbers([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      console.log('Fetching all serial numbers for admin:', user.id);
      
      // Admin can see all serial numbers
      const data = await fetchSerialNumbersAPI();
      
      console.log('Received serial numbers from API:', data.length);
      setSerialNumbers(data);
      console.log('Admin can see', data.length, 'serial numbers');
    } catch (error) {
      console.error('Error fetching serial numbers:', error);
      toast({
        title: "Error",
        description: "Failed to fetch serial numbers",
        variant: "destructive",
      });
      setSerialNumbers([]);
    } finally {
      setLoading(false);
    }
  }, [toast, user, role]);

  // Separate function for fetching available serial numbers for registration
  const fetchAvailableSerialNumbers = useCallback(async (): Promise<SerialNumber[]> => {
    try {
      console.log('Fetching available serial numbers for registration');
      const data = await fetchAvailableSerialNumbersAPI();
      console.log('Found available serial numbers:', data.length);
      return data;
    } catch (error) {
      console.error('Error fetching available serial numbers:', error);
      toast({
        title: "Error",
        description: "Failed to fetch available serial numbers",
        variant: "destructive",
      });
      return [];
    }
  }, [toast]);

  // Admin only - create serial number
  const createSerialNumber = useCallback(async (serialData: CreateSerialNumberPayload) => {
    if (role !== 'admin') {
      toast({
        title: "Access Denied",
        description: "Only administrators can create serial numbers",
        variant: "destructive",
      });
      throw new Error('Access denied');
    }

    try {
      console.log('Creating serial number:', serialData);
      const newSerial = await createSerialNumberAPI(serialData);
      setSerialNumbers(prev => [newSerial, ...prev]);
      toast({
        title: "Success",
        description: "Serial number created successfully",
      });
      return newSerial;
    } catch (error) {
      console.error('Error creating serial number:', error);
      toast({
        title: "Error", 
        description: "Failed to create serial number",
        variant: "destructive",
      });
      throw error;
    }
  }, [toast, role]);

  // Admin only - update serial number
  const updateSerialNumber = useCallback(async (id: string, serialData: UpdateSerialNumberPayload) => {
    if (role !== 'admin') {
      toast({
        title: "Access Denied",
        description: "Only administrators can update serial numbers",
        variant: "destructive",
      });
      throw new Error('Access denied');
    }

    try {
      console.log('Updating serial number:', id, serialData);
      const updatedSerial = await updateSerialNumberAPI(id, serialData);
      setSerialNumbers(prev => prev.map(serial => serial.id === id ? updatedSerial : serial));
      toast({
        title: "Success",
        description: "Serial number updated successfully",
      });
      return updatedSerial;
    } catch (error) {
      console.error('Error updating serial number:', error);
      toast({
        title: "Error",
        description: "Failed to update serial number",
        variant: "destructive",
      });
      throw error;
    }
  }, [toast, role]);

  // Admin only - delete serial number
  const deleteSerialNumber = useCallback(async (id: string) => {
    if (role !== 'admin') {
      toast({
        title: "Access Denied",
        description: "Only administrators can delete serial numbers",
        variant: "destructive",
      });
      throw new Error('Access denied');
    }

    try {
      console.log('Deleting serial number:', id);
      await deleteSerialNumberAPI(id);
      setSerialNumbers(prev => prev.filter(serial => serial.id !== id));
      toast({
        title: "Success",
        description: "Serial number deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting serial number:', error);
      toast({
        title: "Error",
        description: "Failed to delete serial number",
        variant: "destructive",
      });
      throw error;
    }
  }, [toast, role]);

  // User function - register serial number
  const registerSerialNumber = useCallback(async (
    serialNumber: string,
    registrationData: {
      customer_name: string;
      customer_email: string;
      customer_phone: string;
      purchase_source?: string;
      purchase_date?: string;
      purchase_receipt_url?: string;
    }
  ) => {
    try {
      console.log('Registering serial number for user:', user?.id, serialNumber);
      if (!user) {
        throw new Error('User not authenticated');
      }
      
      const registeredSerial = await validateAndRegisterSerialNumberAPI(serialNumber, registrationData);
      
      toast({
        title: "Success",
        description: "Serial number registered successfully",
      });
      return registeredSerial;
    } catch (error) {
      console.error('Error registering serial number:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to register serial number",
        variant: "destructive",
      });
      throw error;
    }
  }, [toast, user]);

  // User function - create claim request
  const createClaimRequestAndLinkToSerial = useCallback(async (claimData: CreateClaimRequestPayload, serialNumberId: string) => {
    try {
      console.log('Creating claim request for user:', user?.id, 'serial:', serialNumberId);
      
      if (!user) {
        throw new Error('User not authenticated');
      }
      
      console.log('Creating claim request with proper user validation');
      
      // Create the claim request
      const newClaimRequest = await createClaimRequestAPI(claimData);
      
      // Update the serial number status to 'claimed' (this will work for users on their own serials)
      await updateSerialNumberAPI(serialNumberId, { 
        status: 'claimed',
        claim_request_id: newClaimRequest.id 
      });
      
      // Update local state if this is admin view
      if (role === 'admin') {
        setSerialNumbers(prev => prev.map(serial => 
          serial.id === serialNumberId 
            ? { ...serial, status: 'claimed', claim_request_id: newClaimRequest.id }
            : serial
        ));
      }
      
      toast({
        title: "Success",
        description: "Claim request created successfully",
      });
      
      return newClaimRequest;
    } catch (error) {
      console.error('Error creating claim request:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create claim request",
        variant: "destructive",
      });
      throw error;
    }
  }, [toast, user, role]);

  // Load data when user authenticates and is admin
  useEffect(() => {
    if (authLoading) {
      console.log('Auth loading, waiting...');
      setLoading(true);
      setSerialNumbers([]);
      return;
    }

    if (user && role === 'admin') {
      console.log('Admin user authenticated, fetching serial numbers for user:', user.id);
      fetchSerialNumbers();
    } else {
      console.log('User is not admin or not authenticated, clearing serial numbers');
      setSerialNumbers([]);
      setLoading(false);
    }
  }, [user, role, authLoading, fetchSerialNumbers]);

  return {
    serialNumbers,
    loading,
    createSerialNumber,
    updateSerialNumber,
    deleteSerialNumber,
    registerSerialNumber,
    fetchAvailableSerialNumbers,
    createClaimRequestAndLinkToSerial,
    refreshSerialNumbers: fetchSerialNumbers,
  };
}
