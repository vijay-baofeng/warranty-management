import { UserDashboardOverview } from "@/components/user/UserDashboardOverview";
import { RegisterWarrantyPage } from "@/components/user/RegisterWarrantyPage";
import { ClaimWarrantyPage } from "@/components/user/ClaimWarrantyPage";
import { TrackWarrantyPage } from "@/components/user/TrackWarrantyPage";
import { SubmitClaimPage } from "@/components/user/SubmitClaimPage";

interface UserDashboardContentProps {
  currentPage: string;
  serialNumberId?: string;
}

export function UserDashboardContent({ currentPage }: UserDashboardContentProps) {
  const renderContent = () => {
    switch (currentPage) {
      case "dashboard":
        return <UserDashboardOverview />;
      case "register-warranty":
        return <RegisterWarrantyPage />;
      case "claim-warranty":
        return <ClaimWarrantyPage />;
      case "track-warranty":
        return <TrackWarrantyPage />;
      case "submit-claim":
        return <SubmitClaimPage />;
      default:
        return <UserDashboardOverview />;
    }
  };

  return <div className="space-y-6">{renderContent()}</div>;
}
