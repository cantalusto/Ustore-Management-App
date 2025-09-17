"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { TrendingUp, TrendingDown, Award, Target } from "lucide-react"

interface MemberPerformance {
  id: number
  name: string
  role: string
  department: string
  tasksCompleted: number
  tasksAssigned: number
  completionRate: number
  avgCompletionTime: number
  trend: number
}

interface TeamPerformanceProps {
  userRole: string
}

export function TeamPerformance({ userRole }: TeamPerformanceProps) {
  const [members, setMembers] = useState<MemberPerformance[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTeamPerformance()
  }, [])

  const fetchTeamPerformance = async () => {
    try {
      const response = await fetch("/api/analytics/team-performance")
      const data = await response.json()
      setMembers(data.members || [])
    } catch (error) {
      console.error("Falha ao buscar desempenho da equipe:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Carregando desempenho da equipe...</div>
        </CardContent>
      </Card>
    )
  }

  const topPerformer = members.reduce((prev, current) =>
    prev.completionRate > current.completionRate ? prev : current,
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center space-x-2">
          <Award className="h-5 w-5" />
          <span>Desempenho da Equipe</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Destaque de Melhor Desempenho */}
        <div className="bg-muted p-4 rounded-lg">
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10">
              <AvatarFallback>
                {topPerformer.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <h4 className="font-medium">{topPerformer.name}</h4>
                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                  Melhor Desempenho
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {topPerformer.completionRate}% de taxa de conclusão • {topPerformer.department}
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-green-600">{topPerformer.completionRate}%</div>
              <div className="text-xs text-muted-foreground">taxa de conclusão</div>
            </div>
          </div>
        </div>

        {/* Lista de Membros da Equipe */}
        <div className="space-y-4">
          <h4 className="font-medium flex items-center space-x-2">
            <Target className="h-4 w-4" />
            <span>Todos os Membros da Equipe</span>
          </h4>
          {members.map((member) => (
            <div key={member.id} className="flex items-center space-x-4 p-3 border rounded-lg">
              <Avatar className="h-8 w-8">
                <AvatarFallback>
                  {member.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="font-medium text-sm">{member.name}</h5>
                    <p className="text-xs text-muted-foreground">
                      {member.department} • {member.role}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center space-x-1">
                      {member.trend > 0 ? (
                        <TrendingUp className="h-3 w-3 text-green-500" />
                      ) : (
                        <TrendingDown className="h-3 w-3 text-red-500" />
                      )}
                      <span className="text-sm font-medium">{member.completionRate}%</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {member.tasksCompleted}/{member.tasksAssigned} tarefas
                    </p>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span>Taxa de Conclusão</span>
                    <span>{member.completionRate}%</span>
                  </div>
                  <Progress value={member.completionRate} className="h-2" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}