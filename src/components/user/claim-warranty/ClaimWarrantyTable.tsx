
import React from 'react';
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ExtendedSerialNumber, SerialNumber as SerialNumberType } from '@/types/serialNumberTypes'; // Renamed
import { RegisteredWarrantyRow } from './RegisteredWarrantyRow';

interface ClaimWarrantyTableProps {
  registeredWarranties: ExtendedSerialNumber[];
  expandedRowId: string | null;
  onToggleExpand: (id: string) => void;
  onInitiateClaim: (item: ExtendedSerialNumber) => void;
  onTrackClaim: (claimId?: string) => void; // Updated to be more generic or specific as needed
  onCopy: (text: string | null | undefined, fieldName: string) => void;
  getStatusBadgeVariant: (status: SerialNumberType['status']) => "default" | "secondary" | "destructive" | "outline";
  getDaysLeftBadgeVariant: (daysLeft: number | null) => string;
}

export const ClaimWarrantyTable: React.FC<ClaimWarrantyTableProps> = ({
  registeredWarranties,
  expandedRowId,
  onToggleExpand,
  onInitiateClaim,
  onTrackClaim,
  onCopy,
  getStatusBadgeVariant,
  getDaysLeftBadgeVariant,
}) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[50px]"></TableHead>
          <TableHead>Serial No.</TableHead>
          <TableHead>Product Name</TableHead>
          <TableHead>Model</TableHead>
          <TableHead>Registration Date</TableHead>
          <TableHead>Purchase Date</TableHead>
          <TableHead>Expires In</TableHead>
          <TableHead>Claim Status</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {registeredWarranties.map((item) => (
          <RegisteredWarrantyRow
            key={item.id}
            item={item}
            isExpanded={expandedRowId === item.id}
            onToggleExpand={onToggleExpand}
            onInitiateClaim={onInitiateClaim}
            onTrackClaim={() => onTrackClaim(item.claim_request_id ?? undefined)}
            onCopy={onCopy}
            getStatusBadgeVariant={getStatusBadgeVariant}
            getDaysLeftBadgeVariant={getDaysLeftBadgeVariant}
          />
        ))}
      </TableBody>
    </Table>
  );
};

