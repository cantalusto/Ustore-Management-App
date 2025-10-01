// app/tasks/page.tsx

import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { TasksPageContent } from "@/components/tasks/tasks-page-content"

export default async function TasksPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader user={user} />
      <main className="container mx-auto px-4 py-8">
        <TasksPageContent user={user} />
      </main>
    </div>
  )
}