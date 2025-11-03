// components/dashboard/dashboard-stats.tsx
"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, CheckSquare, Clock, TrendingUp } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { useLanguage } from "@/contexts/language-context"

interface DashboardStatsProps {
  userRole: string
}

interface StatsData {
  totalMembers: number;
  activeTasks: number;
  pendingReviews: number;
  completionRate: number;
}

export function DashboardStats({ userRole }: DashboardStatsProps) {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const { t } = useLanguage();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/dashboard/stats');
        const data = await response.json();
        setStats(data);
      } catch (error) {
        console.error("Failed to fetch dashboard stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading || !stats) {
    return (
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-[150px]" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-[50px] mb-2" />
              <Skeleton className="h-3 w-[100px]" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const allStats = [
    {
      title: t('dashboard.stats.total_members'),
      value: stats.totalMembers.toString(),
      icon: Users,
      description: t('dashboard.stats.members_registered'),
      visible: ["admin", "manager"],
    },
    {
      title: t('dashboard.stats.active_tasks'),
      value: stats.activeTasks.toString(),
      icon: CheckSquare,
      description: t('dashboard.stats.not_completed'),
      visible: ["admin", "manager", "member"],
    },
    {
      title: t('dashboard.stats.pending_reviews'),
      value: stats.pendingReviews.toString(),
      icon: Clock,
      description: t('dashboard.stats.awaiting_approval'),
      visible: ["admin", "manager"],
    },
    {
      title: t('dashboard.stats.team_performance'),
      value: `${stats.completionRate}%`,
      icon: TrendingUp,
      description: t('dashboard.stats.completion_rate'),
      visible: ["admin", "manager"],
    },
  ];

  const visibleStats = allStats.filter((stat) => stat.visible.includes(userRole));

  const getGradientClass = (index: number) => {
    const gradients = [
      "bg-gradient-to-br from-blue-500 to-blue-600",
      "bg-gradient-to-br from-green-500 to-green-600",
      "bg-gradient-to-br from-orange-500 to-orange-600",
      "bg-gradient-to-br from-purple-500 to-purple-600",
    ];
    return gradients[index % gradients.length];
  };

  return (
    <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
      {visibleStats.map((stat, index) => (
        <Card 
          key={index}
          className="group relative overflow-hidden border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 animate-scale-in"
          style={{ animationDelay: `${index * 100}ms` }}
        >
          {/* Background gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-sm font-medium transition-colors group-hover:text-primary">{stat.title}</CardTitle>
            <div className={`p-2 rounded-lg ${getGradientClass(index)} shadow-lg group-hover:animate-bounce-subtle transition-transform`}>
              <stat.icon className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              {stat.value}
            </div>
            <p className="text-xs text-muted-foreground mt-1 group-hover:text-foreground/70 transition-colors">
              {stat.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}