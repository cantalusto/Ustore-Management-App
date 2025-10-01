// Mentoria/app/analytics/page.tsx
import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { AnalyticsOverview } from "@/components/analytics/analytics-overview"
import { TaskAnalytics } from "@/components/analytics/task-analytics"
import { TeamPerformance } from "@/components/analytics/team-performance"
import { ProjectProgress } from "@/components/analytics/project-progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AnalyticsHeader, AnalyticsTabLabel } from "@/components/analytics/analytics-header"

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
          <AnalyticsHeader />

          <Tabs defaultValue="overview">
            <TabsList className="grid w-full grid-cols-4 md:grid-cols-4 grid-cols-1 gap-2 md:gap-0 h-auto md:h-10">
              <TabsTrigger value="overview" className="w-full">
                <AnalyticsTabLabel tabKey="overview" />
              </TabsTrigger>
              <TabsTrigger value="tasks" className="w-full">
                <AnalyticsTabLabel tabKey="tasks" />
              </TabsTrigger>
              <TabsTrigger value="team" className="w-full">
                <AnalyticsTabLabel tabKey="team" />
              </TabsTrigger>
              <TabsTrigger value="projects" className="w-full">
                <AnalyticsTabLabel tabKey="projects" />
              </TabsTrigger>
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