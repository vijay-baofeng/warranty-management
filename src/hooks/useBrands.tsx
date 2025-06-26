
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface Brand {
  id: string;
  name: string;
  description?: string;
  category_id?: string;
  website?: string;
  logo_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
}

export function useBrands() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchBrands = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('brands')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBrands(data || []);
    } catch (error) {
      console.error('Error fetching brands:', error);
      toast({
        title: "Error",
        description: "Failed to fetch brands",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const createBrand = async (brandData: Omit<Brand, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('brands')
        .insert([brandData])
        .select()
        .single();

      if (error) throw error;

      setBrands(prev => [data, ...prev]);
      toast({
        title: "Success",
        description: "Brand created successfully",
      });
      return data;
    } catch (error) {
      console.error('Error creating brand:', error);
      toast({
        title: "Error",
        description: "Failed to create brand",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateBrand = async (id: string, brandData: Partial<Brand>) => {
    try {
      const { data, error } = await supabase
        .from('brands')
        .update(brandData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setBrands(prev => prev.map(brand => brand.id === id ? data : brand));
      toast({
        title: "Success",
        description: "Brand updated successfully",
      });
      return data;
    } catch (error) {
      console.error('Error updating brand:', error);
      toast({
        title: "Error",
        description: "Failed to update brand",
        variant: "destructive",
      });
      throw error;
    }
  };

  const deleteBrand = async (id: string) => {
    try {
      const { error } = await supabase
        .from('brands')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setBrands(prev => prev.filter(brand => brand.id !== id));
      toast({
        title: "Success",
        description: "Brand deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting brand:', error);
      toast({
        title: "Error",
        description: "Failed to delete brand",
        variant: "destructive",
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchBrands();
    fetchCategories();
  }, []);

  return {
    brands,
    categories,
    loading,
    createBrand,
    updateBrand,
    deleteBrand,
    refreshBrands: fetchBrands,
  };
}
