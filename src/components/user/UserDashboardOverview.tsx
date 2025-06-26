
import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { usePromotionalBanners, PromotionalBanner } from "@/hooks/usePromotionalBanners";
import { useUserWarranties } from '@/hooks/useUserWarranties';
import { ShieldCheck, FileText, Clock, Award, Loader2 } from "lucide-react";
import { addMonths, parseISO, isValid, differenceInDays } from 'date-fns';
import { Skeleton } from "@/components/ui/skeleton";

export function UserDashboardOverview() {
  const { data: banners, isLoading: isLoadingBanners, error: bannersError } = usePromotionalBanners();
  const { userWarranties, loading: warrantyLoading } = useUserWarranties();

  const dashboardStats = useMemo(() => {
    if (warrantyLoading) {
      return {
        registered: <Skeleton className="h-8 w-10 inline-block" />,
        claimed: <Skeleton className="h-8 w-10 inline-block" />,
        expired: <Skeleton className="h-8 w-10 inline-block" />,
      };
    }

    const registeredCount = userWarranties.filter(sn => sn.status === 'registered' || sn.status === 'claimed').length;
    const claimedCount = userWarranties.filter(sn => sn.status === 'claimed').length;
    
    let expiredCount = 0;
    userWarranties.forEach(sn => {
      if (sn.purchase_date && sn.products?.warranty_duration) {
        const purchaseDateObj = parseISO(sn.purchase_date);
        if (isValid(purchaseDateObj)) {
          const expiryDate = addMonths(purchaseDateObj, sn.products.warranty_duration);
          if (differenceInDays(expiryDate, new Date()) < 0) {
            expiredCount++;
          }
        }
      }
    });

    return {
      registered: registeredCount.toString(),
      claimed: claimedCount.toString(),
      expired: expiredCount.toString(),
    };
  }, [userWarranties, warrantyLoading]);

  const overviewStats = [
    {
      title: "Registered Warranty",
      value: dashboardStats.registered,
      icon: ShieldCheck,
      bgColor: "bg-blue-100 dark:bg-blue-900/30",
      iconColor: "text-blue-600 dark:text-blue-400",
    },
    {
      title: "Warranty Claimed",
      value: dashboardStats.claimed,
      icon: FileText,
      bgColor: "bg-green-100 dark:bg-green-900/30",
      iconColor: "text-green-600 dark:text-green-400",
    },
    {
      title: "Expired Warranty",
      value: dashboardStats.expired,
      icon: Clock,
      bgColor: "bg-yellow-100 dark:bg-yellow-900/30",
      iconColor: "text-yellow-600 dark:text-yellow-400",
    },
    {
      title: "WPC Certificate",
      value: "0", 
      icon: Award,
      bgColor: "bg-indigo-100 dark:bg-indigo-900/30",
      iconColor: "text-indigo-600 dark:text-indigo-400",
    },
  ];

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>My Dashboard</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Welcome to your warranty dashboard. Here you can manage your registered products and claims.
          </p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {overviewStats.map((stat) => (
          <Card key={stat.title} className="hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-md ${stat.bgColor}`}>
                <stat.icon className={`h-5 w-5 ${stat.iconColor}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div>
        <h2 className="text-2xl font-semibold mb-4">Promotions & Updates</h2>
        {isLoadingBanners && (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="ml-2">Loading banners...</p>
          </div>
        )}
        {bannersError && (
          <div className="text-red-500 p-4 border border-red-500/50 bg-red-50 rounded-md">
            <p>Could not load promotional banners: {bannersError.message}</p>
          </div>
        )}
        {!isLoadingBanners && !bannersError && banners && banners.length > 0 && (
          <Carousel
            opts={{
              align: "start",
              loop: true,
            }}
            plugins={[
              Autoplay({
                delay: 5000,
                stopOnInteraction: true,
              }),
            ]}
            className="w-full"
          >
            <CarouselContent>
              {banners.map((banner: PromotionalBanner) => (
                <CarouselItem key={banner.id} className="md:basis-1/2 lg:basis-1/3">
                  <Card className="overflow-hidden h-full flex flex-col">
                    <div className="aspect-video w-full overflow-hidden">
                      <img
                        src={banner.image_url}
                        alt={banner.title || "Promotional Banner"}
                        className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                      />
                    </div>
                    <CardHeader className="pb-2">
                      {banner.title && <CardTitle className="text-lg">{banner.title}</CardTitle>}
                    </CardHeader>
                    <CardContent className="flex-grow">
                      {banner.description && (
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-3">
                          {banner.description}
                        </p>
                      )}
                      {banner.link_url && (
                        <a
                          href={banner.link_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-primary hover:underline"
                        >
                          Learn More &rarr;
                        </a>
                      )}
                    </CardContent>
                  </Card>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="left-2" />
            <CarouselNext className="right-2" />
          </Carousel>
        )}
        {!isLoadingBanners && !bannersError && (!banners || banners.length === 0) && (
          <div className="text-center text-muted-foreground py-10">
            <p>No active promotions at the moment. Check back later!</p>
          </div>
        )}
      </div>
    </div>
  );
}
