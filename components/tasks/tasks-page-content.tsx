"use client"

import { useLanguage } from "@/contexts/language-context"
import { CreateTaskButton } from "@/components/tasks/create-task-button"
import { AiCreateTaskButton } from "@/components/tasks/ai-create-task-button"
import { TaskBoard } from "@/components/tasks/task-board"
import { User } from "@/lib/auth"

interface TasksPageContentProps {
  user: User
}

export function TasksPageContent({ user }: TasksPageContentProps) {
  const { t } = useLanguage()

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">{t('tasks.management_title')}</h1>
          <p className="text-muted-foreground mt-2">{t('tasks.management_subtitle')}</p>
        </div>
        <div className="flex items-center gap-2">
          <AiCreateTaskButton />
          <CreateTaskButton userRole={user.role} />
        </div>
      </div>

      <TaskBoard userRole={user.role} userId={user.id} />
    </div>
  )
}