
import React from 'react';
import { Info } from 'lucide-react';

export const NoWarrantiesMessage: React.FC = () => {
  return (
    <div className="text-center py-8 text-muted-foreground">
      <Info className="mx-auto h-12 w-12 text-gray-400" />
      <h3 className="mt-2 text-sm font-medium">No Registered Warranties</h3>
      <p className="mt-1 text-sm text-gray-500">You currently have no warranties registered or claimed.</p>
      <p className="mt-1 text-sm text-gray-500">Register a new warranty to see it here.</p>
    </div>
  );
};

