"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Bar, BarChart, Line, LineChart, Pie, PieChart, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { useLanguage } from "@/contexts/language-context"

interface TaskAnalyticsData {
  statusDistribution: Array<{ name: string; value: number; color: string }>
  priorityDistribution: Array<{ name: string; value: number; color: string }>
  completionTrend: Array<{ date: string; completed: number; created: number }>
  departmentStats: Array<{ department: string; completed: number; pending: number }>
}

interface TaskAnalyticsProps {
  userRole: string
}

interface MemberPerformance {
    id: number;
    name: string;
    department: string;
}

export function TaskAnalytics({ userRole }: TaskAnalyticsProps) {
  const { t } = useLanguage()
  const [data, setData] = useState<TaskAnalyticsData | null>(null)
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
    fetchTaskAnalytics()
  }, [timeRange, selectedDepartment, selectedMember])

  const fetchTaskAnalytics = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.append('range', timeRange)
      if (selectedDepartment !== 'all') params.append('department', selectedDepartment)
      if (selectedMember !== 'all') params.append('memberId', selectedMember)

      const response = await fetch(`/api/analytics/tasks?${params.toString()}`)
      const result = await response.json()
      setData(result.data)
    } catch (error) {
      console.error(t('analytics.task_analysis_error'), error)
    } finally {
      setLoading(false)
    }
  }

  const tooltipStyle = {
    backgroundColor: '#ffffff',
    color: '#000000',
    border: '1px solid #cccccc',
    borderRadius: '0.5rem',
    padding: '8px',
  };

  if (loading || !data) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">{t('analytics.task_analysis_loading')}</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-xl font-semibold">{t('analytics.tabs.tasks')}</h2>
        <div className="flex flex-col sm:flex-row gap-2">
          <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder={t('teams.department_filter')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('teams.all_departments')}</SelectItem>
              {departments.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={selectedMember} onValueChange={setSelectedMember}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder={t('teams.all_members')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('teams.all_members')}</SelectItem>
              {allMembers.map(m => <SelectItem key={m.id} value={m.id.toString()}>{m.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-full sm:w-32">
              <SelectValue placeholder={t('analytics.time_range')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">{t('analytics.last_7_days')}</SelectItem>
              <SelectItem value="30d">{t('analytics.time_range.30d')}</SelectItem>
              <SelectItem value="90d">{t('analytics.last_90_days')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <Card>
          <CardHeader><CardTitle className="text-base sm:text-lg">{t('analytics.status_distribution')}</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie 
                  data={data.statusDistribution} 
                  cx="50%" 
                  cy="50%" 
                  outerRadius={70} 
                  dataKey="value" 
                  label={({ name, percent }: any) => percent > 0.05 ? `${name} ${(percent * 100).toFixed(0)}%` : ''}
                  labelLine={false}
                >
                  {data.statusDistribution.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.color} />))}
                </Pie>
                <Tooltip 
                  contentStyle={tooltipStyle} 
                  formatter={(value: any, name: any) => [`${value}`, name]}
                />
                <Legend 
                  verticalAlign="bottom" 
                  height={36}
                  formatter={(value: any) => <span className="text-sm">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base sm:text-lg">{t('analytics.priority_distribution')}</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.priorityDistribution} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  angle={-45}
                  textAnchor="end"
                  height={60}
                  interval={0}
                  fontSize={12}
                />
                <YAxis />
                <Tooltip contentStyle={tooltipStyle} cursor={{fill: 'rgba(200, 200, 200, 0.2)'}} />
                <Bar dataKey="value" fill="#6366f1" name={t('analytics.quantity')} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <Card>
          <CardHeader><CardTitle className="text-base sm:text-lg">{t('analytics.completion_trend')}</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data.completionTrend} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  angle={-45}
                  textAnchor="end"
                  height={60}
                  interval={0}
                  fontSize={12}
                />
                <YAxis />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend />
                <Line type="monotone" dataKey="completed" stroke="#10b981" name={t('analytics.completed')} />
                <Line type="monotone" dataKey="created" stroke="#3b82f6" name={t('analytics.created')} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base sm:text-lg">{t('analytics.department_performance')}</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.departmentStats} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="department" 
                  angle={-45}
                  textAnchor="end"
                  height={60}
                  interval={0}
                  fontSize={12}
                />
                <YAxis />
                <Tooltip contentStyle={tooltipStyle} cursor={{fill: 'rgba(200, 200, 200, 0.2)'}} />
                <Legend />
                <Bar dataKey="completed" fill="#10b981" name={t('analytics.completed')} />
                <Bar dataKey="pending" fill="#f59e0b" name={t('analytics.pending')} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}