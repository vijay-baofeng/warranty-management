import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { SerialNumber } from "@/types/serialNumberTypes";
import { Badge } from '@/components/ui/badge';

interface ProductDetailsTableProps {
  serialData: SerialNumber;
  onRegisterClick: () => void;
  onClaimClick: () => void;
}

export function ProductDetailsTable({ serialData, onRegisterClick, onClaimClick }: ProductDetailsTableProps) {
  const product = serialData.products;

  return (
    <div className="mt-6">
      <h2 className="text-xl font-semibold mb-3">Product Details</h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[200px]">Attribute</TableHead>
            <TableHead>Value</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>Serial Number</TableCell>
            <TableCell>{serialData.serial_number}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Product Name</TableCell>
            <TableCell>{product?.name || 'N/A'}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Product Information</TableCell>
            <TableCell>{product?.description || 'N/A'}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Model</TableCell>
            <TableCell>{product?.serial_no_prefix || product?.name || 'N/A'}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Manufacturer Name</TableCell>
            <TableCell>{product?.manufacturer_name || 'N/A'}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Current Status</TableCell>
            <TableCell><Badge variant={serialData.status === 'available' ? 'default' : serialData.status === 'registered' ? 'secondary' : 'destructive'}>{serialData.status}</Badge></TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Action</TableCell>
            <TableCell>
              {serialData.status === 'available' && (
                <Button onClick={onRegisterClick}>Register Warranty</Button>
              )}
              {serialData.status === 'registered' && (
                <Button onClick={onClaimClick} variant="outline">Claim Warranty</Button>
              )}
              {serialData.status === 'claimed' && (
                 <Badge variant="destructive">Warranty Claimed</Badge>
              )}
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
}
