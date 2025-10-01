"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Mail, Phone, Edit, Trash2 } from "lucide-react"
import { EditMemberDialog } from "./edit-member-dialog"
import { DeleteMemberDialog } from "./delete-member-dialog"
import { TeamFilters, type TeamFilters as TeamFiltersType } from "@/components/filters/team-filters"
import { useLanguage } from "@/contexts/language-context"
import { format } from "date-fns"
import { ptBR, enUS } from "date-fns/locale"

interface TeamMember {
  id: number
  name: string
  email: string
  role: "admin" | "manager" | "member"
  department: string
  phone?: string
  joinDate: string
  status: "active" | "inactive"
}

interface TeamMembersListProps {
  userRole: string
}

export function TeamMembersList({ userRole }: TeamMembersListProps) {
  const { t, language } = useLanguage()
  const [members, setMembers] = useState<TeamMember[]>([])
  const [filteredMembers, setFilteredMembers] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null)
  const [deletingMember, setDeletingMember] = useState<TeamMember | null>(null)
  const [departments, setDepartments] = useState<string[]>([])

  const [filters, setFilters] = useState<TeamFiltersType>({
    search: "",
    role: "",
    department: "",
    status: "",
  })

  useEffect(() => {
    fetchMembers()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [members, filters])

  const fetchMembers = async () => {
    try {
      const response = await fetch("/api/teams/members")
      const data = await response.json()
      setMembers(data.members || [])

      // Extrai departamentos únicos
      const uniqueDepartments = [...new Set(data.members?.map((member: TeamMember) => member.department) || [])]
      setDepartments(uniqueDepartments as string[])
    } catch (error) {
      console.error(t('teams.fetch_error'), error)
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = [...members]

    // Filtro de pesquisa
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      filtered = filtered.filter(
        (member) =>
          member.name.toLowerCase().includes(searchLower) ||
          member.email.toLowerCase().includes(searchLower) ||
          member.department.toLowerCase().includes(searchLower) ||
          member.role.toLowerCase().includes(searchLower),
      )
    }

    // Filtro de cargo
    if (filters.role) {
      filtered = filtered.filter((member) => member.role === filters.role)
    }

    // Filtro de departamento
    if (filters.department) {
      filtered = filtered.filter((member) => member.department === filters.department)
    }

    // Filtro de status
    if (filters.status) {
      filtered = filtered.filter((member) => member.status === filters.status)
    }

    setFilteredMembers(filtered)
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      case "manager":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
      case "member":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
    }
  }

  const getStatusBadgeColor = (status: string) => {
    return status === "active"
      ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      : "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
  }

  const canEditMember = (memberRole: string) => {
    if (userRole === "admin") return true
    if (userRole === "manager" && memberRole === "member") return true
    return false
  }

  const canDeleteMember = (memberRole: string) => {
    return userRole === "admin" && memberRole !== "admin"
  }

  // Funções de tradução
  const translateRole = (role: "admin" | "manager" | "member") => {
    return t(`common.roles.${role}`)
  }

  const translateStatus = (status: "active" | "inactive") => {
    return t(`common.status.${status}`)
  }


  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">{t('teams.loading')}</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <div className="mb-6">
        <TeamFilters filters={filters} onFiltersChange={setFilters} departments={departments} />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredMembers.map((member) => (
          <Card key={member.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback>
                      {member.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg">{member.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">{member.department}</p>
                  </div>
                </div>
                {(canEditMember(member.role) || canDeleteMember(member.role)) && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {canEditMember(member.role) && (
                        <DropdownMenuItem onClick={() => setEditingMember(member)}>
                          <Edit className="mr-2 h-4 w-4" />
                          {t('common.edit')}
                        </DropdownMenuItem>
                      )}
                      {canDeleteMember(member.role) && (
                        <DropdownMenuItem onClick={() => setDeletingMember(member)} className="text-destructive">
                          <Trash2 className="mr-2 h-4 w-4" />
                          {t('common.delete')}
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center space-x-2 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{member.email}</span>
              </div>
              {member.phone && (
                <div className="flex items-center space-x-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{member.phone}</span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <Badge className={getRoleBadgeColor(member.role)}>{translateRole(member.role)}</Badge>
                <Badge className={getStatusBadgeColor(member.status)}>{translateStatus(member.status)}</Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                {t('teams.joined_on')} {format(new Date(member.joinDate), 'dd/MM/yyyy', { 
                  locale: language === 'pt' ? ptBR : enUS 
                })}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredMembers.length === 0 && !loading && (
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-muted-foreground">{t('teams.no_members')}</div>
          </CardContent>
        </Card>
      )}

      {editingMember && (
        <EditMemberDialog
          member={editingMember}
          open={!!editingMember}
          onClose={() => setEditingMember(null)}
          onSuccess={() => {
            fetchMembers()
            setEditingMember(null)
          }}
          userRole={userRole}
        />
      )}

      {deletingMember && (
        <DeleteMemberDialog
          member={deletingMember}
          open={!!deletingMember}
          onClose={() => setDeletingMember(null)}
          onSuccess={() => {
            fetchMembers()
            setDeletingMember(null)
          }}
        />
      )}
    </>
  )
}