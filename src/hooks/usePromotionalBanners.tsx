
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';

export type PromotionalBanner = Tables<'promotional_banners'>;

const fetchPromotionalBanners = async () => {
  const { data, error } = await supabase
    .from('promotional_banners')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching promotional banners:', error);
    throw new Error(error.message);
  }
  return data || [];
};

export function usePromotionalBanners() {
  return useQuery<PromotionalBanner[], Error>({
    queryKey: ['promotionalBanners'],
    queryFn: fetchPromotionalBanners,
  });
}
