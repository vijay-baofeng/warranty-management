
import { supabase } from "@/integrations/supabase/client";
import { ClaimRequest, CreateClaimRequestPayload } from "@/types/serialNumberTypes";
import type { Json } from "@/integrations/supabase/types";

const CLAIM_REQUEST_WITH_SERIAL_SELECT_QUERY = `
  id,
  serial_number_id,
  complaint_title,
  complaint_date,
  issue_type,
  expected_resolution_date,
  description,
  customer_note,
  evidence_image_urls,
  created_at,
  updated_at,
  serial_numbers (
    id,
    serial_number,
    customer_name,
    customer_email,
    customer_phone,
    status,
    user_id,
    products (
      id,
      name,
      manufacturer_name
    )
  )
`;

// Helper function to transform raw database response to ClaimRequest type
const transformClaimRequest = (rawData: any): ClaimRequest => {
  return {
    ...rawData,
    evidence_image_urls: rawData.evidence_image_urls 
      ? (Array.isArray(rawData.evidence_image_urls) 
          ? rawData.evidence_image_urls 
          : JSON.parse(rawData.evidence_image_urls as string))
      : null,
    serial_number: rawData.serial_numbers ? {
      id: rawData.serial_numbers.id,
      serial_number: rawData.serial_numbers.serial_number,
      customer_name: rawData.serial_numbers.customer_name,
      customer_email: rawData.serial_numbers.customer_email,
      customer_phone: rawData.serial_numbers.customer_phone,
      status: rawData.serial_numbers.status,
      user_id: rawData.serial_numbers.user_id,
      product_id: '', // This will be filled from products relation
      created_at: '',
      updated_at: '',
      products: rawData.serial_numbers.products
    } : undefined
  };
};

// This function will automatically respect RLS policies - admins see all, users see only their own
export const fetchAllClaimRequestsAPI = async (): Promise<ClaimRequest[]> => {
  console.log('Fetching claim requests with RLS policies applied');
  
  const { data, error } = await supabase
    .from('claim_requests')
    .select(CLAIM_REQUEST_WITH_SERIAL_SELECT_QUERY)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching claim requests:', error);
    throw error;
  }
  
  console.log('Fetched claim requests:', data?.length || 0, 'records');
  return data ? data.map(transformClaimRequest) : [];
};

export const fetchClaimRequestByIdAPI = async (id: string): Promise<ClaimRequest | null> => {
  console.log('Fetching claim request by ID:', id);
  
  const { data, error } = await supabase
    .from('claim_requests')
    .select(CLAIM_REQUEST_WITH_SERIAL_SELECT_QUERY)
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching claim request:', error);
    throw error;
  }
  
  return data ? transformClaimRequest(data) : null;
};

// Function to fetch claim requests for the current user specifically
export const fetchUserClaimRequestsAPI = async (): Promise<ClaimRequest[]> => {
  console.log('Fetching current user claim requests');
  
  // Get current user
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    console.error('User not authenticated');
    throw new Error('User not authenticated');
  }

  const { data, error } = await supabase
    .from('claim_requests')
    .select(CLAIM_REQUEST_WITH_SERIAL_SELECT_QUERY)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching user claim requests:', error);
    throw error;
  }
  
  console.log('Fetched user claim requests:', data?.length || 0, 'records');
  return data ? data.map(transformClaimRequest) : [];
};

// Create a new claim request
export const createClaimRequestAPI = async (payload: CreateClaimRequestPayload): Promise<ClaimRequest> => {
  console.log('Creating claim request:', payload);
  
  const { data, error } = await supabase
    .from('claim_requests')
    .insert([payload])
    .select(CLAIM_REQUEST_WITH_SERIAL_SELECT_QUERY)
    .single();

  if (error) {
    console.error('Error creating claim request:', error);
    throw error;
  }
  
  console.log('Created claim request:', data);
  return transformClaimRequest(data);
};
