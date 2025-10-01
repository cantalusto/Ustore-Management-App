"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TrendingUp, TrendingDown, Users, CheckSquare, AlertTriangle } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"

interface OverviewStats {
  totalTasks: number
  completedTasks: number
  overdueTasks: number
  activeMembers: number
  completionRate: number
  avgCompletionTime: number
  trends: {
    tasks: number
    completion: number
    members: number
  }
}

interface AnalyticsOverviewProps {
  userRole: string
}

interface MemberPerformance {
    id: number;
    name: string;
    department: string;
}

export function AnalyticsOverview({ userRole }: AnalyticsOverviewProps) {
  const { t } = useLanguage()
  const [stats, setStats] = useState<OverviewStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState("30d")
  const [departments, setDepartments] = useState<string[]>([])
  const [allMembers, setAllMembers] = useState<MemberPerformance[]>([])
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all')
  const [selectedMember, setSelectedMember] = useState<string>('all')

  useEffect(() => {
    const fetchFilterData = async () => {
      try {
        const response = await fetch('/api/analytics/team-performance');
        const data = await response.json();
        if (data.members) {
            setAllMembers(data.members);
            const uniqueDepartments = [...new Set(data.members.map((m: MemberPerformance) => m.department))] as string[];
            setDepartments(uniqueDepartments);
        }
      } catch (error) {
        console.error("Failed to fetch filter data:", error);
      }
    };
    fetchFilterData();
  }, []);

  useEffect(() => {
    fetchOverviewStats()
  }, [timeRange, selectedDepartment, selectedMember])

  const fetchOverviewStats = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.append('range', timeRange)
      if (selectedDepartment !== 'all') params.append('department', selectedDepartment)
      if (selectedMember !== 'all') params.append('memberId', selectedMember)
      
      const response = await fetch(`/api/analytics/overview?${params.toString()}`)
      const data = await response.json()
      setStats(data.stats)
    } catch (error) {
      console.error(t('analytics.fetch_error'), error)
    } finally {
      setLoading(false)
    }
  }

  if (loading || !stats) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">{t('analytics.loading')}</div>
        </CardContent>
      </Card>
    )
  }

  const statCards = [
    {
      title: t('analytics.total_tasks'),
      value: stats.totalTasks.toString(),
      icon: CheckSquare,
      trend: stats.trends.tasks,
      description: t('analytics.created_in_period'),
    },
    {
      title: t('analytics.completion_rate'),
      value: `${stats.completionRate}%`,
      icon: TrendingUp,
      trend: stats.trends.completion,
      description: t('analytics.completed_on_time'),
    },
    {
      title: t('analytics.active_members'),
      value: stats.activeMembers.toString(),
      icon: Users,
      trend: stats.trends.members,
      description: t('analytics.in_filter'),
    },
    {
      title: t('analytics.overdue_tasks'),
      value: stats.overdueTasks.toString(),
      icon: AlertTriangle,
      trend: -stats.overdueTasks,
      description: t('analytics.after_deadline'),
      isNegative: true,
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h2 className="text-xl font-semibold">{t('analytics.overview')}</h2>
        <div className="flex gap-2">
          <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder={t('teams.department_filter')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('teams.all_departments')}</SelectItem>
              {departments.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={selectedMember} onValueChange={setSelectedMember}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder={t('teams.all_members')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('teams.all_members')}</SelectItem>
              {allMembers.map(m => <SelectItem key={m.id} value={m.id.toString()}>{m.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">{t('analytics.time_range.7d')}</SelectItem>
              <SelectItem value="30d">{t('analytics.time_range.30d')}</SelectItem>
              <SelectItem value="90d">{t('analytics.time_range.90d')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="flex items-center space-x-1 text-xs">
                {stat.trend >= 0 ? (
                  <TrendingUp className={`h-3 w-3 ${stat.isNegative ? "text-red-500" : "text-green-500"}`} />
                ) : (
                  <TrendingDown className={`h-3 w-3 ${stat.isNegative ? "text-green-500" : "text-red-500"}`} />
                )}
                <span className={stat.trend >= 0 && !stat.isNegative ? "text-green-600" : "text-red-600"}>
                  {Math.abs(stat.trend)}%
                </span>
                <span className="text-muted-foreground">{stat.description}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}