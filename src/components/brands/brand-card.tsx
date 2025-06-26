
import { Edit, Trash2, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Brand } from "@/hooks/useBrands";

interface BrandCardProps {
  brand: Brand;
  categoryName: string;
  onEdit: (brand: Brand) => void;
  onDelete: (id: string) => void;
}

export function BrandCard({ brand, categoryName, onEdit, onDelete }: BrandCardProps) {
  return (
    <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent transition-colors">
      <div className="flex items-center gap-4">
        {brand.logo_url && (
          <img 
            src={brand.logo_url} 
            alt={`${brand.name} logo`}
            className="w-12 h-12 object-contain rounded"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        )}
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-semibold">{brand.name}</h3>
            {brand.website && (
              <a 
                href={brand.website} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-500 hover:text-blue-700"
              >
                <Globe className="h-4 w-4" />
              </a>
            )}
          </div>
          <p className="text-sm text-muted-foreground">{brand.description}</p>
          <p className="text-xs text-muted-foreground">
            Category: {categoryName}
          </p>
        </div>
      </div>
      <div className="flex gap-2">
        <Button variant="ghost" size="sm" onClick={() => onEdit(brand)}>
          <Edit className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={() => onDelete(brand.id)}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
