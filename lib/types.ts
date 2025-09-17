export interface Task {
  id: number
  title: string
  description: string
  status: "a-fazer" | "em-progresso" | "revisao" | "concluido"
  priority: "baixa" | "media" | "alta" | "urgente"
  assigneeId: number
  assigneeName: string
  createdBy: number
  createdByName: string
  dueDate: string
  createdAt: string
  updatedAt: string
  project: string
  tags: string[]
}

export interface TeamMember {
  id: number
  name: string
  email?: string // Campo opcional, pois nem sempre é necessário
  role?: string // Campo opcional
}