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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-slide-in-down">
        <h2 className="text-2xl font-semibold bg-gradient-to-r from-primary via-blue-600 to-purple-600 bg-clip-text text-transparent">
          {t('analytics.overview')}
        </h2>
        <div className="flex flex-col sm:flex-row gap-2 animate-fade-in" style={{ animationDelay: '100ms' }}>
          <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
            <SelectTrigger className="w-full sm:w-[180px] hover:border-primary transition-colors">
              <SelectValue placeholder={t('teams.department_filter')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('teams.all_departments')}</SelectItem>
              {departments.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={selectedMember} onValueChange={setSelectedMember}>
            <SelectTrigger className="w-full sm:w-[180px] hover:border-primary transition-colors">
              <SelectValue placeholder={t('teams.all_members')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('teams.all_members')}</SelectItem>
              {allMembers.map(m => <SelectItem key={m.id} value={m.id.toString()}>{m.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-full sm:w-32 hover:border-primary transition-colors">
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
        {statCards.map((stat, index) => {
          const gradientColors = [
            'from-blue-500 to-cyan-500',
            'from-green-500 to-emerald-500',
            'from-orange-500 to-red-500',
            'from-purple-500 to-pink-500'
          ]
          
          return (
            <Card 
              key={index}
              className="animate-scale-in hover:-translate-y-1 transition-all duration-300 hover:shadow-xl border-2 hover:border-primary/50 relative overflow-hidden group"
              style={{ animationDelay: `${(index + 2) * 100}ms` }}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${gradientColors[index]} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <div className={`p-2 rounded-lg bg-gradient-to-br ${gradientColors[index]} bg-opacity-10 backdrop-blur-sm`}>
                  <stat.icon className="h-4 w-4 text-foreground" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent">
                  {stat.value}
                </div>
                <div className="flex items-center space-x-1 text-xs mt-2">
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
          )
        })}
      </div>
    </div>
  )
}