"use client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { X, Search } from "lucide-react"

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

  // ... (outras funções permanecem iguais)

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
        <Select value={filters.role || "all"} onValueChange={(value) => updateFilter("role", value)}>
          <SelectTrigger className="w-full sm:w-32">
            <SelectValue placeholder="Cargo" />
          </SelectTrigger>
          {/* ... */}
        </Select>

        <Select value={filters.department || "all"} onValueChange={(value) => updateFilter("department", value)}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Departamento" />
          </SelectTrigger>
          {/* ... */}
        </Select>

        <Select value={filters.status || "all"} onValueChange={(value) => updateFilter("status", value)}>
          <SelectTrigger className="w-full sm:w-32">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          {/* ... */}
        </Select>
      </div>
    </div>
  )
}