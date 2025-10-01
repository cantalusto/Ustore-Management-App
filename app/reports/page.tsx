import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { ReportsOverview } from "@/components/reports/reports-overview"
import { ReportsPageContent } from "@/components/reports/reports-page-content"

export default async function ReportsPage() {
  const user = await getCurrentUser()

  if (!user || (user.role !== "admin" && user.role !== "manager")) {
    redirect("/dashboard")
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader user={user} />
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          <ReportsPageContent />
          <ReportsOverview />
        </div>
      </main>
    </div>
  )
}