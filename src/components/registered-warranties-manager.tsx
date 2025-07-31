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
import {
  ClaimRequest,
  SerialNumber,
  SerialStatus,
} from "@/types/serialNumberTypes";
import { updateSerialNumberAPI } from "@/services/serialNumberApiService";
import { useUserWarranties } from "@/hooks/useUserWarranties";
import { RegistrationDetailsModal } from "./claims/RegistrationDetailsModal";

export function RegisteredWarrantiesManager() {
  const { allRegisteredWarranties, loading, refreshAllRegisteredWarranties } =
    useUserWarranties();
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedClaim, setSelectedClaim] = useState<ClaimRequest | null>(null);
  const [selectedSerialNumber, setSelectedSerialNumber] =
    useState<SerialNumber | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const { toast } = useToast();
  const itemsPerPage = 5;

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400";
      case "in-progress":
      case "in-review":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400";
      case "approved":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
      case "rejected":
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400";
      case "claimed":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400";
      case "require-more-info":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400";
    }
  };

  // const filteredClaims = allRegisteredWarranties.filter(claim => {
  //   const serialNumber = claim.serial_number;
  //   const productName = claim?.products?.name || '';
  //   const customerName = claim?.customer_name || '';

  //   const matchesSearch =
  //     claim.complaint_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
  //     productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
  //     customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
  //     serialNum.toLowerCase().includes(searchTerm.toLowerCase()) ||
  //     claim.issue_type.toLowerCase().includes(searchTerm.toLowerCase());

  //   const matchesStatus = statusFilter === "all" ||
  //     (serialNumber?.status && serialNumber.status.toLowerCase() === statusFilter.toLowerCase());

  //   return matchesSearch && matchesStatus;
  // });

  const totalPages = Math.ceil(allRegisteredWarranties.length / itemsPerPage);
  const paginatedClaims = allRegisteredWarranties.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleViewDetails = (claim: SerialNumber) => {
    setSelectedSerialNumber(claim);
    setIsDetailsModalOpen(true);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Registered Warranties Management
          </h1>
          <p className="text-muted-foreground">
            Loading registered warranties...
          </p>
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
        <h1 className="text-3xl font-bold tracking-tight">
          Registered Warranties Management
        </h1>
        <p className="text-muted-foreground">
          Manage and track all registered warranties from users.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            Warranties Overview ({allRegisteredWarranties.length} total
            registered)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {paginatedClaims.map((claim) => (
              <div
                key={claim.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent transition-colors"
              >
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 flex-1">
                  <div>
                    <p className="font-medium text-sm">
                      Registration #{claim.id.slice(0, 8)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(claim.created_at), "MMM dd, yyyy")}
                    </p>
                  </div>
                  {/* <div>
                    <p className="font-medium text-sm">{claim.complaint_title}</p>
                    <p className="text-xs text-muted-foreground">Issue: {claim.issue_type}</p>
                  </div> */}
                  <div>
                    <p className="font-medium text-sm">
                      {claim?.products?.name || "Unknown Product"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Serial: {claim?.serial_number || "N/A"}
                    </p>
                  </div>
                  <div>
                    <div className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      <p className="font-medium text-sm">
                        {claim?.customer_name || "Unknown Customer"}
                      </p>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {claim?.customer_email || "No email"}
                    </p>
                  </div>
                  <div>
                    <Badge
                      className={getStatusColor(claim?.status || "unknown")}
                    >
                      {claim?.status || "Unknown"}
                    </Badge>
                    {/* {claim.expected_resolution_date && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Expected: {format(new Date(claim.expected_resolution_date), 'MMM dd')}
                      </p>
                    )} */}
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
                </div>
              </div>
            ))}
            {paginatedClaims.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                {allRegisteredWarranties.length === 0
                  ? "No registered warranties found."
                  : "No warranties match your search criteria."}
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
                      className={
                        currentPage === 1
                          ? "pointer-events-none opacity-50"
                          : ""
                      }
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
                      className={
                        currentPage === totalPages
                          ? "pointer-events-none opacity-50"
                          : ""
                      }
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </CardContent>
      </Card>

      <RegistrationDetailsModal
        claim={selectedSerialNumber}
        isOpen={isDetailsModalOpen}
        onClose={() => {
          setIsDetailsModalOpen(false);
          setSelectedSerialNumber(null);
          setSelectedClaim(null);
        }}
      />
    </div>
  );
}
