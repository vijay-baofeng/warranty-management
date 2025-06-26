
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useUserWarranties } from '@/hooks/useUserWarranties';
import { SerialNumber, ExtendedSerialNumber } from "@/types/serialNumberTypes";
import { format, addMonths, differenceInDays, parseISO, isValid } from 'date-fns';
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from 'react-router-dom';
import { NoWarrantiesMessage } from './claim-warranty/NoWarrantiesMessage';
import { ClaimWarrantyTable } from './claim-warranty/ClaimWarrantyTable';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
} from "@/components/ui/pagination";

export function ClaimWarrantyPage() {
  const { userWarranties, loading: warrantyLoading, refreshUserWarranties } = useUserWarranties();
  const [expandedRowId, setExpandedRowId] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    refreshUserWarranties();
  }, [refreshUserWarranties]);

  const registeredWarranties = useMemo(() => {
    return userWarranties
      .map(sn => {
        let expiryDate: Date | null = null;
        let daysLeft: number | null = null;
        let warrantyDurationText: string = 'N/A';

        if (sn.purchase_date && sn.products?.warranty_duration) {
          const purchaseDateObj = parseISO(sn.purchase_date);
          if (isValid(purchaseDateObj)) {
            expiryDate = addMonths(purchaseDateObj, sn.products.warranty_duration);
            daysLeft = differenceInDays(expiryDate, new Date());
            warrantyDurationText = `${sn.products.warranty_duration} months`;
          }
        }
        
        return {
          ...sn,
          productName: sn.products?.name || 'N/A',
          model: sn.products?.serial_no_prefix || sn.products?.name || 'N/A',
          expiryDate,
          daysLeft,
          warrantyDurationText,
        } as ExtendedSerialNumber;
      })
      .sort((a, b) => { 
        if (a.registration_date && b.registration_date) {
          return parseISO(b.registration_date).getTime() - parseISO(a.registration_date).getTime();
        }
        return 0;
      });
  }, [userWarranties]);

  const totalPages = Math.ceil(registeredWarranties.length / itemsPerPage);
  const paginatedWarranties = registeredWarranties.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleToggleExpand = useCallback((id: string) => {
    setExpandedRowId(prevId => (prevId === id ? null : id));
  }, []);

  const handleCopy = useCallback((text: string | null | undefined, fieldName: string) => {
    if (!text) {
      toast({ title: "Nothing to copy", description: `${fieldName} is not available.`, variant: "default" });
      return;
    }
    navigator.clipboard.writeText(text)
      .then(() => {
        toast({ title: "Copied!", description: `${fieldName} copied to clipboard.` });
      })
      .catch(() => {
        toast({ title: "Error", description: `Failed to copy ${fieldName}.`, variant: "destructive" });
      });
  }, [toast]);
  
  const handleInitiateClaim = useCallback((item: ExtendedSerialNumber) => {
    if (item.status === 'registered' && item.id) {
      navigate(`/dashboard/submit-claim/${item.id}`);
    } else if (item.status === 'claimed') {
      toast({ title: "Info", description: "This warranty has already been claimed. You can track its status." });
    } else {
      toast({ title: "Info", description: "This warranty is not eligible for a new claim request." });
    }
  }, [navigate, toast]);

  const handleTrackClaim = useCallback((_claimId?: string) => {
    navigate('/dashboard/track-warranty');
  }, [navigate]);

  const getStatusBadgeVariant = useCallback((status: SerialNumber['status']): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case 'registered':
        return 'default';
      case 'claimed':
        return 'secondary';
      case 'available':
        return 'outline';
      default:
        return 'outline';
    }
  }, []);

  const getDaysLeftBadgeVariant = useCallback((daysLeft: number | null): string => {
    if (daysLeft === null) return "bg-gray-500";
    if (daysLeft < 0) return "bg-red-500 text-white"; 
    if (daysLeft <= 30) return "bg-yellow-500 text-yellow-900"; 
    return "bg-green-500 text-white";
  }, []);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>My Registered Warranties ({warrantyLoading ? <Skeleton className="h-6 w-10 inline-block" /> : registeredWarranties.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {warrantyLoading && (
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          )}
          {!warrantyLoading && registeredWarranties.length === 0 && (
            <NoWarrantiesMessage />
          )}
          {!warrantyLoading && registeredWarranties.length > 0 && (
            <>
              <ClaimWarrantyTable
                registeredWarranties={paginatedWarranties}
                expandedRowId={expandedRowId}
                onToggleExpand={handleToggleExpand}
                onInitiateClaim={handleInitiateClaim}
                onTrackClaim={handleTrackClaim}
                onCopy={handleCopy}
                getStatusBadgeVariant={getStatusBadgeVariant}
                getDaysLeftBadgeVariant={getDaysLeftBadgeVariant}
              />
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
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
