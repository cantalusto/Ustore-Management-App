"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import { Filter, X, CalendarIcon, Search } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

export interface TaskFilters {
  search: string
  status: string
  priority: string
  assignee: string
  project: string
  dueDateFrom: Date | undefined
  dueDateTo: Date | undefined
  overdue: boolean
}

interface TaskFiltersProps {
  filters: TaskFilters
  onFiltersChange: (filters: TaskFilters) => void
  teamMembers: Array<{ id: number; name: string }>
  projects: string[]
}

export function TaskFilters({ filters, onFiltersChange, teamMembers, projects }: TaskFiltersProps) {
  const [isOpen, setIsOpen] = useState(false)

  const updateFilter = (key: keyof TaskFilters, value: any) => {
    onFiltersChange({ ...filters, [key]: value === 'all' ? '' : value })
  }

  const clearFilters = () => {
    onFiltersChange({
      search: "",
      status: "",
      priority: "",
      assignee: "",
      project: "",
      dueDateFrom: undefined,
      dueDateTo: undefined,
      overdue: false,
    })
  }

  const getActiveFilterCount = () => {
    let count = 0
    if (filters.search) count++
    if (filters.status) count++
    if (filters.priority) count++
    if (filters.assignee) count++
    if (filters.project) count++
    if (filters.dueDateFrom || filters.dueDateTo) count++
    if (filters.overdue) count++
    return count
  }

  const activeFilterCount = getActiveFilterCount()

  return (
    <div className="flex flex-col md:flex-row md:items-center gap-4">
      {/* Input de Pesquisa */}
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar tarefas..."
          value={filters.search}
          onChange={(e) => updateFilter("search", e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-2">
        <Select value={filters.status || 'all'} onValueChange={(value) => updateFilter("status", value)}>
          <SelectTrigger className="w-full sm:w-32">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Status</SelectItem>
            <SelectItem value="a-fazer">A Fazer</SelectItem>
            <SelectItem value="em-progresso">Em Progresso</SelectItem>
            <SelectItem value="revisao">Revisão</SelectItem>
            <SelectItem value="concluido">Concluído</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filters.priority || 'all'} onValueChange={(value) => updateFilter("priority", value)}>
          <SelectTrigger className="w-full sm:w-32">
            <SelectValue placeholder="Prioridade" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Prioridades</SelectItem>
            <SelectItem value="baixa">Baixa</SelectItem>
            <SelectItem value="media">Média</SelectItem>
            <SelectItem value="alta">Alta</SelectItem>
            <SelectItem value="urgente">Urgente</SelectItem>
          </SelectContent>
        </Select>

        {/* Filtros Avançados */}
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="relative bg-transparent w-full sm:w-auto">
              <Filter className="h-4 w-4 mr-2" />
              Filtros
              {activeFilterCount > 0 && (
                <Badge variant="secondary" className="ml-2 h-5 w-5 p-0 flex items-center justify-center">
                  {activeFilterCount}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80" align="end">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Filtros Avançados</h4>
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  Limpar Tudo
                </Button>
              </div>

              <div className="space-y-3">
                <div>
                  <Label htmlFor="assignee">Responsável</Label>
                  <Select value={filters.assignee} onValueChange={(value) => updateFilter("assignee", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o responsável" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os Responsáveis</SelectItem>
                      {teamMembers.map((member) => (
                        <SelectItem key={member.id} value={member.id.toString()}>
                          {member.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="project">Projeto</Label>
                  <Select value={filters.project} onValueChange={(value) => updateFilter("project", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o projeto" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os Projetos</SelectItem>
                      {projects.map((project) => (
                        <SelectItem key={project} value={project}>
                          {project}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Intervalo de Datas de Vencimento</Label>
                  <div className="flex space-x-2">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="flex-1 justify-start text-left font-normal bg-transparent">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {filters.dueDateFrom ? format(filters.dueDateFrom, "dd/MM/yy") : "De"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={filters.dueDateFrom}
                          onSelect={(date) => updateFilter("dueDateFrom", date)}
                          initialFocus
                          locale={ptBR}
                        />
                      </PopoverContent>
                    </Popover>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="flex-1 justify-start text-left font-normal bg-transparent">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {filters.dueDateTo ? format(filters.dueDateTo, "dd/MM/yy") : "Até"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={filters.dueDateTo}
                          onSelect={(date) => updateFilter("dueDateTo", date)}
                          initialFocus
                          locale={ptBR}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="overdue"
                    checked={filters.overdue}
                    onChange={(e) => updateFilter("overdue", e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor="overdue">Mostrar apenas tarefas atrasadas</Label>
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  )
}