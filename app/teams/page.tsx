import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { TeamMembersList } from "@/components/teams/team-members-list"
import { AddMemberButton } from "@/components/teams/add-member-button"

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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Gerenciamento de Equipes</h1>
              <p className="text-muted-foreground mt-2">Gerencie os membros da sua equipe e suas funções.</p>
            </div>
            {(user.role === "admin" || user.role === "manager") && <AddMemberButton />}
          </div>

          <TeamMembersList userRole={user.role} />
        </div>
      </main>
    </div>
  )
}