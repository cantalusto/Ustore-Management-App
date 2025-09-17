"use client"

import { useDroppable } from "@dnd-kit/core"
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TaskCard } from "./task-card"
import type { Task } from "@/lib/types"

interface TaskColumnProps {
  id: Task['status']
  title: string
  tasks: Task[]
  onTaskClick: (task: Task) => void
  userRole: string
  userId: number
}

export function TaskColumn({ id, title, tasks, onTaskClick, userRole, userId }: TaskColumnProps) {
  const { setNodeRef } = useDroppable({
    id,
    data: {
      type: 'Column',
    }
  });

  const getColumnColor = () => {
    switch (id) {
      case "a-fazer": return "border-t-4 border-t-gray-400";
      case "em-progresso": return "border-t-4 border-t-blue-500";
      case "revisao": return "border-t-4 border-t-yellow-500";
      case "concluido": return "border-t-4 border-t-green-500";
      default: return "";
    }
  }

  return (
    <div ref={setNodeRef} className="h-full">
      <Card className={`h-full ${getColumnColor()}`}>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center justify-between">
            {title}
            <span className="text-sm font-normal bg-muted text-muted-foreground px-2 py-1 rounded-full">
              {tasks.length}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
            {tasks.length === 0 ? (
              <div className="h-20 flex items-center justify-center">
                <p className="text-sm text-muted-foreground text-center">Arraste tarefas para cá</p>
              </div>
            ) : (
              tasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onClick={() => onTaskClick(task)}
                  userRole={userRole}
                  userId={userId}
                />
              ))
            )}
          </SortableContext>
        </CardContent>
      </Card>
    </div>
  )
}