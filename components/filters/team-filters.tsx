"use client"

import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search } from "lucide-react"

export interface TeamFilters {
  search: string
  role: string
  department: string
  status: string
}

interface TeamFiltersProps {
  filters: TeamFilters
  onFiltersChange: (filters: TeamFilters) => void
  departments: string[]
}

export function TeamFilters({ filters, onFiltersChange, departments }: TeamFiltersProps) {
  const updateFilter = (key: keyof TeamFilters, value: string) => {
    onFiltersChange({ ...filters, [key]: value === "all" ? "" : value })
  }

  return (
    <div className="flex flex-col md:flex-row md:items-center gap-4">
      {/* Input de Pesquisa */}
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Pesquisar membros da equipe..."
          value={filters.search}
          onChange={(e) => updateFilter("search", e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Seletores de Filtro */}
      <div className="flex flex-col sm:flex-row gap-2">
        {/* Cargo */}
        <Select value={filters.role || "all"} onValueChange={(value) => updateFilter("role", value)}>
          <SelectTrigger className="w-full sm:w-32">
            <SelectValue placeholder="Cargo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="manager">Gerente</SelectItem>
            <SelectItem value="member">Membro</SelectItem>
          </SelectContent>
        </Select>

        {/* Departamento */}
        <Select value={filters.department || "all"} onValueChange={(value) => updateFilter("department", value)}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Departamento" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            {departments.map((dept) => (
              <SelectItem key={dept} value={dept}>
                {dept}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Status */}
        <Select value={filters.status || "all"} onValueChange={(value) => updateFilter("status", value)}>
          <SelectTrigger className="w-full sm:w-32">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="active">Ativo</SelectItem>
            <SelectItem value="inactive">Inativo</SelectItem>
            <SelectItem value="pending">Pendente</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
