
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

interface ClaimFormHeaderProps {
  onBack: () => void;
  isLoading: boolean;
  serialNumber?: string;
}

export const ClaimFormHeader: React.FC<ClaimFormHeaderProps> = ({ onBack, isLoading, serialNumber }) => {
  return (
    <div className="flex justify-between items-center mb-6">
      <Button type="button" variant="outline" size="icon" onClick={onBack} disabled={isLoading}>
        <ArrowLeft className="h-4 w-4" />
      </Button>
      <h2 className="text-2xl font-semibold text-center flex-1">Submit Claim Request {serialNumber ? `for ${serialNumber}` : ''}</h2>
      <div className="w-10"></div> {/* Spacer to balance the back button */}
    </div>
  );
};

