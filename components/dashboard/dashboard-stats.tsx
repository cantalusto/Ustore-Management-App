// components/dashboard/dashboard-stats.tsx
"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, CheckSquare, Clock, TrendingUp } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

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
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
      title: "Total de Membros da Equipe",
      value: stats.totalMembers.toString(),
      icon: Users,
      description: "Membros cadastrados",
      visible: ["admin", "manager"],
    },
    {
      title: "Tarefas Ativas",
      value: stats.activeTasks.toString(),
      icon: CheckSquare,
      description: "Não concluídas",
      visible: ["admin", "manager", "member"],
    },
    {
      title: "Revisões Pendentes",
      value: stats.pendingReviews.toString(),
      icon: Clock,
      description: "Aguardando aprovação",
      visible: ["admin", "manager"],
    },
    {
      title: "Performance da Equipe",
      value: `${stats.completionRate}%`,
      icon: TrendingUp,
      description: "Taxa de conclusão",
      visible: ["admin", "manager"],
    },
  ];

  const visibleStats = allStats.filter((stat) => stat.visible.includes(userRole));

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {visibleStats.map((stat, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <stat.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground">{stat.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}