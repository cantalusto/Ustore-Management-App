"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TrendingUp, TrendingDown, Users, CheckSquare, AlertTriangle } from "lucide-react"

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

export function AnalyticsOverview({ userRole }: AnalyticsOverviewProps) {
  const [stats, setStats] = useState<OverviewStats | null>(null)
  const [timeRange, setTimeRange] = useState("30d")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchOverviewStats()
  }, [timeRange])

  const fetchOverviewStats = async () => {
    try {
      const response = await fetch(`/api/analytics/overview?range=${timeRange}`)
      const data = await response.json()
      setStats(data.stats)
    } catch (error) {
      console.error("Failed to fetch overview stats:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading || !stats) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading analytics...</div>
        </CardContent>
      </Card>
    )
  }

  const statCards = [
    {
      title: "Total Tasks",
      value: stats.totalTasks.toString(),
      icon: CheckSquare,
      trend: stats.trends.tasks,
      description: "All tasks in system",
    },
    {
      title: "Completion Rate",
      value: `${stats.completionRate}%`,
      icon: TrendingUp,
      trend: stats.trends.completion,
      description: "Tasks completed on time",
    },
    {
      title: "Active Members",
      value: stats.activeMembers.toString(),
      icon: Users,
      trend: stats.trends.members,
      description: "Team members with tasks",
    },
    {
      title: "Overdue Tasks",
      value: stats.overdueTasks.toString(),
      icon: AlertTriangle,
      trend: -stats.overdueTasks,
      description: "Tasks past due date",
      isNegative: true,
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Overview</h2>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">7 days</SelectItem>
            <SelectItem value="30d">30 days</SelectItem>
            <SelectItem value="90d">90 days</SelectItem>
          </SelectContent>
        </Select>
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
                {stat.trend > 0 ? (
                  <TrendingUp className={`h-3 w-3 ${stat.isNegative ? "text-red-500" : "text-green-500"}`} />
                ) : (
                  <TrendingDown className={`h-3 w-3 ${stat.isNegative ? "text-green-500" : "text-red-500"}`} />
                )}
                <span className={stat.trend > 0 && !stat.isNegative ? "text-green-600" : "text-red-600"}>
                  {Math.abs(stat.trend)}
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
