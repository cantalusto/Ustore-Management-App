import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardStats } from "@/components/dashboard/dashboard-stats"
import { RecentActivity } from "@/components/dashboard/recent-activity"
import { DashboardContent } from "@/components/dashboard/dashboard-content"

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
          <DashboardContent user={user} />
          <DashboardStats userRole={user.role} />
          <RecentActivity userRole={user.role} />
        </div>
      </main>
    </div>
  )
}