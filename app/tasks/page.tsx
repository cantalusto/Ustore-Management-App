// app/tasks/page.tsx

import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { TaskBoard } from "@/components/tasks/task-board"
import { CreateTaskButton } from "@/components/tasks/create-task-button"
import { AiCreateTaskButton } from "@/components/tasks/ai-create-task-button" // 1. Importe o novo botão

export default async function TasksPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

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
            {/* 2. Adicione o novo botão dentro de um contêiner flex */}
            <div className="flex items-center gap-2">
              <AiCreateTaskButton />
              <CreateTaskButton userRole={user.role} />
            </div>
          </div>

          <TaskBoard userRole={user.role} userId={userId} />
        </div>
      </main>
    </div>
  )
}