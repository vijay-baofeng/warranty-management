import { useLocation, useNavigate, Routes, Route } from "react-router-dom";
import { AppSidebar } from "@/components/app-sidebar";
import { DashboardHeader } from "@/components/dashboard-header";
import { DashboardOverview } from "@/components/dashboard-overview";
import { ClaimsManager } from "@/components/claims-manager";
import { BrandsManager } from "@/components/brands-manager";
import { CategoriesManager } from "@/components/categories-manager";
import { ProductsManager } from "@/components/products-manager";
import { SerialNumbersManager } from "@/components/serial-numbers-manager";
import { SettingsManager } from "@/components/settings-manager";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { ThemeProvider } from "@/components/theme-provider";
import { useAuth } from "@/providers/AuthProvider";

export default function AdminDashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const { role } = useAuth();

  const setCurrentPage = (page: string) => {
    navigate(page);
  };

  const getCurrentPage = () => {
    const pathSegments = location.pathname.split("/").filter(Boolean);
    if (pathSegments.length > 1 && pathSegments[0] === "dashboard") {
      return pathSegments[1];
    }
    return "dashboard";
  };

  return (
    <ThemeProvider defaultTheme="light" storageKey="warranty-theme-admin">
      <SidebarProvider>
        <div className="flex min-h-screen w-full">
          <AppSidebar
            currentPage={getCurrentPage()}
            setCurrentPage={setCurrentPage}
            userRole={role}
          />
          <SidebarInset className="flex flex-col flex-1">
            <DashboardHeader />
            <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
              <Routes>
                <Route index element={<DashboardOverview />} />
                <Route path="claims" element={<ClaimsManager />} />
                <Route path="brands" element={<BrandsManager />} />
                <Route path="categories" element={<CategoriesManager />} />
                <Route path="products" element={<ProductsManager />} />
                <Route
                  path="serial-numbers"
                  element={<SerialNumbersManager />}
                />
                <Route path="settings" element={<SettingsManager />} />
                <Route path="*" element={<DashboardOverview />} />
              </Routes>
            </main>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </ThemeProvider>
  );
}
