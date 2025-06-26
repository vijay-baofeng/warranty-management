
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BrandCard } from "./brand-card";
import { Brand, Category } from "@/hooks/useBrands";

interface BrandListProps {
  brands: Brand[];
  categories: Category[];
  loading: boolean;
  onEdit: (brand: Brand) => void;
  onDelete: (id: string) => void;
}

export function BrandList({ brands, categories, loading, onEdit, onDelete }: BrandListProps) {
  const getCategoryName = (categoryId: string) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category?.name || "No category";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>All Brands ({brands.length})</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-8">Loading brands...</div>
        ) : (
          <div className="space-y-4">
            {brands.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No brands found. Create your first brand to get started.
              </div>
            ) : (
              brands.map((brand) => (
                <BrandCard
                  key={brand.id}
                  brand={brand}
                  categoryName={getCategoryName(brand.category_id || "")}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              ))
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
