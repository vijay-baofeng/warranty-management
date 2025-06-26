
import * as z from 'zod';

export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
export const ACCEPTED_FILE_TYPES = ["image/jpeg", "image/png", "application/pdf"];

export const purchaseSources = ["Amazon", "Flipkart", "Retail Store", "Direct Purchase", "Other"];

export const formSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  mobile: z.string().min(10, "Mobile number must be at least 10 digits").regex(/^\d+$/, "Invalid mobile number"),
  email: z.string().email("Invalid email address"),
  purchaseSource: z.string().min(1, "Purchase source is required"),
  purchaseDate: z.date({ required_error: "Purchase date is required" }),
  purchaseReceipt: z
    .custom<FileList>((val) => val instanceof FileList && val.length > 0, "Purchase receipt is required.")
    .refine((files) => files?.[0]?.size <= MAX_FILE_SIZE, `Max file size is 5MB.`)
    .refine(
      (files) => ACCEPTED_FILE_TYPES.includes(files?.[0]?.type),
      "Only .jpg, .png, and .pdf files are accepted."
    ),
  address: z.string().min(1, "Address is required"),
});

export type WarrantyFormValues = z.infer<typeof formSchema>;
