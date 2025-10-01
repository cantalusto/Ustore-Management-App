// Mentoria/components/analytics/team-performance.tsx
"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TrendingUp, TrendingDown, Award, Target } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"

interface MemberPerformance {
  id: number
  name: string
  role: string
  department: string
  tasksCompleted: number
  tasksAssigned: number
  completionRate: number
  avgCompletionTime: number
  trend: number
}

interface TeamPerformanceProps {
  userRole: string
}

export function TeamPerformance({ userRole }: TeamPerformanceProps) {
  const { t } = useLanguage()
  const [members, setMembers] = useState<MemberPerformance[]>([])
  const [loading, setLoading] = useState(true)
  const [departments, setDepartments] = useState<string[]>([])
  const [allMembers, setAllMembers] = useState<MemberPerformance[]>([])
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all')
  const [selectedMember, setSelectedMember] = useState<string>('all')

  useEffect(() => {
    fetchTeamPerformance()
  }, [selectedDepartment, selectedMember])

  const fetchTeamPerformance = async () => {
    try {
      const params = new URLSearchParams()
      if (selectedDepartment !== 'all') params.append('department', selectedDepartment)
      if (selectedMember !== 'all') params.append('memberId', selectedMember)
      const response = await fetch(`/api/analytics/team-performance?${params.toString()}`)
      const data = await response.json()
      setMembers(data.members || [])
      if (allMembers.length === 0) {
        setAllMembers(data.members || [])
        const uniqueDepartments = [...new Set(data.members?.map((m: MemberPerformance) => m.department) || [])] as string[]
        setDepartments(uniqueDepartments)
      }
    } catch (error) {
      console.error(t('teams.fetch_error'), error)
    } finally {
      setLoading(false)
    }
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

  const topPerformer = members.length > 0 ? members.reduce((prev, current) =>
    prev.completionRate > current.completionRate ? prev : current,
  ) : null

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg flex items-center space-x-2">
            <Award className="h-5 w-5" />
            <span>{t('teams.performance_title')}</span>
          </CardTitle>
          <div className="flex gap-2">
            <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder={t('teams.department_filter')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('teams.all_departments')}</SelectItem>
                {departments.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={selectedMember} onValueChange={setSelectedMember}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder={t('teams.all_members')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('teams.all_members')}</SelectItem>
                {allMembers.map(m => <SelectItem key={m.id} value={m.id.toString()}>{m.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {topPerformer && (
          <div className="bg-muted p-4 rounded-lg">
            <div className="flex items-center space-x-3">
              <Avatar className="h-10 w-10">
                <AvatarFallback>
                  {topPerformer.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <h4 className="font-medium">{topPerformer.name}</h4>
                  <Badge variant="secondary" className="bg-white text-black">
                    {t('teams.best_performance')}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {topPerformer.completionRate}% {t('teams.completion_rate')} • {topPerformer.department}
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-green-700">{topPerformer.completionRate}%</div>
                <div className="text-xs text-muted-foreground">{t('teams.completion_rate')}</div>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-4">
          <h4 className="font-medium flex items-center space-x-2">
            <Target className="h-4 w-4" />
            <span>
              {selectedMember !== 'all' ? t('teams.individual_performance') : selectedDepartment !== 'all' ? t('teams.department_members', { department: selectedDepartment }) : t('teams.all_members_performance')}
            </span>
          </h4>
          {members.map((member) => (
            <div key={member.id} className="flex items-center space-x-4 p-3 border rounded-lg">
              <Avatar className="h-8 w-8">
                <AvatarFallback>
                  {member.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="font-medium text-sm">{member.name}</h5>
                    <p className="text-xs text-muted-foreground">
                      {member.department} • {member.role}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center space-x-1">
                      {member.trend > 0 ? (
                        <TrendingUp className="h-3 w-3 text-green-500" />
                      ) : (
                        <TrendingDown className="h-3 w-3 text-red-500" />
                      )}
                      <span className="text-sm font-medium">{member.completionRate}%</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {member.tasksCompleted}/{member.tasksAssigned} {t('teams.tasks_completed')}
                    </p>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span>{t('teams.completion_rate_label')}</span>
                    <span>{member.completionRate}%</span>
                  </div>
                  <Progress value={member.completionRate} className="h-2" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}