import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

interface RecentActivityProps {
  userRole: string
}

export function RecentActivity({ userRole }: RecentActivityProps) {
  // Mock data - replace with real data fetching
  const activities = [
    {
      id: 1,
      user: "Charlie Brown Jr",
      action: "completou a tarefa",
      target: "Atualizar interface do usuário",
      time: "2 horas atrás",
      type: "tarefa",
    },
    {
      id: 2,
      user: "Kanye West",
      action: "entrou na equipe",
      target: "Equipe de Desenvolvimento",
      time: "4 horas atrás",
      type: "equipe",
    },
    {
      id: 3,
      user: "SilkSong da Silva",
      action: "criou a tarefa",
      target: "Corrigir bug de login",
      time: "6 horas atrás",
      type: "tarefa",
    },
    {
      id: 4,
      user: "Franz Kafka",
      action: "enviou o relatório",
      target: "Desempenho Semanal",
      time: "1 dia atrás",
      type: "relatório",
    },
  ]

  const getTypeColor = (type: string) => {
    switch (type) {
      case "tarefa":
        return "bg-blue-100 text-blue-800"
      case "equipe":
        return "bg-green-100 text-green-800"
      case "relatório":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Atividade Recente</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-center space-x-4">
              <Avatar className="h-8 w-8">
                <AvatarFallback>
                  {activity.user
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-1">
                <p className="text-sm">
                  <span className="font-medium">{activity.user}</span> {activity.action}{" "}
                  <span className="font-medium">{activity.target}</span>
                </p>
                <p className="text-xs text-muted-foreground">{activity.time}</p>
              </div>
              <Badge variant="secondary" className={getTypeColor(activity.type)}>
                {activity.type}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}