import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { TaskBoard } from "@/components/tasks/task-board"
import { CreateTaskButton } from "@/components/tasks/create-task-button"

export default async function TasksPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  // O userId é necessário para o TaskBoard, então garantimos que o usuário exista.
  const userId = user.id;

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader user={user} />
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Gerenciamento de Tarefas</h1>
              <p className="text-muted-foreground mt-2">Crie, atribua e acompanhe tarefas em sua equipe.</p>
            </div>
            <CreateTaskButton userRole={user.role} />
          </div>

          <TaskBoard userRole={user.role} userId={userId} />
        </div>
      </main>
    </div>
  )
}