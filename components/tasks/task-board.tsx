"use client"

import { useState, useEffect } from "react"
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, PointerSensor, useSensor, useSensors, closestCorners } from "@dnd-kit/core"
import { arrayMove } from "@dnd-kit/sortable"
import { Card, CardContent } from "@/components/ui/card"
import { TaskColumn } from "./task-column"
import { TaskDetailDialog } from "./task-detail-dialog"
import { TaskFilters, type TaskFilters as TaskFiltersType } from "@/components/filters/task-filters"
import type { Task, TeamMember } from "@/lib/types"
import { TaskCard } from "./task-card"

interface TaskBoardProps {
  userRole: string
  userId: number
}

export function TaskBoard({ userRole, userId }: TaskBoardProps) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [activeTask, setActiveTask] = useState<Task | null>(null)
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [projects, setProjects] = useState<string[]>([])

  const [filters, setFilters] = useState<TaskFiltersType>({
    search: "", status: "", priority: "", assignee: "", project: "",
    dueDateFrom: undefined, dueDateTo: undefined, overdue: false,
  })

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  )

  useEffect(() => {
    fetchTasks()
    fetchTeamMembers()
  }, [])

  useEffect(() => { applyFilters() }, [tasks, filters])

  const fetchTasks = async () => {
    try {
      const response = await fetch("/api/tasks")
      const data = await response.json()
      setTasks(data.tasks || [])

      // Corrigido para garantir tipo string[]
      const uniqueProjects = Array.from(
        new Set(
          (data.tasks?.map((task: Task) => task.project).filter((p: any): p is string => Boolean(p))) || []
        )
      ) as string[]
      setProjects(uniqueProjects)
    } catch (error) { console.error("Falha ao buscar tarefas:", error) }
    finally { setLoading(false) }
  }

  const fetchTeamMembers = async () => {
    try {
      const response = await fetch("/api/teams/members")
      const data = await response.json()
      setTeamMembers(data.members?.map((m: any) => ({ id: m.id, name: m.name })) || [])
    } catch (error) { console.error("Falha ao buscar membros da equipe:", error) }
  }

  const applyFilters = () => {
    let filtered = [...tasks]
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      filtered = filtered.filter(task =>
        task.title.toLowerCase().includes(searchLower) ||
        task.description.toLowerCase().includes(searchLower) ||
        task.assigneeName.toLowerCase().includes(searchLower) ||
        task.project.toLowerCase().includes(searchLower) ||
        task.tags.some(tag => tag.toLowerCase().includes(searchLower))
      )
    }
    if (filters.status) filtered = filtered.filter(task => task.status === filters.status)
    if (filters.priority) filtered = filtered.filter(task => task.priority === filters.priority)
    if (filters.assignee) filtered = filtered.filter(task => task.assigneeId.toString() === filters.assignee)
    if (filters.project) filtered = filtered.filter(task => task.project === filters.project)
    if (filters.dueDateFrom) filtered = filtered.filter(task => new Date(task.dueDate) >= filters.dueDateFrom!)
    if (filters.dueDateTo) filtered = filtered.filter(task => new Date(task.dueDate) <= filters.dueDateTo!)
    if (filters.overdue) {
      const now = new Date()
      filtered = filtered.filter(task => new Date(task.dueDate) < now && task.status !== "concluido")
    }
    setFilteredTasks(filtered)
  }

  const handleTaskUpdate = (updatedTask: Task) => {
    setTasks(prev => prev.map(task => task.id === updatedTask.id ? updatedTask : task))
    if (selectedTask?.id === updatedTask.id) setSelectedTask(updatedTask)
  }

  const handleDragStart = (event: DragStartEvent) => {
    const task = tasks.find(t => t.id === event.active.id)
    if (task) setActiveTask(task)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveTask(null)
    const { active, over } = event
    if (!over) return
    const activeId = active.id
    const overId = over.id
    if (activeId === overId) return

    const isActiveTask = active.data.current?.type === 'Task'
    const isOverTask = over.data.current?.type === 'Task'
    if (!isActiveTask) return

    const activeTask = tasks.find(t => t.id === activeId)
    if (!activeTask) return

    if (isOverTask) {
      const overTask = tasks.find(t => t.id === overId)
      if (!overTask) return
      if (activeTask.status === overTask.status) {
        setTasks(currentTasks => {
          const activeIndex = currentTasks.findIndex(t => t.id === activeId)
          const overIndex = currentTasks.findIndex(t => t.id === overId)
          return arrayMove(currentTasks, activeIndex, overIndex)
        })
        return
      }
    }

    const isOverColumn = over.data.current?.type === 'Column'
    const newStatus = isOverColumn ? over.id as Task['status'] : tasks.find(t => t.id === overId)?.status
    if (newStatus && activeTask.status !== newStatus) handleStatusChange(activeId as number, newStatus)
  }

  const handleStatusChange = async (taskId: number, newStatus: Task["status"]) => {
    setTasks(prev => prev.map(task => task.id === taskId ? { ...task, status: newStatus } : task))
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })
      if (!response.ok) fetchTasks()
    } catch (error) { console.error("Falha ao atualizar status da tarefa:", error); fetchTasks() }
  }

  const columns = [
    { id: "a-fazer", title: "A Fazer" },
    { id: "em-progresso", title: "Em Progresso" },
    { id: "revisao", title: "Revisão" },
    { id: "concluido", title: "Concluído" },
  ]

  if (loading) return <Card><CardContent className="p-6 text-center">Carregando tarefas...</CardContent></Card>

  return (
    <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd} sensors={sensors} collisionDetection={closestCorners}>
      <div className="mb-6">
        <TaskFilters filters={filters} onFiltersChange={setFilters} teamMembers={teamMembers} projects={projects} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-start">
        {columns.map(column => (
          <TaskColumn
            key={column.id}
            id={column.id as Task['status']}
            title={column.title}
            tasks={filteredTasks.filter(task => task.status === column.id)}
            onTaskClick={setSelectedTask}
            userRole={userRole}
            userId={userId}
          />
        ))}
      </div>

      <DragOverlay>
        {activeTask && (
          <div className="scale-105 shadow-2xl cursor-grabbing opacity-90">
            <TaskCard task={activeTask} onClick={() => {}} userRole={userRole} userId={userId} isDragging />
          </div>
        )}
      </DragOverlay>

      {selectedTask && (
        <TaskDetailDialog
          task={selectedTask}
          open={!!selectedTask}
          onClose={() => setSelectedTask(null)}
          onUpdate={handleTaskUpdate}
          userRole={userRole}
          userId={userId}
        />
      )}
    </DndContext>
  )
}
