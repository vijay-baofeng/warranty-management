
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Upload } from "lucide-react";
import { SerialNumber, SerialStatus } from "@/types/serialNumberTypes";
import { Product } from "@/hooks/useProducts";
import { useToast } from "@/hooks/use-toast";

interface SerialFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (serialData: any) => void;
  editingSerial: SerialNumber | null;
  products: Product[];
}

interface CSVRow {
  productId: string;
  serialNo: string;
}

export function SerialForm({ isOpen, onClose, onSubmit, editingSerial, products }: SerialFormProps) {
  const [formData, setFormData] = useState({
    serialNumber: "",
    product_id: "",
    status: "available" as SerialStatus,
    customer: "",
    customer_email: "",
    customer_phone: "",
    registration_date: "",
    purchase_date: "",
    purchase_source: "",
    purchase_receipt_url: "",
  });
  const [uploadMode, setUploadMode] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [csvData, setCsvData] = useState<CSVRow[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (editingSerial) {
      setFormData({
        serialNumber: editingSerial.serial_number || "",
        product_id: editingSerial.product_id || "",
        status: editingSerial.status || "available",
        customer: editingSerial.customer_name || "",
        customer_email: editingSerial.customer_email || "",
        customer_phone: editingSerial.customer_phone || "",
        registration_date: editingSerial.registration_date || "",
        purchase_date: editingSerial.purchase_date || "",
        purchase_source: editingSerial.purchase_source || "",
        purchase_receipt_url: editingSerial.purchase_receipt_url || "",
      });
    } else {
      setFormData({
        serialNumber: "",
        product_id: "",
        status: "available",
        customer: "",
        customer_email: "",
        customer_phone: "",
        registration_date: "",
        purchase_date: "",
        purchase_source: "",
        purchase_receipt_url: "",
      });
    }
  }, [editingSerial, isOpen]);

  const selectedProduct = products.find(p => p.id === formData.product_id);
  const productId = selectedProduct ? `${selectedProduct.serial_no_prefix}001` : "No Product Selected";

  const parseCSV = (csvText: string): CSVRow[] => {
    const lines = csvText.trim().split('\n');
    const data: CSVRow[] = [];
    
    // Skip header row if it exists
    const startIndex = lines[0].toLowerCase().includes('productid') || lines[0].toLowerCase().includes('product') ? 1 : 0;
    
    for (let i = startIndex; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line) {
        const [productId, serialNo] = line.split(',').map(cell => cell.trim().replace(/"/g, ''));
        if (productId && serialNo) {
          data.push({ productId, serialNo });
        }
      }
    }
    
    return data;
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      
      if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
        try {
          const text = await file.text();
          const parsedData = parseCSV(text);
          setCsvData(parsedData);
          
          if (parsedData.length === 0) {
            toast({
              title: "Invalid CSV",
              description: "No valid data found in CSV file. Please ensure it has productId and serialNo columns.",
              variant: "destructive",
            });
          } else {
            toast({
              title: "CSV Parsed",
              description: `Found ${parsedData.length} serial numbers to import.`,
            });
          }
        } catch (error) {
          console.error('Error parsing CSV:', error);
          toast({
            title: "Error",
            description: "Failed to parse CSV file. Please check the file format.",
            variant: "destructive",
          });
        }
      }
    }
  };

  const handleBulkSubmit = async () => {
    if (csvData.length === 0) {
      toast({
        title: "No Data",
        description: "Please select a valid CSV file with serial number data.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    
    try {
      // Validate that all productIds exist in the products list
      const validProductIds = products.map(p => p.id);
      const invalidRows = csvData.filter(row => !validProductIds.includes(row.productId));
      
      if (invalidRows.length > 0) {
        toast({
          title: "Invalid Product IDs",
          description: `Found ${invalidRows.length} rows with invalid product IDs. Please check your CSV file.`,
          variant: "destructive",
        });
        setIsProcessing(false);
        return;
      }

      // Process each row
      for (const row of csvData) {
        const serialData = {
          serialNumber: row.serialNo,
          product_id: row.productId,
          status: "available" as const,
          customer: "",
          customer_email: "",
          customer_phone: "",
          registration_date: "",
          purchase_date: "",
          purchase_source: "",
          purchase_receipt_url: "",
        };
        
        await onSubmit(serialData);
      }

      toast({
        title: "Success",
        description: `Successfully imported ${csvData.length} serial numbers.`,
      });

      // Reset form
      setSelectedFile(null);
      setCsvData([]);
      setUploadMode(false);
      onClose();
      
    } catch (error) {
      console.error('Error importing serial numbers:', error);
      toast({
        title: "Import Error",
        description: "Failed to import some serial numbers. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (uploadMode) {
      handleBulkSubmit();
    } else {
      onSubmit(formData);
      setFormData({ 
        serialNumber: "", 
        product_id: "", 
        status: "available", 
        customer: "",
        customer_email: "",
        customer_phone: "",
        registration_date: "",
        purchase_date: "",
        purchase_source: "",
        purchase_receipt_url: "",
      });
      setUploadMode(false);
    }
  };

  const handleCancel = () => {
    setFormData({ 
      serialNumber: "", 
      product_id: "", 
      status: "available", 
      customer: "",
      customer_email: "",
      customer_phone: "",
      registration_date: "",
      purchase_date: "",
      purchase_source: "",
      purchase_receipt_url: "",
    });
    setUploadMode(false);
    setSelectedFile(null);
    setCsvData([]);
    onClose();
  };

  const handleFileUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-800">
            {editingSerial ? "Edit Serial Number" : "Generate Serial No."}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="product" className="text-sm font-medium text-gray-700">
                Select Product
              </Label>
              <Select 
                value={formData.product_id} 
                onValueChange={(value) => setFormData({ ...formData, product_id: value })}
                disabled={uploadMode}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select a product" />
                </SelectTrigger>
                <SelectContent>
                  {products.map((product) => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {!uploadMode && (
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-medium text-gray-700">Product ID:</span>
                  <span className="text-green-600">{selectedProduct ? `${selectedProduct.serial_no_prefix}001` : "No Product Selected"}</span>
                </div>
              </div>
            )}

            {!editingSerial && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <input
                    type="radio"
                    id="upload"
                    name="mode"
                    checked={uploadMode}
                    onChange={() => setUploadMode(true)}
                    className="w-4 h-4 text-blue-600"
                  />
                  <Label htmlFor="upload" className="text-sm font-medium text-gray-700">
                    Upload CSV File
                  </Label>
                </div>

                {uploadMode && (
                  <div className="space-y-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".csv,.txt"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    <div 
                      className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-gray-400 transition-colors"
                      onClick={handleFileUploadClick}
                    >
                      <div className="flex flex-col items-center gap-2">
                        <Upload className="h-8 w-8 text-gray-400" />
                        <div className="text-sm text-gray-600">
                          <span className="font-medium text-blue-600">
                            Choose CSV File
                          </span>
                          <span className="text-gray-500 ml-1">
                            {selectedFile ? selectedFile.name : "No file chosen"}
                          </span>
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500">
                      CSV format: productId, serialNo (one per line)
                    </p>
                    {csvData.length > 0 && (
                      <div className="text-sm text-green-600">
                        {csvData.length} serial numbers ready to import
                      </div>
                    )}
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <input
                    type="radio"
                    id="manual"
                    name="mode"
                    checked={!uploadMode}
                    onChange={() => setUploadMode(false)}
                    className="w-4 h-4 text-blue-600"
                  />
                  <Label htmlFor="manual" className="text-sm font-medium text-gray-700">
                    Enter Manually
                  </Label>
                </div>
              </div>
            )}

            {(!uploadMode || editingSerial) && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="serialNumber" className="text-sm font-medium text-gray-700">
                    Serial Number
                  </Label>
                  <Input
                    id="serialNumber"
                    value={formData.serialNumber}
                    onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
                    placeholder="Enter serial number"
                    className="mt-1"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="status" className="text-sm font-medium text-gray-700">
                    Status
                  </Label>
                  <Select 
                    value={formData.status} 
                    onValueChange={(value: SerialStatus) => setFormData({ ...formData, status: value })}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="available">Available</SelectItem>
                      <SelectItem value="registered">Registered</SelectItem>
                      <SelectItem value="claimed">Claimed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {formData.status !== "available" && (
                  <>
                    <div>
                      <Label htmlFor="customer" className="text-sm font-medium text-gray-700">
                        Customer Name
                      </Label>
                      <Input
                        id="customer"
                        value={formData.customer}
                        onChange={(e) => setFormData({ ...formData, customer: e.target.value })}
                        placeholder="Enter customer name"
                        className="mt-1"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="customer_email" className="text-sm font-medium text-gray-700">
                        Customer Email
                      </Label>
                      <Input
                        id="customer_email"
                        type="email"
                        value={formData.customer_email}
                        onChange={(e) => setFormData({ ...formData, customer_email: e.target.value })}
                        placeholder="Enter customer email"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="customer_phone" className="text-sm font-medium text-gray-700">
                        Customer Phone
                      </Label>
                      <Input
                        id="customer_phone"
                        value={formData.customer_phone}
                        onChange={(e) => setFormData({ ...formData, customer_phone: e.target.value })}
                        placeholder="Enter customer phone"
                        className="mt-1"
                      />
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleCancel}
              className="flex-1"
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              className="flex-1 bg-black text-white hover:bg-gray-800"
              disabled={
                isProcessing || 
                (!uploadMode && (!formData.product_id || !formData.serialNumber)) || 
                (uploadMode && csvData.length === 0)
              }
            >
              {isProcessing 
                ? "Processing..." 
                : uploadMode 
                  ? `Import ${csvData.length} Serial Numbers` 
                  : "Submit"
              }
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
