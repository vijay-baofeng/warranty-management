
import React from 'react';
import { TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, ChevronDown, ChevronRight, Info, FileText } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ExtendedSerialNumber, SerialNumber as SerialNumberType } from '@/types/serialNumberTypes'; // Renamed to avoid conflict
import { WarrantyDetailsCard } from './WarrantyDetailsCard';

interface RegisteredWarrantyRowProps {
  item: ExtendedSerialNumber;
  isExpanded: boolean;
  onToggleExpand: (id: string) => void;
  onInitiateClaim: (item: ExtendedSerialNumber) => void;
  onTrackClaim: () => void;
  onCopy: (text: string | null | undefined, fieldName: string) => void;
  getStatusBadgeVariant: (status: SerialNumberType['status']) => "default" | "secondary" | "destructive" | "outline";
  getDaysLeftBadgeVariant: (daysLeft: number | null) => string;
}

export const RegisteredWarrantyRow: React.FC<RegisteredWarrantyRowProps> = ({
  item,
  isExpanded,
  onToggleExpand,
  onInitiateClaim,
  onTrackClaim,
  onCopy,
  getStatusBadgeVariant,
  getDaysLeftBadgeVariant,
}) => {
  return (
    <React.Fragment>
      <TableRow>
        <TableCell>
          <Button variant="ghost" size="sm" onClick={() => onToggleExpand(item.id)}>
            {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </Button>
        </TableCell>
        <TableCell>{item.serial_number}</TableCell>
        <TableCell>{item.productName}</TableCell>
        <TableCell>{item.model}</TableCell>
        <TableCell>{item.registration_date ? format(parseISO(item.registration_date), 'dd/MM/yyyy') : 'N/A'}</TableCell>
        <TableCell>{item.purchase_date ? format(parseISO(item.purchase_date), 'dd/MM/yyyy') : 'N/A'}</TableCell>
        <TableCell>
          {item.daysLeft !== null && item.expiryDate ? (
            <Badge className={`${getDaysLeftBadgeVariant(item.daysLeft)}`}>
              {item.daysLeft < 0 ? `Expired ${Math.abs(item.daysLeft)} days ago` : `${item.daysLeft} Days Left`}
            </Badge>
          ) : 'N/A'}
        </TableCell>
        <TableCell>
          <Badge variant={getStatusBadgeVariant(item.status)}>
            {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
          </Badge>
        </TableCell>
        <TableCell className="text-right">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onToggleExpand(item.id)}>
                <Info className="mr-2 h-4 w-4" /> View Details
              </DropdownMenuItem>
              {item.status === 'registered' && (
                <DropdownMenuItem onClick={() => onInitiateClaim(item)}>
                  <FileText className="mr-2 h-4 w-4" /> Initiate Claim
                </DropdownMenuItem>
              )}
              {item.status === 'claimed' && (
                <DropdownMenuItem onClick={onTrackClaim}>
                  <FileText className="mr-2 h-4 w-4" /> Track Claim
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </TableCell>
      </TableRow>
      {isExpanded && (
        <TableRow>
          <TableCell colSpan={9}>
            <WarrantyDetailsCard
              item={item}
              onCopy={onCopy}
              onClose={() => onToggleExpand(item.id)} // Or pass a dedicated close handler
              onTrackWarranty={onTrackClaim}
            />
          </TableCell>
        </TableRow>
      )}
    </React.Fragment>
  );
};

