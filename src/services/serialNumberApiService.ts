
import { supabase } from "@/integrations/supabase/client";
import { SerialNumber, CreateSerialNumberPayload, UpdateSerialNumberPayload, CreateClaimRequestPayload, ClaimRequest } from "@/types/serialNumberTypes";

const SERIAL_NUMBER_SELECT_QUERY = `
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

const CLAIM_REQUEST_SELECT_QUERY = `
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
  updated_at
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

const mapSupabaseDataToClaimRequest = (data: any): ClaimRequest => {
  if (!data) return data;
  return {
    ...data,
    evidence_image_urls: data.evidence_image_urls || [],
  };
};

// Admin function - fetch all serial numbers (no user filtering)
export const fetchSerialNumbersAPI = async (): Promise<SerialNumber[]> => {
  console.log('Fetching all serial numbers (admin view)');
  
  // Get current user to log for debugging
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    console.log('No authenticated user found');
    return [];
  }
  
  console.log('Current user fetching serials:', user?.id);
  
  // For admins, fetch ALL serial numbers without user filtering
  // RLS policies will handle the permission check
  const { data, error } = await supabase
    .from('serial_numbers')
    .select(SERIAL_NUMBER_SELECT_QUERY)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching serial numbers:', error);
    throw error;
  }
  
  console.log('Fetched serial numbers from DB:', data?.length || 0, 'records');
  console.log('Sample serial data:', data?.slice(0, 2));
  return (data || []).map(mapSupabaseDataToSerialNumber);
};

// Fetch available serial numbers for registration (status = 'available' and user_id is null)
export const fetchAvailableSerialNumbersAPI = async (): Promise<SerialNumber[]> => {
  console.log('Fetching available serial numbers for registration');
  
  const { data, error } = await supabase
    .from('serial_numbers')
    .select(SERIAL_NUMBER_SELECT_QUERY)
    .eq('status', 'available')
    .is('user_id', null)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching available serial numbers:', error);
    throw error;
  }
  
  console.log('Fetched available serial numbers:', data?.length || 0, 'records');
  return (data || []).map(mapSupabaseDataToSerialNumber);
};

// Admin function - create serial number
export const createSerialNumberAPI = async (
  serialData: CreateSerialNumberPayload
): Promise<SerialNumber> => {
  const { data, error } = await supabase
    .from('serial_numbers')
    .insert([serialData])
    .select(SERIAL_NUMBER_SELECT_QUERY)
    .single();

  if (error) throw error;
  if (!data) throw new Error("Failed to create serial number, no data returned.");
  return mapSupabaseDataToSerialNumber(data);
};

// Admin function - update serial number
export const updateSerialNumberAPI = async (
  id: string,
  serialData: UpdateSerialNumberPayload
): Promise<SerialNumber> => {
  console.log('Updating serial number:', id, 'with data:', serialData);
  
  const { data, error } = await supabase
    .from('serial_numbers')
    .update(serialData)
    .eq('id', id)
    .select(SERIAL_NUMBER_SELECT_QUERY)
    .single();

  if (error) {
    console.error('Error updating serial number:', error);
    throw error;
  }
  if (!data) throw new Error("Failed to update serial number, no data returned.");
  return mapSupabaseDataToSerialNumber(data);
};

// Admin function - delete serial number
export const deleteSerialNumberAPI = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('serial_numbers')
    .delete()
    .eq('id', id);

  if (error) throw error;
};

// User function - create claim request
export const createClaimRequestAPI = async (
  claimRequestData: CreateClaimRequestPayload
): Promise<ClaimRequest> => {
  const { data, error } = await supabase
    .from('claim_requests')
    .insert([claimRequestData])
    .select(CLAIM_REQUEST_SELECT_QUERY)
    .single();

  if (error) throw error;
  if (!data) throw new Error("Failed to create claim request, no data returned.");
  return mapSupabaseDataToClaimRequest(data);
};

// Upload evidence for claims
export const uploadClaimEvidenceAPI = async (
  file: File,
  serialNumberId: string
): Promise<string> => {
  const fileName = `${serialNumberId}/${Date.now()}-${file.name}`;
  const { data, error } = await supabase.storage
    .from('claim_evidence')
    .upload(fileName, file);

  if (error) throw error;
  
  // Get public URL
  const { data: publicUrlData } = supabase.storage
    .from('claim_evidence')
    .getPublicUrl(data.path);

  if (!publicUrlData || !publicUrlData.publicUrl) {
    throw new Error("Failed to get public URL for uploaded file.");
  }
  
  return publicUrlData.publicUrl;
};

// Function for users to validate and register serial numbers
export const validateAndRegisterSerialNumberAPI = async (
  serialNumber: string,
  registrationData: {
    customer_name: string;
    customer_email: string;
    customer_phone: string;
    purchase_source?: string;
    purchase_date?: string;
    purchase_receipt_url?: string;
  }
): Promise<SerialNumber> => {
  console.log('Validating and registering serial number:', serialNumber);
  
  // Get current user FIRST
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    console.error('User not authenticated:', userError);
    throw new Error('User not authenticated');
  }

  console.log('Current authenticated user:', user.id);
  
  // First validate the serial number using the database function
  const { data: validationData, error: validationError } = await supabase
    .rpc('validate_serial_number', { p_serial_number: serialNumber });

  if (validationError) {
    console.error('Validation error:', validationError);
    throw validationError;
  }

  if (!validationData || validationData.length === 0) {
    throw new Error('Serial number not found');
  }

  const serialRecord = validationData[0];

  if (serialRecord.status !== 'available') {
    throw new Error('Serial number is already registered or claimed');
  }

  // Register the serial number with EXPLICIT user_id
  const updateData = {
    ...registrationData,
    user_id: user.id,
    status: 'registered' as const,
    registration_date: new Date().toISOString().split('T')[0],
    updated_at: new Date().toISOString(),
  };

  console.log('Updating serial number with user_id:', user.id);
  return updateSerialNumberAPI(serialRecord.id, updateData);
};
