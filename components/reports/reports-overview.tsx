// components/reports/reports-overview.tsx
"use client"

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarIcon, Download, FileText, Table } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useLanguage } from "@/contexts/language-context";
import type { User } from "@/lib/auth";

export function ReportsOverview() {
  const { t, language } = useLanguage();
  
  const reportTypes = [
    { id: "team-performance", title: t('reports.team_performance'), description: t('reports.team_performance_desc'), icon: <FileText className="h-5 w-5" />, badge: t('reports.badge.popular') },
    { id: "task-summary", title: t('reports.task_summary'), description: t('reports.task_summary_desc'), icon: <Table className="h-5 w-5" />, badge: t('reports.badge.detailed') },
    { id: "individual-performance", title: t('reports.individual_performance'), description: t('reports.individual_performance_desc'), icon: <FileText className="h-5 w-5" />, badge: t('reports.badge.specific') },
    { id: "project-status", title: t('reports.project_status'), description: t('reports.project_status_desc'), icon: <Table className="h-5 w-5" />, badge: t('reports.badge.managerial') },
  ];
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: new Date(new Date().setDate(new Date().getDate() - 30)),
    to: new Date(),
  });
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all");
  const [selectedMember, setSelectedMember] = useState<string>("all");
  const [isGenerating, setIsGenerating] = useState<string | null>(null);
  const [teamMembers, setTeamMembers] = useState<User[]>([]);
  const [departments, setDepartments] = useState<string[]>([]);

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const response = await fetch("/api/teams/members");
        const data = await response.json();
        const members = data.members || [];
        setTeamMembers(members);
        
        // Derivar departamentos da lista de membros
        const uniqueDepartments = [...new Set(members.map((m: User) => m.department).filter(Boolean))] as string[];
        setDepartments(uniqueDepartments);

      } catch (error) {
        console.error(t('reports.fetch_members_error'), error);
      }
    };
    fetchMembers();
  }, []);

  const handleGenerateReport = async (reportType: string, format: "excel") => {
    setIsGenerating(`${reportType}-${format}`);

    try {
      const response = await fetch("/api/reports/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: reportType,
          format,
          dateRange,
          department: selectedDepartment === "all" ? null : selectedDepartment,
          memberId: selectedMember === "all" ? null : selectedMember,
          language: language, // Adiciona o idioma atual
        }),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${t('reports.report')}-${reportType}.xlsx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        const errorData = await response.json();
        alert(`${t('reports.generate_error')}: ${errorData.error || response.statusText}`);
      }
    } catch (error) {
      console.error(t('reports.generate_error_console'), error);
      alert(t('reports.generate_retry'));
    } finally {
      setIsGenerating(null);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">{t('reports.configuration')}</CardTitle>
          <CardDescription className="text-sm sm:text-base">{t('reports.configuration_desc')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">{t('reports.date_range')}</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal bg-transparent text-xs sm:text-sm">
                      <CalendarIcon className="mr-2 h-4 w-4 flex-shrink-0" />
                      <span className="truncate">
                        {dateRange.from && dateRange.to
                          ? `${format(dateRange.from, "dd 'de' LLL, y", { locale: ptBR })} - ${format(dateRange.to, "dd 'de' LLL, y", { locale: ptBR })}`
                          : t('reports.select_range')}
                      </span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="range"
                      selected={{ from: dateRange.from, to: dateRange.to }}
                      onSelect={(range) => range && setDateRange(range as { from: Date; to: Date })}
                      numberOfMonths={2}
                      locale={ptBR}
                    />
                  </PopoverContent>
                </Popover>
            </div>
            <div>
                <label className="text-sm font-medium mb-2 block">{t('teams.department_filter')}</label>
                <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                    <SelectTrigger className="w-full"><SelectValue placeholder={t('teams.select_department')} /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">{t('teams.all_departments')}</SelectItem>
                        {departments.map((dep) => (
                            <SelectItem key={dep} value={dep}>{dep}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">{t('teams.member')}</label>
              <Select value={selectedMember} onValueChange={setSelectedMember}>
                <SelectTrigger className="w-full"><SelectValue placeholder={t('teams.select_member')} /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('teams.all_members')}</SelectItem>
                  {teamMembers.map((member) => (
                    <SelectItem key={member.id} value={member.id.toString()}>{member.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-2">
        {reportTypes.map((report) => (
          <Card key={report.id} className="relative">
            <CardHeader className="pb-3 sm:pb-6">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="p-2 bg-primary/10 rounded-lg flex-shrink-0">{report.icon}</div>
                        <div className="min-w-0 flex-1">
                            <CardTitle className="text-base sm:text-lg truncate">{report.title}</CardTitle>
                            <CardDescription className="mt-1 text-sm">{report.description}</CardDescription>
                        </div>
                    </div>
                    <Badge variant="secondary" className="self-start flex-shrink-0">{report.badge}</Badge>
                </div>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => handleGenerateReport(report.id, "excel")}
                  disabled={isGenerating === `${report.id}-excel` || (report.id === 'individual-performance' && selectedMember === 'all')}
                  className="flex-1 text-sm"
                >
                  <Download className="mr-2 h-4 w-4 flex-shrink-0" />
                  <span className="truncate">
                    {isGenerating === `${report.id}-excel` ? t('reports.generating') : t('reports.export_excel')}
                  </span>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}