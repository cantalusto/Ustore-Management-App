import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { TeamMembersList } from "@/components/teams/team-members-list"
import { AddMemberButton } from "@/components/teams/add-member-button"
import { TeamsPageContent } from "@/components/teams/teams-page-content"

export default async function TeamsPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader user={user} />
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          <TeamsPageContent user={user} />
          <TeamMembersList userRole={user.role} />
        </div>
      </main>
    </div>
  )
}