import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, CheckSquare, Clock, TrendingUp } from "lucide-react"

interface DashboardStatsProps {
  userRole: string
}

export function DashboardStats({ userRole }: DashboardStatsProps) {
  // Mock data - replace with real data fetching
  const stats = [
    {
      title: "Total de Membros da Equipe",
      value: "24",
      icon: Users,
      change: "+2 este mês",
      visible: ["admin", "manager"],
    },
    {
      title: "Tarefas Ativas",
      value: "18",
      icon: CheckSquare,
      change: "6 concluídas hoje",
      visible: ["admin", "manager", "member"],
    },
    {
      title: "Revisões Pendentes",
      value: "5",
      icon: Clock,
      change: "2 atrasadas",
      visible: ["admin", "manager"],
    },
    {
      title: "Desempenho da Equipe",
      value: "94%",
      icon: TrendingUp,
      change: "+5% da última semana",
      visible: ["admin", "manager"],
    },
  ]

  const visibleStats = stats.filter((stat) => stat.visible.includes(userRole))

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
            <p className="text-xs text-muted-foreground">{stat.change}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}