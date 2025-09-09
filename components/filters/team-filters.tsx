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
    onFiltersChange({ ...filters, [key]: value })
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

  return (
    <div className="flex items-center space-x-4">
      {/* Search Input */}
      <div className="relative flex-1 max-w-sm">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search team members..."
          value={filters.search}
          onChange={(e) => updateFilter("search", e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Filter Selects */}
      <div className="flex items-center space-x-2">
        <Select value={filters.role} onValueChange={(value) => updateFilter("role", value)}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="manager">Manager</SelectItem>
            <SelectItem value="member">Member</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filters.department} onValueChange={(value) => updateFilter("department", value)}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Department" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Departments</SelectItem>
            {departments.map((dept) => (
              <SelectItem key={dept} value={dept}>
                {dept}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filters.status} onValueChange={(value) => updateFilter("status", value)}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Clear Filters */}
      {activeFilterCount > 0 && (
        <Button variant="outline" size="sm" onClick={clearFilters}>
          <X className="h-4 w-4 mr-2" />
          Clear ({activeFilterCount})
        </Button>
      )}

      {/* Active Filters Display */}
      {activeFilterCount > 0 && (
        <div className="flex items-center space-x-2">
          {filters.role && filters.role !== "all" && (
            <Badge variant="secondary" className="flex items-center space-x-1">
              <span>Role: {filters.role}</span>
              <X className="h-3 w-3 cursor-pointer" onClick={() => updateFilter("role", "")} />
            </Badge>
          )}
          {filters.department && filters.department !== "all" && (
            <Badge variant="secondary" className="flex items-center space-x-1">
              <span>Dept: {filters.department}</span>
              <X className="h-3 w-3 cursor-pointer" onClick={() => updateFilter("department", "")} />
            </Badge>
          )}
          {filters.status && filters.status !== "all" && (
            <Badge variant="secondary" className="flex items-center space-x-1">
              <span>Status: {filters.status}</span>
              <X className="h-3 w-3 cursor-pointer" onClick={() => updateFilter("status", "")} />
            </Badge>
          )}
        </div>
      )}
    </div>
  )
}
