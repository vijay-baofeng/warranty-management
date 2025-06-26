import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { SerialNumber } from "@/types/serialNumberTypes"; // Updated import path
import { ProductDetailsTable } from "./ProductDetailsTable";
import { WarrantyRegistrationForm } from "./WarrantyRegistrationForm";

export function RegisterWarrantyPage() {
  const [serialNumberInput, setSerialNumberInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [validationMessage, setValidationMessage] = useState<string | null>(null); // Renamed from validationResult for clarity
  const [validatedSerialData, setValidatedSerialData] = useState<SerialNumber | null>(null);
  const [showRegistrationForm, setShowRegistrationForm] = useState(false);
  const { toast } = useToast();

  const handleValidateSerialNumber = async () => {
    if (!serialNumberInput.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter a serial number.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setValidationMessage(null);
    setValidatedSerialData(null);
    setShowRegistrationForm(false);

    try {
      // Use the new RPC function to validate the serial number.
      // This function can be called by any user and bypasses RLS for the check.
      const { data: rpcData, error } = await supabase
        .rpc('validate_serial_number', {
          p_serial_number: serialNumberInput.trim(),
        });

      if (error) {
        throw error;
      }
      
      if (rpcData && rpcData.length > 0) {
        const typedData = rpcData[0] as SerialNumber; // RPC returns an array of results
        setValidatedSerialData(typedData);
        if (typedData.status === 'available') {
          setValidationMessage(`Serial number ${typedData.serial_number} for product ${typedData.products?.name || 'Unknown Product'} is valid and available for registration.`);
          toast({
            title: "Validation Successful",
            description: "Serial number is valid. Proceed to register.",
          });
        } else {
          setValidationMessage(`Serial number ${typedData.serial_number} is already ${typedData.status}.`);
          toast({
            title: "Validation Info",
            description: `Serial number is already ${typedData.status}.`,
          });
        }
      } else {
        setValidationMessage("Invalid or non-existent serial number.");
        toast({
          title: "Validation Failed",
          description: "Invalid or non-existent serial number.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Error validating serial number:", error);
      setValidationMessage("An error occurred during validation. Please try again.");
      toast({
        title: "Validation Error",
        description: error.message || "Failed to validate serial number.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegistrationSuccess = (updatedSerial: SerialNumber) => {
    setValidatedSerialData(updatedSerial); // Update with new data from registration
    setShowRegistrationForm(false);
    setValidationMessage(`Warranty for serial number ${updatedSerial.serial_number} registered successfully! It is now ${updatedSerial.status}.`);
    // Optionally clear the serial number input
    // setSerialNumberInput(""); 
  };
  
  const handleClaimWarranty = () => {
    // Placeholder for navigation or modal for claim process
    toast({ title: "Claim Warranty", description: "Claim functionality will be implemented here."});
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Register Warranty</h1>
      <Card>
        <CardHeader>
          <CardTitle>Validate Serial Number</CardTitle>
          <CardDescription>
            Enter the serial number found on your product to begin the warranty registration process.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Input
              type="text"
              placeholder="Enter Serial Number"
              value={serialNumberInput}
              onChange={(e) => setSerialNumberInput(e.target.value)}
              className="flex-grow"
              disabled={isLoading || !!validatedSerialData} // Disable if data is shown or loading
            />
            <Button 
              onClick={handleValidateSerialNumber} 
              disabled={isLoading || !serialNumberInput.trim() || !!validatedSerialData}
            >
              {isLoading ? "Validating..." : "Validate"}
            </Button>
            {validatedSerialData && (
              <Button 
                variant="outline" 
                onClick={() => {
                  setValidatedSerialData(null);
                  setValidationMessage(null);
                  setShowRegistrationForm(false);
                  setSerialNumberInput("");
                }}
              >
                Clear
              </Button>
            )}
          </div>

          {validationMessage && (
            <div className={`p-3 rounded-md text-sm ${
              validatedSerialData && validatedSerialData.status === 'available' 
                ? 'bg-green-100 text-green-700' 
                : validatedSerialData ? (validatedSerialData.status === 'registered' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700') 
                : 'bg-red-100 text-red-700'
            }`}>
              {validationMessage}
            </div>
          )}

          {validatedSerialData && (
            <ProductDetailsTable 
              serialData={validatedSerialData}
              onRegisterClick={() => setShowRegistrationForm(true)}
              onClaimClick={handleClaimWarranty} // This still calls the placeholder
            />
          )}
          
          {validatedSerialData && validatedSerialData.status === 'available' && showRegistrationForm && (
            <WarrantyRegistrationForm 
              serialData={validatedSerialData}
              onSuccess={handleRegistrationSuccess}
            />
          )}
        </CardContent>
      </Card>
      <p className="text-sm text-muted-foreground">
        Note: The address field in the registration form is collected but not currently saved to the database as the 'serial_numbers' table does not have a dedicated address column. This can be added in a future update.
      </p>
    </div>
  );
}
