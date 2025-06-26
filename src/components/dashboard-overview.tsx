
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Clock, CheckCircle, XCircle } from "lucide-react";
import { useClaimRequests } from "@/hooks/useClaimRequests";
import { useSerialNumbers } from "@/hooks/useSerialNumbers";
import { format } from "date-fns";

export function DashboardOverview() {
  const { claimRequests, loading: claimsLoading } = useClaimRequests();
  const { serialNumbers, loading: serialsLoading } = useSerialNumbers();

  // Calculate statistics from real data
  const totalClaims = claimRequests.length;
  const pendingClaims = claimRequests.filter(claim => 
    claim.serial_number?.status === 'claimed'
  ).length;
  const registeredSerials = serialNumbers.filter(serial => 
    serial.status === 'registered'
  ).length;
  const claimedSerials = serialNumbers.filter(serial => 
    serial.status === 'claimed'
  ).length;

  const stats = [
    {
      title: "Total Claims",
      value: claimsLoading ? "..." : totalClaims.toString(),
      icon: FileText,
      trend: "+12%",
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-50 dark:bg-blue-900/20",
    },
    {
      title: "Pending Claims",
      value: claimsLoading ? "..." : pendingClaims.toString(),
      icon: Clock,
      trend: "+5%",
      color: "text-yellow-600 dark:text-yellow-400",
      bgColor: "bg-yellow-50 dark:bg-yellow-900/20",
    },
    {
      title: "Registered Warranties",
      value: serialsLoading ? "..." : registeredSerials.toString(),
      icon: CheckCircle,
      trend: "+8%",
      color: "text-green-600 dark:text-green-400",
      bgColor: "bg-green-50 dark:bg-green-900/20",
    },
    {
      title: "Claimed Warranties",
      value: serialsLoading ? "..." : claimedSerials.toString(),
      icon: XCircle,
      trend: "-2%",
      color: "text-orange-600 dark:text-orange-400",
      bgColor: "bg-orange-50 dark:bg-orange-900/20",
    },
  ];

  const recentClaims = claimRequests.slice(0, 5);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back! Here's an overview of your warranty claims system.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card key={stat.title} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                <span className={stat.trend.startsWith('+') ? 'text-green-600' : 'text-red-600'}>
                  {stat.trend}
                </span>
                {" "}from last month
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Claims</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentClaims.length > 0 ? (
                recentClaims.map((claim) => (
                  <div key={claim.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">Claim #{claim.id.slice(0, 8)}</p>
                      <p className="text-sm text-muted-foreground">
                        {claim.serial_number?.products?.name || 'Unknown Product'} - 
                        Serial: {claim.serial_number?.serial_number?.slice(0, 8) || 'N/A'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {claim.complaint_title}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400">
                        {claim.serial_number?.status || 'Unknown'}
                      </span>
                      <p className="text-xs text-muted-foreground mt-1">
                        {format(new Date(claim.created_at), 'MMM dd')}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  {claimsLoading ? "Loading claims..." : "No claims found"}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg hover:bg-accent transition-colors cursor-pointer">
                <FileText className="h-8 w-8 mb-2 text-blue-600" />
                <h3 className="font-medium">View Claims</h3>
                <p className="text-sm text-muted-foreground">Review all warranty claims</p>
              </div>
              <div className="p-4 border rounded-lg hover:bg-accent transition-colors cursor-pointer">
                <CheckCircle className="h-8 w-8 mb-2 text-green-600" />
                <h3 className="font-medium">Manage Serial Numbers</h3>
                <p className="text-sm text-muted-foreground">Add or update warranties</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
