"use client"

import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { LanguageSwitcher } from "@/components/ui/language-switcher"
import { LogOut, Settings, User as UserIcon, Users, BarChart3, CheckSquare, TrendingUp, FileText, Menu } from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import type { User as UserType } from "@/lib/auth"
import { useLanguage } from "@/contexts/language-context"

interface DashboardHeaderProps {
  user: UserType
}

export function DashboardHeader({ user }: DashboardHeaderProps) {
  const router = useRouter()
  const { t } = useLanguage()

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" })
    router.push("/login")
    router.refresh()
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-[var(--accent)] text-white">
      <div className="container mx-auto px-2 sm:px-4 py-2 sm:py-4 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center space-x-2 sm:space-x-6">
          <Link
            href="/dashboard"
            className="flex items-center gap-1 sm:gap-2 text-lg sm:text-xl font-semibold text-white hover:text-orange-300 transition-colors"
          >
            <Image src="/logo-ustore.png" alt="uStore Logo" width={60} height={40} className="sm:w-[80px] sm:h-[50px] object-contain" />
            <div className="flex flex-col">
              <span className="text-base sm:text-lg font-bold leading-tight">Ustore</span>
              <span className="text-xs -mt-1 leading-tight opacity-90 hidden sm:block">{t('app.subtitle')}</span>
            </div>
          </Link>

          {/* Navegação - oculta no mobile */}
          <nav className="hidden lg:flex items-center space-x-4">
            <Link
              href="/dashboard"
              className="group flex-shrink-0 text-sm text-white/90 hover:text-orange-300 flex items-center space-x-1 transition-colors"
            >
              <BarChart3 className="h-4 w-4 group-hover:text-orange-300" />
              <span>{t('dashboard.title')}</span>
            </Link>
            <Link
              href="/teams"
              className="group flex-shrink-0 text-sm text-white/90 hover:text-orange-300 flex items-center space-x-1 transition-colors"
            >
              <Users className="h-4 w-4 group-hover:text-orange-300" />
              <span>{t('nav.teams')}</span>
            </Link>
            <Link
              href="/tasks"
              className="group flex-shrink-0 text-sm text-white/90 hover:text-orange-300 flex items-center space-x-1 transition-colors"
            >
              <CheckSquare className="h-4 w-4 group-hover:text-orange-300" />
              <span>{t('nav.tasks')}</span>
            </Link>
            {(user.role === "admin" || user.role === "manager") && (
              <Link
                href="/analytics"
                className="group flex-shrink-0 text-sm text-white/90 hover:text-orange-300 flex items-center space-x-1 transition-colors"
              >
                <TrendingUp className="h-4 w-4 group-hover:text-orange-300" />
                <span>{t('nav.analytics')}</span>
              </Link>
            )}
            {(user.role === "admin" || user.role === "manager") && (
              <Link
                href="/reports"
                className="group flex-shrink-0 text-sm text-white/90 hover:text-orange-300 flex items-center space-x-1 transition-colors"
              >
                <FileText className="h-4 w-4 group-hover:text-orange-300" />
                <span>{t('nav.reports')}</span>
              </Link>
            )}
          </nav>
        </div>

        {/* Usuário + Menu */}
        <div className="flex items-center space-x-1 sm:space-x-4">
          <div className="hidden sm:block">
            <LanguageSwitcher />
          </div>
          <span className="text-xs sm:text-sm bg-white/20 text-white px-1 sm:px-2 py-1 rounded-md capitalize hidden sm:block">
            {user.role}
          </span>
          
          {/* Menu Mobile - Visível apenas no mobile */}
          <div className="lg:hidden">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0 text-white hover:bg-white/20">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Menu de navegação</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end">
                <div className="px-3 py-2 border-b bg-gray-50">
                  <p className="text-sm font-medium text-gray-900">Navegação</p>
                </div>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard" className="group flex items-center hover:bg-black hover:text-white">
                    <BarChart3 className="mr-2 h-4 w-4 group-hover:text-white" />
                    <span className="group-hover:text-white">{t('dashboard.title')}</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/teams" className="group flex items-center hover:bg-black hover:text-white">
                    <Users className="mr-2 h-4 w-4 group-hover:text-white" />
                    <span className="group-hover:text-white">{t('nav.teams')}</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/tasks" className="group flex items-center hover:bg-black hover:text-white">
                    <CheckSquare className="mr-2 h-4 w-4 group-hover:text-white" />
                    <span className="group-hover:text-white">{t('nav.tasks')}</span>
                  </Link>
                </DropdownMenuItem>
                {(user.role === "admin" || user.role === "manager") && (
                  <DropdownMenuItem asChild>
                    <Link href="/analytics" className="group flex items-center hover:bg-black hover:text-white">
                      <TrendingUp className="mr-2 h-4 w-4 group-hover:text-white" />
                      <span className="group-hover:text-white">{t('nav.analytics')}</span>
                    </Link>
                  </DropdownMenuItem>
                )}
                {(user.role === "admin" || user.role === "manager") && (
                  <DropdownMenuItem asChild>
                    <Link href="/reports" className="group flex items-center hover:bg-black hover:text-white">
                      <FileText className="mr-2 h-4 w-4 group-hover:text-white" />
                      <span className="group-hover:text-white">{t('nav.reports')}</span>
                    </Link>
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Menu do Usuário */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full text-white">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-white/20 text-white">
                    {user.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end">
              <div className="px-3 py-2 border-b">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{user.name}</span>
                  <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded capitalize">
                    {user.role}
                  </span>
                </div>
              </div>
              <div className="px-3 py-2 border-b">
                <LanguageSwitcher />
              </div>
              <DropdownMenuItem asChild>
                <Link href="/profile" className="group flex items-center">
                  <UserIcon className="mr-2 h-4 w-4 group-hover:text-white" />
                  <span className="group-hover:text-white">{t('nav.profile')}</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/settings" className="group flex items-center">
                  <Settings className="mr-2 h-4 w-4 group-hover:text-white" />
                  <span className="group-hover:text-white">{t('nav.settings')}</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleLogout} className="group flex items-center">
                <LogOut className="mr-2 h-4 w-4 group-hover:text-white" />
                <span className="group-hover:text-white">{t('nav.logout')}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
