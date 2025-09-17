import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { AnalyticsOverview } from "@/components/analytics/analytics-overview"
import { TaskAnalytics } from "@/components/analytics/task-analytics"
import { TeamPerformance } from "@/components/analytics/team-performance"
import { ProjectProgress } from "@/components/analytics/project-progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default async function AnalyticsPage() {
  const user = await getCurrentUser()

  if (!user || (user.role !== "admin" && user.role !== "manager")) {
    redirect("/dashboard")
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader user={user} />
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Análises</h1>
            <p className="text-muted-foreground mt-2">
              Obtenha insights sobre o desempenho da sua equipe e o progresso dos projetos.
            </p>
          </div>

          <Tabs defaultValue="overview">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Visão Geral</TabsTrigger>
              <TabsTrigger value="tasks">Análise de Tarefas</TabsTrigger>
              <TabsTrigger value="team">Desempenho da Equipe</TabsTrigger>
              <TabsTrigger value="projects">Progresso dos Projetos</TabsTrigger>
            </TabsList>
            <TabsContent value="overview" className="mt-6">
              <AnalyticsOverview userRole={user.role} />
            </TabsContent>
            <TabsContent value="tasks" className="mt-6">
              <TaskAnalytics userRole={user.role} />
            </TabsContent>
            <TabsContent value="team" className="mt-6">
              <TeamPerformance userRole={user.role} />
            </TabsContent>
            <TabsContent value="projects" className="mt-6">
              <ProjectProgress userRole={user.role} />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}