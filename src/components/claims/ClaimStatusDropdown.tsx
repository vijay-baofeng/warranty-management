
import React from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, CheckCircle, Clock, XCircle, AlertCircle } from 'lucide-react';
import { ClaimRequest } from "@/types/serialNumberTypes";

interface ClaimStatusDropdownProps {
  claim: ClaimRequest;
  onStatusUpdate: (claimId: string, status: string) => void;
}

export const ClaimStatusDropdown: React.FC<ClaimStatusDropdownProps> = ({
  claim,
  onStatusUpdate,
}) => {
  const handleStatusChange = (status: string) => {
    onStatusUpdate(claim.id, status);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleStatusChange('approved')}>
          <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
          Approved
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleStatusChange('in-review')}>
          <Clock className="mr-2 h-4 w-4 text-blue-600" />
          In Review
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleStatusChange('rejected')}>
          <XCircle className="mr-2 h-4 w-4 text-red-600" />
          Rejected
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleStatusChange('require-more-info')}>
          <AlertCircle className="mr-2 h-4 w-4 text-yellow-600" />
          Require More Information
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
