import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, Eye, Clock, User } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
} from "@/components/ui/pagination";
import { useClaimRequests } from "@/hooks/useClaimRequests";
import { format } from "date-fns";
import { ClaimDetailsModal } from "./claims/ClaimDetailsModal";
import { ClaimStatusDropdown } from "./claims/ClaimStatusDropdown";
import { useToast } from "@/hooks/use-toast";
import { ClaimRequest, SerialStatus } from "@/types/serialNumberTypes";
import { updateSerialNumberAPI } from "@/services/serialNumberApiService";

export function ClaimsManager() {
  const { claimRequests, loading, refreshClaimRequests } = useClaimRequests();
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedClaim, setSelectedClaim] = useState<ClaimRequest | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const { toast } = useToast();
  const itemsPerPage = 5;

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400";
      case "in-progress": 
      case "in-review": return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400";
      case "approved": return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
      case "rejected": return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400";
      case "claimed": return "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400";
      case "require-more-info": return "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400";
    }
  };

  const filteredClaims = claimRequests.filter(claim => {
    const serialNumber = claim.serial_number;
    const productName = serialNumber?.products?.name || '';
    const customerName = serialNumber?.customer_name || '';
    const serialNum = serialNumber?.serial_number || '';
    
    const matchesSearch = 
      claim.complaint_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      serialNum.toLowerCase().includes(searchTerm.toLowerCase()) ||
      claim.issue_type.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || 
      (serialNumber?.status && serialNumber.status.toLowerCase() === statusFilter.toLowerCase());
    
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredClaims.length / itemsPerPage);
  const paginatedClaims = filteredClaims.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleViewDetails = (claim: ClaimRequest) => {
    setSelectedClaim(claim);
    setIsDetailsModalOpen(true);
  };

  const handleStatusUpdate = async (claimId: string, status: string) => {
    try {
      // Find the claim to get the serial number ID
      const claim = claimRequests.find(c => c.id === claimId);
      if (!claim || !claim.serial_number_id) {
        toast({
          title: "Error",
          description: "Could not find the serial number to update",
          variant: "destructive",
        });
        return;
      }

      console.log(`Updating serial number ${claim.serial_number_id} to status: ${status}`);
      
      // Type the status properly for the API call
      const validStatus = status as SerialStatus;
      
      // Update the serial number status in the database
      await updateSerialNumberAPI(claim.serial_number_id, { status: validStatus });
      
      // Refresh the claims list to get updated data
      await refreshClaimRequests();
      
      toast({
        title: "Status Updated",
        description: `Claim status updated to ${status}`,
      });
    } catch (error) {
      console.error('Error updating claim status:', error);
      toast({
        title: "Error",
        description: "Failed to update claim status",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Claims Management</h1>
          <p className="text-muted-foreground">Loading claim requests...</p>
        </div>
        <Card>
          <CardContent className="p-8">
            <div className="flex items-center justify-center">
              <Clock className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Claims Management</h1>
        <p className="text-muted-foreground">
          Manage and track all warranty claims from users.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Claims Overview ({claimRequests.length} total claims)</CardTitle>
          <div className="flex flex-col sm:flex-row gap-4 mt-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search claims by title, product, customer, or serial number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="registered">Registered</SelectItem>
                <SelectItem value="claimed">Claimed</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="in-review">In Review</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="require-more-info">Require More Info</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {paginatedClaims.map((claim) => (
              <div key={claim.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent transition-colors">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 flex-1">
                  <div>
                    <p className="font-medium text-sm">Claim #{claim.id.slice(0, 8)}</p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(claim.created_at), 'MMM dd, yyyy')}
                    </p>
                  </div>
                  <div>
                    <p className="font-medium text-sm">{claim.complaint_title}</p>
                    <p className="text-xs text-muted-foreground">Issue: {claim.issue_type}</p>
                  </div>
                  <div>
                    <p className="font-medium text-sm">
                      {claim.serial_number?.products?.name || 'Unknown Product'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Serial: {claim.serial_number?.serial_number || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <div className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      <p className="font-medium text-sm">
                        {claim.serial_number?.customer_name || 'Unknown Customer'}
                      </p>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {claim.serial_number?.customer_email || 'No email'}
                    </p>
                  </div>
                  <div>
                    <Badge className={getStatusColor(claim.serial_number?.status || 'unknown')}>
                      {claim.serial_number?.status || 'Unknown'}
                    </Badge>
                    {claim.expected_resolution_date && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Expected: {format(new Date(claim.expected_resolution_date), 'MMM dd')}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 ml-4">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    title="View Details"
                    onClick={() => handleViewDetails(claim)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <ClaimStatusDropdown 
                    claim={claim} 
                    onStatusUpdate={handleStatusUpdate}
                  />
                </div>
              </div>
            ))}
            {paginatedClaims.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                {claimRequests.length === 0 ? 
                  "No claim requests found." : 
                  "No claims match your search criteria."
                }
              </div>
            )}
          </div>
          {totalPages > 1 && (
            <div className="pt-4">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        handlePageChange(currentPage - 1);
                      }}
                      className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                    />
                  </PaginationItem>
                  <PaginationItem>
                    <span className="px-4 py-2 text-sm font-medium">
                      Page {currentPage} of {totalPages}
                    </span>
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        handlePageChange(currentPage + 1);
                      }}
                      className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </CardContent>
      </Card>

      <ClaimDetailsModal
        claim={selectedClaim}
        isOpen={isDetailsModalOpen}
        onClose={() => {
          setIsDetailsModalOpen(false);
          setSelectedClaim(null);
        }}
      />
    </div>
  );
}
