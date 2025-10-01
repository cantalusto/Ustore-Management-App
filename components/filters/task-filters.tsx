// Mentoria/components/filters/task-filters.tsx
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
import { useLanguage } from "@/contexts/language-context"
import { enUS } from "date-fns/locale"

export interface TaskFilters {
  search: string
  status: string
  priority: string
  assignee: string
  project: string
  department: string // Adicionado
  dueDateFrom: Date | undefined
  dueDateTo: Date | undefined
  overdue: boolean
}

interface TaskFiltersProps {
  filters: TaskFilters
  onFiltersChange: (filters: TaskFilters) => void
  teamMembers: Array<{ id: number; name: string }>
  projects: string[]
  departments: string[] // Adicionado
}

export function TaskFilters({ filters, onFiltersChange, teamMembers, projects, departments }: TaskFiltersProps) {
  const [isOpen, setIsOpen] = useState(false)
  const { t, language } = useLanguage()

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
      department: "", // Adicionado
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
    if (filters.department) count++ // Adicionado
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
          placeholder={t('tasks.search_placeholder')}
          value={filters.search}
          onChange={(e) => updateFilter("search", e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-2">
        <Select value={filters.status || 'all'} onValueChange={(value) => updateFilter("status", value)}>
          <SelectTrigger className="w-full sm:w-32">
            <SelectValue placeholder={t('tasks.status_filter')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('tasks.status_filter')}</SelectItem>
            <SelectItem value="a-fazer">{t('tasks.status.todo')}</SelectItem>
            <SelectItem value="em-progresso">{t('tasks.status.in_progress')}</SelectItem>
            <SelectItem value="revisao">{t('tasks.status.review')}</SelectItem>
            <SelectItem value="concluido">{t('tasks.status.done')}</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filters.priority || 'all'} onValueChange={(value) => updateFilter("priority", value)}>
          <SelectTrigger className="w-full sm:w-32">
            <SelectValue placeholder={t('tasks.priority_filter')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('tasks.filters.all_priorities')}</SelectItem>
            <SelectItem value="low">{t('tasks.priority.low')}</SelectItem>
                <SelectItem value="medium">{t('tasks.priority.medium')}</SelectItem>
                <SelectItem value="high">{t('tasks.priority.high')}</SelectItem>
                <SelectItem value="urgent">{t('tasks.priority.urgent')}</SelectItem>
          </SelectContent>
        </Select>

        {/* Filtros Avançados */}
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="relative bg-transparent w-full sm:w-auto">
              <Filter className="h-4 w-4 mr-2" />
              {t('tasks.filters.filters')}
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
                <h4 className="font-medium">{t('tasks.filters.advanced')}</h4>
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  {t('tasks.filters.clear_all')}
                </Button>
              </div>

              <div className="space-y-3">
                <div>
                  <Label htmlFor="assignee">{t('tasks.filters.assignee')}</Label>
                  <Select value={filters.assignee} onValueChange={(value) => updateFilter("assignee", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder={t('tasks.filters.select_assignee')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t('tasks.filters.all_assignees')}</SelectItem>
                      {teamMembers.map((member) => (
                        <SelectItem key={member.id} value={member.id.toString()}>
                          {member.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="department">{t('tasks.filters.department')}</Label>
                  <Select value={filters.department} onValueChange={(value) => updateFilter("department", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder={t('tasks.filters.select_department')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t('tasks.filters.all_departments')}</SelectItem>
                      {departments.map((department) => (
                        <SelectItem key={department} value={department}>
                          {department}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="project">{t('tasks.filters.project')}</Label>
                  <Select value={filters.project} onValueChange={(value) => updateFilter("project", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder={t('tasks.filters.select_project')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t('tasks.filters.all_projects')}</SelectItem>
                      {projects.map((project) => (
                        <SelectItem key={project} value={project}>
                          {project}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>{t('tasks.filters.due_date_range')}</Label>
                  <div className="flex space-x-2">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="flex-1 justify-start text-left font-normal bg-transparent">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {filters.dueDateFrom ? format(filters.dueDateFrom, "dd/MM/yy") : t('tasks.filters.from')}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={filters.dueDateFrom}
                          onSelect={(date) => updateFilter("dueDateFrom", date)}
                          initialFocus
                          locale={language === 'pt' ? ptBR : enUS}
                        />
                      </PopoverContent>
                    </Popover>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="flex-1 justify-start text-left font-normal bg-transparent">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {filters.dueDateTo ? format(filters.dueDateTo, "dd/MM/yy") : t('tasks.filters.to')}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={filters.dueDateTo}
                          onSelect={(date) => updateFilter("dueDateTo", date)}
                          initialFocus
                          locale={language === 'pt' ? ptBR : enUS}
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
                  <Label htmlFor="overdue">{t('tasks.filters.show_overdue')}</Label>
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  )
}