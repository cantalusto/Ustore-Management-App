import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardStats } from "@/components/dashboard/dashboard-stats"
import { RecentActivity } from "@/components/dashboard/recent-activity"

export default async function DashboardPage() {
  console.log("[v0] Dashboard page loading...")

  const user = await getCurrentUser()
  console.log("[v0] Dashboard user:", user)

  if (!user) {
    console.log("[v0] No user found, redirecting to login")
    redirect("/login")
  }

  console.log("[v0] Dashboard rendering for user:", user.name)

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader user={user} />
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Bem-vindo de volta, {user.name}</h1>
            <p className="text-muted-foreground mt-2">Aqui está o que está acontecendo com sua equipe hoje.</p>
          </div>

          <DashboardStats userRole={user.role} />
          <RecentActivity userRole={user.role} />
        </div>
      </main>
    </div>
  )
}