
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface SerialTableProps {
  serials: any[];
  onEdit: (serial: any) => void;
  onDelete: (id: string) => void;
  getStatusColor: (status: string) => string;
}

export function SerialTable({ serials, onEdit, onDelete, getStatusColor }: SerialTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Serial Numbers Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Serial Number</TableHead>
              <TableHead>Product</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Registration Date</TableHead>
              <TableHead>Customer Email</TableHead>
              <TableHead>Customer Phone</TableHead>
              {/* <TableHead className="text-right">Actions</TableHead> */}
            </TableRow>
          </TableHeader>
          <TableBody>
            {serials.map((serial) => (
              <TableRow key={serial.id}>
                <TableCell className="font-medium">
                  {serial.serialNumber}
                </TableCell>
                <TableCell>{serial.product}</TableCell>
                <TableCell>
                  <Badge className={getStatusColor(serial.status)}>
                    {serial.status.charAt(0).toUpperCase() + serial.status.slice(1)}
                  </Badge>
                </TableCell>
                <TableCell>{serial.customer_name || "N/A"}</TableCell>
                <TableCell>{serial.registrationDate || "N/A"}</TableCell>
                <TableCell>{serial.customer_email || "N/A"}</TableCell>
                <TableCell>{serial.customer_phone || "N/A"}</TableCell>
                {/* <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="sm" onClick={() => onEdit(serial)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => onDelete(serial.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell> */}
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {serials.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No serial numbers found.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
