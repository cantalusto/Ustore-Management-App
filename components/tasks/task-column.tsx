"use client"

import { useDroppable } from "@dnd-kit/core"
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TaskCard } from "./task-card"
import type { Task } from "@/lib/auth"

interface TaskColumnProps {
  id: Task['status']
  title: string
  tasks: Task[]
  onTaskClick: (task: Task) => void
  userRole: string
  userId: number
}

export function TaskColumn({ id, title, tasks, onTaskClick, userRole, userId }: TaskColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id,
    data: {
      type: 'Column',
    }
  });

  const getColumnColor = () => {
    switch (id) {
      case "a-fazer": return "border-t-8 border-t-gray-500 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950";
      case "em-progresso": return "border-t-8 border-t-blue-600 bg-gradient-to-b from-blue-50 to-white dark:from-blue-950 dark:to-gray-950";
      case "revisao": return "border-t-8 border-t-yellow-500 bg-gradient-to-b from-yellow-50 to-white dark:from-yellow-950 dark:to-gray-950";
      case "concluido": return "border-t-8 border-t-green-600 bg-gradient-to-b from-green-50 to-white dark:from-green-950 dark:to-gray-950";
      default: return "";
    }
  }

  return (
    <div ref={setNodeRef} className="w-full">
      <Card className={`${getColumnColor()} ${isOver ? 'ring-4 ring-blue-500 ring-opacity-50 shadow-2xl' : 'shadow-lg'}`}>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center justify-between">
            {title}
            <span className="text-sm font-semibold bg-gradient-to-r from-primary to-primary/80 text-primary-foreground px-3 py-1 rounded-full shadow-sm">
              {tasks.length}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
            {tasks.length === 0 ? (
              <div 
                className={`min-h-[150px] flex items-center justify-center border-2 border-dashed rounded-lg transition-all duration-200 ${
                  isOver 
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20 scale-105' 
                    : 'border-muted-foreground/20 hover:border-muted-foreground/40'
                }`}
              >
                <p className="text-sm text-muted-foreground text-center px-4">
                  {isOver ? 'Solte a tarefa aqui' : 'Arraste tarefas para cá'}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {tasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onClick={() => onTaskClick(task)}
                    userRole={userRole}
                    userId={userId}
                  />
                ))}
              </div>
            )}
          </SortableContext>
        </CardContent>
      </Card>
    </div>
  )
}