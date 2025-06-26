
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { SerialNumber } from "@/types/serialNumberTypes";
import { useSerialNumbers } from '@/hooks/useSerialNumbers';
import { useAuth } from '@/providers/AuthProvider';
import { formSchema, WarrantyFormValues } from './warranty-registration-form/warrantyRegistrationSchema';
import { WarrantyFormFields } from './warranty-registration-form/WarrantyFormFields';

interface WarrantyRegistrationFormProps {
  serialData: SerialNumber;
  onSuccess: (updatedSerial: SerialNumber) => void;
}

export function WarrantyRegistrationForm({ serialData, onSuccess }: WarrantyRegistrationFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { registerSerialNumber } = useSerialNumbers();
  const { user } = useAuth();

  const form = useForm<WarrantyFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      mobile: "",
      email: "",
      purchaseSource: "",
      address: "",
    },
  });

  const onSubmit = async (values: WarrantyFormValues) => {
    if (!user) {
      toast({
        title: "Authentication Error",
        description: "You must be logged in to register a warranty.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const receiptFile = values.purchaseReceipt[0];
      const fileName = `${Date.now()}-${receiptFile.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('warranty-receipts')
        .upload(fileName, receiptFile);

      if (uploadError) throw uploadError;
      if (!uploadData) throw new Error("Receipt upload failed, no path returned.");
      
      const { data: publicUrlData } = supabase.storage
        .from('warranty-receipts')
        .getPublicUrl(uploadData.path);
      
      if (!publicUrlData?.publicUrl) throw new Error("Failed to get public URL for receipt.");

      // Use registerSerialNumber for user registration instead of updateSerialNumber
      const registrationData = {
        customer_name: `${values.firstName} ${values.lastName}`,
        customer_email: values.email,
        customer_phone: values.mobile,
        purchase_source: values.purchaseSource,
        purchase_date: format(values.purchaseDate, "yyyy-MM-dd"),
        purchase_receipt_url: publicUrlData.publicUrl,
      };
      
      const result = await registerSerialNumber(serialData.serial_number, registrationData);

      toast({
        title: "Warranty Registered!",
        description: "Your product warranty has been successfully registered.",
      });
      onSuccess(result);
    } catch (error: any) {
      console.error("Registration error:", error);
      toast({
        title: "Registration Failed",
        description: error.message || "An error occurred during registration.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Purchase Details</CardTitle>
        <CardDescription>Fill in the form below to register your warranty.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <WarrantyFormFields control={form.control} />
            <Button type="submit" disabled={isSubmitting} className="w-full md:w-auto">
              {isSubmitting ? "Submitting..." : "Register Warranty"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
