"use client"

import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"

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
  const { t } = useLanguage()
  const updateFilter = (key: keyof TeamFilters, value: string) => {
    onFiltersChange({ ...filters, [key]: value === "all" ? "" : value })
  }

  return (
    <div className="flex flex-col md:flex-row md:items-center gap-4">
      {/* Input de Pesquisa */}
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={t('teams.search_placeholder')}
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
            <SelectValue placeholder={t('teams.role_filter')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('teams.all_roles')}</SelectItem>
            <SelectItem value="admin">{t('common.roles.admin')}</SelectItem>
            <SelectItem value="manager">{t('common.roles.manager')}</SelectItem>
            <SelectItem value="member">{t('common.roles.member')}</SelectItem>
          </SelectContent>
        </Select>

        {/* Departamento */}
        <Select value={filters.department || "all"} onValueChange={(value) => updateFilter("department", value)}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder={t('teams.department_filter')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('teams.all_departments')}</SelectItem>
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
            <SelectValue placeholder={t('teams.status_filter')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('teams.all_roles')}</SelectItem>
            <SelectItem value="active">{t('common.status.active')}</SelectItem>
            <SelectItem value="inactive">{t('common.status.inactive')}</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
