import { useAuth } from "@/providers/AuthProvider";
import UserDashboard from "@/pages/UserDashboard";
import AdminDashboard from "@/pages/AdminDashboard";
import { Loader2 } from "lucide-react";
import { Navigate } from "react-router-dom";

export function RoleBasedDashboard() {
  const { role, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-16 w-16 animate-spin" />
      </div>
    );
  }

  if (role === "admin" || role === "super_admin") {
    return <AdminDashboard />;
  }

  if (role === "end_user") {
    return <UserDashboard />;
  }

  return <Navigate to="/login" replace />;
}
