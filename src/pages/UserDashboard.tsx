
import { useEffect } from "react";
import { useLocation, useNavigate, Routes, Route } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { UserAppSidebar } from "@/components/user-sidebar";
import { DashboardHeader } from "@/components/dashboard-header";
import { UserDashboardContent } from "@/components/user/UserDashboardContent";
import { ThemeProvider } from "@/components/theme-provider";
import { UserDashboardOverview } from "@/components/user/UserDashboardOverview";
import { RegisterWarrantyPage } from "@/components/user/RegisterWarrantyPage";
import { ClaimWarrantyPage } from "@/components/user/ClaimWarrantyPage";
import { TrackWarrantyPage } from "@/components/user/TrackWarrantyPage";
import { SubmitClaimPage } from "@/components/user/SubmitClaimPage";

const UserDashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const setCurrentPage = (page: string) => {
    navigate(page);
  };
  
  const getCurrentPageForSidebar = () => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    if (pathSegments.length > 1 && pathSegments[0] === 'dashboard') {
        if (pathSegments[1] === 'submit-claim' && pathSegments[2]) return 'claim-warranty';
        return pathSegments[1];
    }
    return "dashboard";
  }


  return (
    <ThemeProvider defaultTheme="light" storageKey="warranty-theme-user">
      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-background">
          <UserAppSidebar 
            currentPage={getCurrentPageForSidebar()} 
            setCurrentPage={setCurrentPage} 
          />
          <div className="flex-1 flex flex-col">
            <DashboardHeader />
            <main className="flex-1 p-6">
              <Routes>
                <Route index element={<UserDashboardOverview />} />
                <Route path="register-warranty" element={<RegisterWarrantyPage />} />
                <Route path="claim-warranty" element={<ClaimWarrantyPage />} />
                <Route path="track-warranty" element={<TrackWarrantyPage />} />
                <Route path="submit-claim/:serialNumberId" element={<SubmitClaimPage />} />
                <Route path="*" element={<UserDashboardOverview />} />
              </Routes>
            </main>
          </div>
        </div>
      </SidebarProvider>
    </ThemeProvider>
  );
};

export default UserDashboard;
