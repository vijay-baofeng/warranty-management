
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { ClaimRequest } from "@/types/serialNumberTypes";
import { X, Package, User, Calendar, FileText } from 'lucide-react';

interface ClaimDetailsModalProps {
  claim: ClaimRequest | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ClaimDetailsModal: React.FC<ClaimDetailsModalProps> = ({
  claim,
  isOpen,
  onClose,
}) => {
  if (!claim) return null;

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400";
      case "in-progress": return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400";
      case "approved": return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
      case "rejected": return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400";
      case "claimed": return "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Claim Details - #{claim.id.slice(0, 8)}</span>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Claim Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Claim Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="font-medium">Title</p>
                  <p className="text-muted-foreground">{claim.complaint_title}</p>
                </div>
                <div>
                  <p className="font-medium">Issue Type</p>
                  <p className="text-muted-foreground">{claim.issue_type}</p>
                </div>
                <div>
                  <p className="font-medium">Complaint Date</p>
                  <p className="text-muted-foreground">
                    {format(new Date(claim.complaint_date), 'MMM dd, yyyy')}
                  </p>
                </div>
                <div>
                  <p className="font-medium">Status</p>
                  <Badge className={getStatusColor(claim.serial_number?.status || 'unknown')}>
                    {claim.serial_number?.status || 'Unknown'}
                  </Badge>
                </div>
              </div>
              {claim.description && (
                <div>
                  <p className="font-medium">Description</p>
                  <p className="text-muted-foreground">{claim.description}</p>
                </div>
              )}
              {claim.customer_note && (
                <div>
                  <p className="font-medium">Customer Note</p>
                  <p className="text-muted-foreground">{claim.customer_note}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Product Details */}
          {claim.serial_number?.products && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Product Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="font-medium">Product Name</p>
                    <p className="text-muted-foreground">{claim.serial_number.products.name}</p>
                  </div>
                  <div>
                    <p className="font-medium">Manufacturer</p>
                    <p className="text-muted-foreground">{claim.serial_number.products.manufacturer_name}</p>
                  </div>
                  <div>
                    <p className="font-medium">Serial Number</p>
                    <p className="text-muted-foreground">{claim.serial_number.serial_number}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Customer Details */}
          {claim.serial_number && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Customer Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="font-medium">Name</p>
                    <p className="text-muted-foreground">{claim.serial_number.customer_name || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="font-medium">Email</p>
                    <p className="text-muted-foreground">{claim.serial_number.customer_email || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="font-medium">Phone</p>
                    <p className="text-muted-foreground">{claim.serial_number.customer_phone || 'N/A'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Uploaded Images */}
          {claim.evidence_image_urls && claim.evidence_image_urls.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Uploaded Evidence</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {claim.evidence_image_urls.map((imageUrl, index) => (
                    <div key={index} className="relative">
                      <img
                        src={imageUrl}
                        alt={`Evidence ${index + 1}`}
                        className="w-full h-32 object-cover rounded-md border cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => window.open(imageUrl, '_blank')}
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
