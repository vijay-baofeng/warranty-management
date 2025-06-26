
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ClaimRequestForm, ClaimRequestFormValues } from './ClaimRequestForm';
import { useUserWarranties } from '@/hooks/useUserWarranties';
import { uploadClaimEvidenceAPI } from '@/services/serialNumberApiService';
import { CreateClaimRequestPayload } from '@/types/serialNumberTypes';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';
import { createClaimRequestAPI } from '@/services/claimRequestApiService';
import { updateSerialNumberAPI } from '@/services/serialNumberApiService';

export function SubmitClaimPage() {
  const { serialNumberId } = useParams<{ serialNumberId: string }>();
  const navigate = useNavigate();
  const { userWarranties, loading: warrantyLoading, refreshUserWarranties } = useUserWarranties();
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Fetch user warranties when component mounts
  useEffect(() => {
    refreshUserWarranties();
  }, [refreshUserWarranties]);

  // Find the current serial - user can only see their own warranties
  const currentSerial = userWarranties.find(sn => 
    sn.id === serialNumberId && 
    sn.status === 'registered'
  );

  console.log('SubmitClaimPage - serialNumberId:', serialNumberId);
  console.log('SubmitClaimPage - user warranties:', userWarranties.length);
  console.log('SubmitClaimPage - currentSerial found:', !!currentSerial);

  const handleSubmit = async (values: ClaimRequestFormValues) => {
    if (!serialNumberId) {
      toast({ 
        title: "Error", 
        description: "Serial number ID is missing.", 
        variant: "destructive" 
      });
      return;
    }

    setIsLoading(true);
    try {
      const imageUrls: string[] = [];
      if (values.evidence_images && values.evidence_images.length > 0) {
        for (const file of values.evidence_images) {
          const url = await uploadClaimEvidenceAPI(file, serialNumberId);
          imageUrls.push(url);
        }
      }

      const payload: CreateClaimRequestPayload = {
        serial_number_id: serialNumberId,
        complaint_title: values.complaint_title,
        complaint_date: format(values.complaint_date, 'yyyy-MM-dd'),
        issue_type: values.issue_type,
        expected_resolution_date: values.expected_resolution_date ? format(values.expected_resolution_date, 'yyyy-MM-dd') : null,
        description: values.description || null,
        customer_note: values.customer_note || null,
        evidence_image_urls: imageUrls.length > 0 ? imageUrls : null,
      };

      console.log('Submitting claim for serial:', serialNumberId);
      
      // Create the claim request
      const newClaimRequest = await createClaimRequestAPI(payload);
      
      // Update the serial number status to 'claimed'
      await updateSerialNumberAPI(serialNumberId, { 
        status: 'claimed',
        claim_request_id: newClaimRequest.id 
      });
      
      toast({
        title: 'Claim Submitted Successfully!',
        description: 'Your claim request has been submitted. You will be redirected to track its status.',
      });
      navigate('/dashboard/track-warranty');
    } catch (error: any) {
      console.error("Failed to submit claim request:", error);
      let detailedErrorMessage = 'Could not submit claim request. Please try again.';
      if (error && error.message) {
        detailedErrorMessage = error.message;
      }
      toast({
        title: 'Submission Failed',
        description: detailedErrorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/dashboard/claim-warranty');
  };

  if (warrantyLoading) {
    return <div className="text-center py-8">Loading serial number details...</div>;
  }

  // If serial number ID is missing
  if (!serialNumberId) {
    return <div className="text-center py-8 text-red-500">Serial number ID is missing.</div>;
  }

  // If user doesn't own this serial number or it's not registered
  if (!currentSerial) {
    return (
      <div className="text-center py-8 text-red-500">
        Serial number not found or you don't have permission to claim this warranty.
      </div>
    );
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <ClaimRequestForm
          onSubmit={handleSubmit}
          onBack={handleBack}
          isLoading={isLoading}
          serialNumber={currentSerial.serial_number}
        />
      </CardContent>
    </Card>
  );
}
