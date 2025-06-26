
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { ClaimFormHeader } from './claim-request-form/ClaimFormHeader';
import { ClaimFormDatePicker } from './claim-request-form/ClaimFormDatePicker';
import { ClaimFormSelect } from './claim-request-form/ClaimFormSelect';
import { ClaimFormImageUpload } from './claim-request-form/ClaimFormImageUpload';

const MAX_IMAGES = 4; // Keep these constants if ClaimFormImageUpload doesn't export them
const MAX_FILE_SIZE_MB = 5;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

const claimRequestFormSchema = z.object({
  complaint_title: z.string().min(5, { message: "Complaint title must be at least 5 characters." }),
  complaint_date: z.date({ required_error: "Complaint date is required." }),
  issue_type: z.string().min(1, { message: "Please select an issue type." }),
  expected_resolution_date: z.date().optional().nullable(),
  description: z.string().optional().nullable(),
  customer_note: z.string().optional().nullable(),
  evidence_images: z.array(z.instanceof(File))
    .max(MAX_IMAGES, { message: `You can upload a maximum of ${MAX_IMAGES} images.` })
    .refine(files => files.every(file => file.size <= MAX_FILE_SIZE_BYTES), {
      message: `Each file size should be less than ${MAX_FILE_SIZE_MB}MB.`,
    })
    .optional(),
});

export type ClaimRequestFormValues = z.infer<typeof claimRequestFormSchema>;

interface ClaimRequestFormProps {
  onSubmit: (values: ClaimRequestFormValues) => Promise<void>;
  onBack: () => void;
  isLoading: boolean;
  serialNumber?: string;
}

const issueTypes = [
  "Hardware Malfunction",
  "Software Issue",
  "Accidental Damage",
  "Performance Degradation",
  "Connectivity Problem",
  "Battery Issue",
  "Display Anomaly",
  "Other",
].map(type => ({ value: type, label: type }));

export function ClaimRequestForm({ onSubmit, onBack, isLoading, serialNumber }: ClaimRequestFormProps) {
  const form = useForm<ClaimRequestFormValues>({
    resolver: zodResolver(claimRequestFormSchema),
    defaultValues: {
      complaint_title: '',
      complaint_date: new Date(),
      issue_type: '',
      expected_resolution_date: null,
      description: '',
      customer_note: '',
      evidence_images: [],
    },
  });
  
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  // useEffect to revoke object URLs on unmount
  React.useEffect(() => {
    return () => {
      imagePreviews.forEach(url => URL.revokeObjectURL(url));
    };
  }, [imagePreviews]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <ClaimFormHeader onBack={onBack} isLoading={isLoading} serialNumber={serialNumber} />

        <FormField
          control={form.control}
          name="complaint_title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Complaint Title</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Screen flickering issue" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ClaimFormDatePicker
            control={form.control}
            name="complaint_date"
            label="Complaint Date"
            disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
          />
          <ClaimFormSelect
            control={form.control}
            name="issue_type"
            label="Issue Type"
            placeholder="Select an issue type"
            options={issueTypes}
          />
        </div>
        
        <ClaimFormDatePicker
          control={form.control}
          name="expected_resolution_date"
          label="Expected Resolution Date (Optional)"
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description (Optional)</FormLabel>
              <FormControl>
                <Textarea placeholder="Detailed description of the issue..." {...field} value={field.value ?? ""} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="customer_note"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Customer Note (Optional)</FormLabel>
              <FormControl>
                <Textarea placeholder="Since when you facing issue (DD/MM/YYYY)" {...field} value={field.value ?? ""} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <ClaimFormImageUpload
          form={form}
          name="evidence_images"
          imagePreviews={imagePreviews}
          setImagePreviews={setImagePreviews}
          isLoading={isLoading}
        />

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? 'Submitting...' : 'Submit Claim Request'}
        </Button>
      </form>
    </Form>
  );
}

