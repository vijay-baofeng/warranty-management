
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { Product } from "@/hooks/useProducts";
import { Category } from "@/hooks/useCategories";

interface ProductFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (product: any) => void;
  editingProduct: Product | null;
  categories: Category[];
}

const warrantyDurationOptions = [
  { value: "3", label: "3 Months" },
  { value: "6", label: "6 Months" },
  { value: "12", label: "12 Months" },
  { value: "24", label: "24 Months" },
  { value: "36", label: "36 Months" },
];

export function ProductForm({ isOpen, onClose, onSubmit, editingProduct, categories }: ProductFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    mobile: "",
    serial_no_prefix: "",
    manufacturer_name: "",
    category_id: "",
    image_url: "",
    warranty_duration: "12",
    description: ""
  });
  const [imagePreview, setImagePreview] = useState<string>("");

  useEffect(() => {
    if (editingProduct) {
      setFormData({
        name: editingProduct.name || "",
        mobile: editingProduct.mobile || "",
        serial_no_prefix: editingProduct.serial_no_prefix || "",
        manufacturer_name: editingProduct.manufacturer_name || "",
        category_id: editingProduct.category_id || "",
        image_url: editingProduct.image_url || "",
        warranty_duration: editingProduct.warranty_duration?.toString() || "12",
        description: editingProduct.description || ""
      });
      setImagePreview(editingProduct.image_url || "");
    } else {
      setFormData({
        name: "",
        mobile: "",
        serial_no_prefix: "",
        manufacturer_name: "",
        category_id: "",
        image_url: "",
        warranty_duration: "12",
        description: ""
      });
      setImagePreview("");
    }
  }, [editingProduct, isOpen]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setImagePreview(result);
        setFormData({ ...formData, image_url: result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const submitData = {
      ...formData,
      warranty_duration: parseInt(formData.warranty_duration),
      category_id: formData.category_id || null
    };
    onSubmit(submitData);
  };

  const handleCancel = () => {
    setFormData({
      name: "",
      mobile: "",
      serial_no_prefix: "",
      manufacturer_name: "",
      category_id: "",
      image_url: "",
      warranty_duration: "12",
      description: ""
    });
    setImagePreview("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingProduct ? "Edit Product" : "Add New Product"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter product name"
                required
              />
            </div>
            <div>
              <Label htmlFor="mobile">Mobile</Label>
              <Input
                id="mobile"
                value={formData.mobile}
                onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                placeholder="Enter mobile number"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="serialNoPrefix">Serial No Prefix</Label>
              <Input
                id="serialNoPrefix"
                value={formData.serial_no_prefix}
                onChange={(e) => setFormData({ ...formData, serial_no_prefix: e.target.value })}
                placeholder="Enter serial number prefix"
                required
              />
            </div>
            <div>
              <Label htmlFor="manufacturerName">Manufacturer Name</Label>
              <Input
                id="manufacturerName"
                value={formData.manufacturer_name}
                onChange={(e) => setFormData({ ...formData, manufacturer_name: e.target.value })}
                placeholder="Enter manufacturer name"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="category">Category</Label>
              <Select value={formData.category_id} onValueChange={(value) => setFormData({ ...formData, category_id: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="warrantyDuration">Warranty Duration</Label>
              <Select value={formData.warranty_duration} onValueChange={(value) => setFormData({ ...formData, warranty_duration: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select warranty duration" />
                </SelectTrigger>
                <SelectContent>
                  {warrantyDurationOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="image">Upload Image</Label>
            <Input
              id="image"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="cursor-pointer"
            />
            {imagePreview && (
              <div className="mt-2">
                <img 
                  src={imagePreview} 
                  alt="Preview" 
                  className="w-20 h-20 object-cover rounded border"
                />
              </div>
            )}
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Enter product description"
              rows={3}
            />
          </div>

          <div className="flex gap-2 justify-end pt-4">
            <Button type="button" variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button type="submit">
              Submit
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
