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
    // Se o valor for "all", consideramos como limpar o filtro
    onFiltersChange({ ...filters, [key]: value === "all" ? "" : value })
  }

  const clearFilters = () => {
    onFiltersChange({
      search: "",
      role: "",
      department: "",
      status: "",
    })
  }

  const getActiveFilterCount = () => {
    let count = 0
    if (filters.search) count++
    if (filters.role) count++
    if (filters.department) count++
    if (filters.status) count++
    return count
  }

  const activeFilterCount = getActiveFilterCount()

  const translateRole = (role: string) => {
    const roles: { [key: string]: string } = {
      admin: "Administrador",
      manager: "Gerente",
      member: "Membro",
    }
    return roles[role] || role
  }

  return (
    <div className="flex items-center space-x-4">
      {/* Input de Pesquisa */}
      <div className="relative flex-1 max-w-sm">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Pesquisar membros da equipe..."
          value={filters.search}
          onChange={(e) => updateFilter("search", e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Seletores de Filtro */}
      <div className="flex items-center space-x-2">
        <Select value={filters.role || "all"} onValueChange={(value) => updateFilter("role", value)}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Cargo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Cargos</SelectItem>
            <SelectItem value="admin">Administrador</SelectItem>
            <SelectItem value="manager">Gerente</SelectItem>
            <SelectItem value="member">Membro</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filters.department || "all"} onValueChange={(value) => updateFilter("department", value)}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Departamento" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Departamentos</SelectItem>
            {departments.map((dept) => (
              <SelectItem key={dept} value={dept}>
                {dept}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filters.status || "all"} onValueChange={(value) => updateFilter("status", value)}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Status</SelectItem>
            <SelectItem value="active">Ativo</SelectItem>
            <SelectItem value="inactive">Inativo</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Limpar Filtros */}
      {activeFilterCount > 0 && (
        <Button variant="outline" size="sm" onClick={clearFilters}>
          <X className="h-4 w-4 mr-2" />
          Limpar ({activeFilterCount})
        </Button>
      )}

      {/* Exibição de Filtros Ativos */}
      {activeFilterCount > 0 && (
        <div className="flex items-center space-x-2">
          {filters.role && (
            <Badge variant="secondary" className="flex items-center space-x-1">
              <span>Cargo: {translateRole(filters.role)}</span>
              <X className="h-3 w-3 cursor-pointer" onClick={() => updateFilter("role", "")} />
            </Badge>
          )}
          {filters.department && (
            <Badge variant="secondary" className="flex items-center space-x-1">
              <span>Depto: {filters.department}</span>
              <X className="h-3 w-3 cursor-pointer" onClick={() => updateFilter("department", "")} />
            </Badge>
          )}
          {filters.status && (
            <Badge variant="secondary" className="flex items-center space-x-1">
              <span>Status: {filters.status === 'active' ? 'Ativo' : 'Inativo'}</span>
              <X className="h-3 w-3 cursor-pointer" onClick={() => updateFilter("status", "")} />
            </Badge>
          )}
        </div>
      )}
    </div>
  )
}