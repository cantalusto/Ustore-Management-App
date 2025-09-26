"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Bar, BarChart, Line, LineChart, Pie, PieChart, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

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
      console.error("Falha ao buscar análise de tarefas:", error)
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
          <div className="text-center">Carregando análise de tarefas...</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h2 className="text-xl font-semibold">Análise de Tarefas</h2>
        <div className="flex gap-2">
          <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Departamento" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {departments.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={selectedMember} onValueChange={setSelectedMember}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Membro" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {allMembers.map(m => <SelectItem key={m.id} value={m.id.toString()}>{m.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">7 dias</SelectItem>
              <SelectItem value="30d">30 dias</SelectItem>
              <SelectItem value="90d">90 dias</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-lg">Distribuição por Status</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={data.statusDistribution} cx="50%" cy="50%" outerRadius={100} dataKey="value" label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {data.statusDistribution.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.color} />))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-lg">Distribuição por Prioridade</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.priorityDistribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip contentStyle={tooltipStyle} cursor={{fill: 'rgba(200, 200, 200, 0.2)'}} />
                <Bar dataKey="value" fill="#6366f1" name="Quantidade" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-lg">Tendência de Conclusão de Tarefas</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data.completionTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend />
                <Line type="monotone" dataKey="completed" stroke="#10b981" name="Concluídas" />
                <Line type="monotone" dataKey="created" stroke="#3b82f6" name="Criadas" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-lg">Desempenho por Departamento</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.departmentStats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="department" />
                <YAxis />
                <Tooltip contentStyle={tooltipStyle} cursor={{fill: 'rgba(200, 200, 200, 0.2)'}} />
                <Legend />
                <Bar dataKey="completed" fill="#10b981" name="Concluídas" />
                <Bar dataKey="pending" fill="#f59e0b" name="Pendentes" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}