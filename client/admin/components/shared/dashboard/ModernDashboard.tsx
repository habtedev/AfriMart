"use client";
import { Suspense, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  ShoppingCart,
  Package,
  Layers,
  Users,
  TrendingUp,
  DollarSign,
  Activity,
  Calendar,
} from "lucide-react";
import { useAdminAuth } from "@/hooks/use-admin-auth";
import { formatCurrency } from "@/lib/utils";

// Dynamically import heavy chart components with loading states
const LineChart = dynamic(
  () => import("@/components/charts/line-chart").then((mod) => mod.LineChart),
  {
    ssr: false,
    loading: () => <ChartSkeleton />,
  }
);

const PieChart = dynamic(
  () => import("@/components/charts/pie-chart").then((mod) => mod.PieChart),
  {
    ssr: false,
    loading: () => <ChartSkeleton />,
  }
);

const BarChart = dynamic(
  () => import("@/components/charts/bar-chart").then((mod) => mod.BarChart),
  {
    ssr: false,
    loading: () => <ChartSkeleton />,
  }
);

// Types
interface DashboardStat {
  label: string;
  value: number;
  change?: number;
  icon: React.ReactNode;
  description?: string;
}

interface ChartDataPoint {
  date: string;
  orders: number;
  revenue: number;
  users: number;
}

interface CategoryData {
  name: string;
  value: number;
  color: string;
}

// Chart skeleton component
const ChartSkeleton = () => (
  <div className="h-64 w-full space-y-3">
    <Skeleton className="h-4 w-32" />
    <Skeleton className="h-full w-full" />
  </div>
);

// Stat card component
const StatCard = ({
  stat,
  isLoading,
}: {
  stat: DashboardStat;
  isLoading: boolean;
}) => (
  <Card className="shadow-sm border-border/40 transition-all hover:shadow-md hover:border-border/60">
    <CardHeader className="flex flex-row items-center justify-between pb-2">
      <CardTitle className="text-sm font-medium text-muted-foreground">
        {stat.label}
      </CardTitle>
      <div className="p-2 rounded-lg bg-primary/10">{stat.icon}</div>
    </CardHeader>
    <CardContent>
      {isLoading ? (
        <Skeleton className="h-8 w-20" />
      ) : (
        <>
          <div className="text-2xl font-bold">{stat.value.toLocaleString()}</div>
          {stat.change !== undefined && (
            <div className="flex items-center gap-1 mt-1">
              <Badge
                variant={stat.change >= 0 ? "default" : "destructive"}
                className="text-xs"
              >
                <TrendingUp className="w-3 h-3 mr-1" />
                {stat.change >= 0 ? "+" : ""}
                {stat.change}%
              </Badge>
              <span className="text-xs text-muted-foreground">vs last month</span>
            </div>
          )}
          {stat.description && (
            <p className="text-xs text-muted-foreground mt-2">
              {stat.description}
            </p>
          )}
        </>
      )}
    </CardContent>
  </Card>
);

// Loading state component
const DashboardLoading = () => (
  <div className="space-y-8">
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="h-32 rounded-xl" />
      ))}
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Skeleton className="h-96 rounded-xl" />
      <Skeleton className="h-96 rounded-xl" />
    </div>
  </div>
);

export default function ModernDashboard() {

  const { user, isLoading, isAuthenticated } = useAdminAuth();

  // Removed early return to ensure all hooks are always called and only one return is used

  // Memoized stats data
  const stats = useMemo<DashboardStat[]>(
    () => [
      {
        label: "Total Revenue",
        value: 15230,
        change: 12.5,
        icon: <DollarSign className="w-5 h-5 text-primary" />,
        description: "Monthly revenue",
      },
      {
        label: "Orders",
        value: 128,
        change: 8.2,
        icon: <ShoppingCart className="w-5 h-5 text-blue-600" />,
        description: "New orders this month",
      },
      {
        label: "Products",
        value: 156,
        change: -2.1,
        icon: <Package className="w-5 h-5 text-green-600" />,
        description: "Active products",
      },
      {
        label: "Users",
        value: 3247,
        change: 15.7,
        icon: <Users className="w-5 h-5 text-orange-600" />,
        description: "Active customers",
      },
    ],
    []
  );

  // Memoized chart data
  const chartData = useMemo<ChartDataPoint[]>(
    () => [
      { date: "Jan", orders: 65, revenue: 12000, users: 120 },
      { date: "Feb", orders: 78, revenue: 14500, users: 145 },
      { date: "Mar", orders: 92, revenue: 16500, users: 165 },
      { date: "Apr", orders: 84, revenue: 14200, users: 142 },
      { date: "May", orders: 105, revenue: 18900, users: 189 },
      { date: "Jun", orders: 128, revenue: 22000, users: 220 },
      { date: "Jul", orders: 95, revenue: 17200, users: 172 },
    ],
    []
  );

  const categoryData = useMemo<CategoryData[]>(
    () => [
      { name: "Electronics", value: 35, color: "#3b82f6" },
      { name: "Clothing", value: 25, color: "#10b981" },
      { name: "Books", value: 20, color: "#f59e42" },
      { name: "Home & Garden", value: 15, color: "#8b5cf6" },
      { name: "Other", value: 5, color: "#ef4444" },
    ],
    []
  );

  if (isLoading) {
    return <DashboardLoading />;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {user?.name || "Admin"}! Here&apos;s what&apos;s happening
          with your store today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <StatCard key={stat.label} stat={stat} isLoading={isLoading} />
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Line Chart Card */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Revenue Overview</CardTitle>
            <CardDescription>
              Monthly revenue and orders trend
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer>
              <LineChart data={chartData} />
              <ChartTooltip>
                <ChartTooltipContent>
                  {/* Custom tooltip content can go here if needed */}
                </ChartTooltipContent>
              </ChartTooltip>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Pie Chart Card */}
        <Card>
          <CardHeader>
            <CardTitle>Product Categories</CardTitle>
            <CardDescription>Sales distribution by category</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            {/* Transform categoryData to Chart.js format for PieChart */}
            <div className="h-64 w-full">
              <PieChart
                data={{
                  labels: categoryData.map((c) => c.name),
                  datasets: [
                    {
                      data: categoryData.map((c) => c.value),
                      backgroundColor: categoryData.map((c) => c.color),
                    },
                  ],
                }}
              />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mt-4">
              {categoryData.map((category) => (
                <div
                  key={category.name}
                  className="flex items-center gap-2 text-xs"
                >
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: category.color }}
                  />
                  <span className="truncate">{category.name}</span>
                  <span className="font-medium">{category.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Data */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="col-span-1 lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest orders and user registrations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { action: "New order #ORD-789", user: "John Doe", time: "10 min ago" },
                { action: "User registration", user: "Alice Smith", time: "25 min ago" },
                { action: "Product update", user: "Admin", time: "1 hour ago" },
                { action: "Payment received", user: "Bob Johnson", time: "2 hours ago" },
              ].map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                >
                  <div className="flex items-center gap-3">
                    <Activity className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{item.action}</p>
                      <p className="text-sm text-muted-foreground">by {item.user}</p>
                    </div>
                  </div>
                  <span className="text-sm text-muted-foreground">{item.time}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Stats</CardTitle>
            <CardDescription>Performance metrics</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Conversion Rate</span>
              <span className="font-semibold">3.2%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Avg. Order Value</span>
              <span className="font-semibold">{formatCurrency(118.98)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Customer Satisfaction</span>
              <span className="font-semibold">94.5%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Return Rate</span>
              <span className="font-semibold text-destructive">2.8%</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}