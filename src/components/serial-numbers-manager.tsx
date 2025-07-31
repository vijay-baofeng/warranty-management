
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SerialForm } from "./serial-numbers/serial-form";
import { SerialTable } from "./serial-numbers/serial-table";
import { useSerialNumbers } from '@/hooks/useSerialNumbers';
import { SerialNumber, CreateSerialNumberPayload, UpdateSerialNumberPayload } from "@/types/serialNumberTypes";
import { useProducts } from "@/hooks/useProducts";
import { useAuth } from "@/providers/AuthProvider";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
} from "@/components/ui/pagination";

export function SerialNumbersManager() {
  const { role } = useAuth();
  const { serialNumbers, loading, createSerialNumber, updateSerialNumber, deleteSerialNumber } = useSerialNumbers();
  const { products } = useProducts();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSerial, setEditingSerial] = useState<SerialNumber | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Check if user is admin
  if (role === 'end_user') {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold text-gray-900">Access Denied</h2>
          <p className="text-gray-600">Only administrators can manage serial numbers.</p>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available": return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
      case "registered": return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400";
      case "claimed": return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400";
    }
  };

  const filteredSerials = serialNumbers.filter(serial => {
    const matchesStatus = statusFilter === "all" || serial.status === statusFilter;
    const matchesSearch = serial.serial_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (serial.products?.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (serial.customer_name && serial.customer_name.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  const handleSubmit = async (formData: any) => {
    try {
      const payload: CreateSerialNumberPayload | Omit<UpdateSerialNumberPayload, 'id' | 'claim_request_id' | 'products'> = {
        serial_number: formData.serialNumber,
        product_id: formData.product_id,
        status: formData.status,
        customer_name: formData.status === "available" ? null : formData.customer_name, 
        customer_email: formData.customer_email || null,
        customer_phone: formData.customer_phone || null,
        registration_date: formData.status === "available" ? null : (formData.registration_date ? new Date(formData.registration_date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]),
        purchase_date: formData.purchase_date ? new Date(formData.purchase_date).toISOString().split('T')[0] : null,
        purchase_source: formData.purchase_source || null,
        purchase_receipt_url: formData.purchase_receipt_url || null,
      };
      
      if (editingSerial) {
        const updatePayload: Omit<UpdateSerialNumberPayload, 'id' | 'claim_request_id' | 'products'> = { ...payload };
        await updateSerialNumber(editingSerial.id, updatePayload);
      } else {
        await createSerialNumber(payload as CreateSerialNumberPayload);
      }
      setEditingSerial(null);
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error submitting serial:', error);
    }
  };

  const handleEdit = (serial: SerialNumber) => {
    setEditingSerial(serial);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this serial number?")) {
      await deleteSerialNumber(id);
    }
  };

  const handleAddNew = () => {
    setEditingSerial(null);
    setIsDialogOpen(true);
  };

  // Transform data for the table component
  const tableSerials = filteredSerials.map(serial => ({
    id: serial.id,
    serialNumber: serial.serial_number,
    product: serial.products?.name || "Unknown Product",
    product_id: serial.product_id,
    status: serial.status,
    customer_name: serial.customer_name, 
    customer_email: serial.customer_email,
    customer_phone: serial.customer_phone,
    registrationDate: serial.registration_date,
    purchase_date: serial.purchase_date,
    purchase_source: serial.purchase_source,
    purchase_receipt_url: serial.purchase_receipt_url,
    claim_request_id: serial.claim_request_id,
    ...serial 
  }));

  const totalPages = Math.ceil(tableSerials.length / itemsPerPage);
  const paginatedSerials = tableSerials.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading serial numbers...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Serial Numbers Management</h1>
          <p className="text-muted-foreground">
            Track and manage product serial numbers and registrations.
          </p>
        </div>
        <Button onClick={handleAddNew}>
          <Plus className="h-4 w-4 mr-2" />
          Add Serial Number
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search serial numbers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="available">Available</SelectItem>
            <SelectItem value="registered">Registered</SelectItem>
            <SelectItem value="claimed">Claimed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <SerialTable 
        serials={paginatedSerials}
        onEdit={(serial) => handleEdit(serial as SerialNumber)}
        onDelete={handleDelete}
        getStatusColor={getStatusColor}
      />

      {totalPages > 1 && (
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
      )}

      <SerialForm
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSubmit={handleSubmit}
        editingSerial={editingSerial}
        products={products}
      />
    </div>
  );
}
