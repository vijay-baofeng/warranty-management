
export type SerialStatus = "available" | "registered" | "claimed" | "approved" | "in-review" | "rejected" | "require-more-info";

export interface SerialNumber {
  id: string;
  serial_number: string;
  product_id: string;
  status: SerialStatus;
  customer_name?: string | null;
  customer_email?: string | null;
  customer_phone?: string | null;
  registration_date?: string | null;
  created_at: string;
  updated_at: string;
  products?: {
    id: string;
    name: string;
    manufacturer_name: string;
    description?: string;
    serial_no_prefix?: string;
    warranty_duration?: number;
  };
  purchase_source?: string | null;
  purchase_date?: string | null;
  purchase_receipt_url?: string | null;
  claim_request_id?: string | null;
  user_id?: string | null;
}

// Type for creating a serial number, excluding auto-generated fields and products relation
export type CreateSerialNumberPayload = Omit<SerialNumber, 'id' | 'created_at' | 'updated_at' | 'products' | 'claim_request_id'> & {
  // Explicitly allow these to be set, even if they can be null in the main type
  registration_date?: string | null;
  purchase_date?: string | null;
};

// Type for updating a serial number, products relation is handled by product_id
export type UpdateSerialNumberPayload = Partial<Omit<SerialNumber, 'products' | 'created_at' | 'updated_at'>>;

export interface ClaimRequest {
  id: string;
  serial_number_id: string;
  complaint_title: string;
  complaint_date: string; // YYYY-MM-DD
  issue_type: string;
  expected_resolution_date?: string | null; // YYYY-MM-DD
  description?: string | null;
  customer_note?: string | null;
  evidence_image_urls?: string[] | null; // Array of URLs
  created_at: string;
  updated_at: string;
  serial_number?: SerialNumber; // Optional, for joining with serial number data
}

export type CreateClaimRequestPayload = Omit<ClaimRequest, 'id' | 'created_at' | 'updated_at' | 'serial_number'>;

export interface ExtendedSerialNumber extends SerialNumber {
  productName?: string;
  model?: string;
  expiryDate?: Date | null;
  daysLeft?: number | null;
  warrantyDurationText?: string;
}
