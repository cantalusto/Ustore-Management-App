"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Bar,
  BarChart,
  Line,
  LineChart,
  Pie,
  PieChart,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"

interface TaskAnalyticsData {
  statusDistribution: Array<{ name: string; value: number; color: string }>
  priorityDistribution: Array<{ name: string; value: number; color: string }>
  completionTrend: Array<{ date: string; completed: number; created: number }>
  departmentStats: Array<{ department: string; completed: number; pending: number }>
}

interface TaskAnalyticsProps {
  userRole: string
}

export function TaskAnalytics({ userRole }: TaskAnalyticsProps) {
  const [data, setData] = useState<TaskAnalyticsData | null>(null)
  const [timeRange, setTimeRange] = useState("30d")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTaskAnalytics()
  }, [timeRange])

  const fetchTaskAnalytics = async () => {
    try {
      const response = await fetch(`/api/analytics/tasks?range=${timeRange}`)
      const result = await response.json()
      setData(result.data)
    } catch (error) {
      console.error("Falha ao buscar análise de tarefas:", error)
    } finally {
      setLoading(false)
    }
  }

  // Estilo customizado para o tooltip
  const tooltipStyle = {
    backgroundColor: '#ffffff', // Fundo branco
    color: '#000000',          // Texto preto
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
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Análise de Tarefas</h2>
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Distribuição de Status de Tarefas */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Distribuição por Status</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={data.statusDistribution}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  dataKey="value"
                  label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {data.statusDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Distribuição de Prioridade */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Distribuição por Prioridade</CardTitle>
          </CardHeader>
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
        {/* Tendência de Conclusão */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Tendência de Conclusão de Tarefas</CardTitle>
          </CardHeader>
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

        {/* Desempenho por Departamento */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Desempenho por Departamento</CardTitle>
          </CardHeader>
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