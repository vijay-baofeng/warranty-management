
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, X } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ExtendedSerialNumber } from '@/types/serialNumberTypes';

interface WarrantyDetailsCardProps {
  item: ExtendedSerialNumber;
  onCopy: (text: string | null | undefined, fieldName: string) => void;
  onClose: () => void;
  onTrackWarranty: () => void;
}

export const WarrantyDetailsCard: React.FC<WarrantyDetailsCardProps> = ({ item, onCopy, onClose, onTrackWarranty }) => {
  return (
    <Card className="m-2 shadow-md relative">
      <Button variant="ghost" size="icon" className="absolute top-2 right-2 text-muted-foreground hover:text-foreground" onClick={onClose}>
        <X className="h-5 w-5" />
      </Button>
      <CardHeader>
        <CardTitle className="text-lg">Warranty Details</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
        <div>
          <p><strong>Serial Number:</strong> {item.serial_number}</p>
          <p><strong>Product:</strong> {item.productName}</p>
          <p><strong>Model:</strong> {item.model}</p>
        </div>
        <div>
          <p><strong>Purchase Date:</strong> {item.purchase_date ? format(parseISO(item.purchase_date), 'dd/MM/yyyy') : 'N/A'}</p>
          <p><strong>Expiry Date:</strong> {item.expiryDate ? format(item.expiryDate, 'dd/MM/yyyy') : 'N/A'}</p>
          <p><strong>Duration:</strong> {item.warrantyDurationText}</p>
        </div>
        <div className="md:col-span-2">
          <p className="flex items-center">
            <strong>Claim Request No#:</strong>&nbsp;
            {item.status === 'claimed' && item.claim_request_id ? item.claim_request_id : 'N/A'}
            {(item.status === 'claimed' && item.claim_request_id) && (
              <Button variant="ghost" size="sm" className="ml-1 p-1 h-auto" onClick={() => onCopy(item.claim_request_id, "Claim Request No#")}>
                <Copy className="h-3 w-3" />
              </Button>
            )}
          </p>
        </div>
        {item.status === 'claimed' && (
          <div className="md:col-span-2 mt-2">
            <Button variant="outline" size="sm" onClick={onTrackWarranty}>
              Track Warranty Status
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

