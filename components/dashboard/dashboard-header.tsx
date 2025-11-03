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
    <header className="sticky top-0 z-50 border-b-2 border-border bg-gradient-to-r from-[var(--accent)] via-blue-900 to-[var(--accent)] text-white backdrop-blur-md shadow-xl">
      {/* Animated border bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-orange-500 via-blue-500 to-orange-500 animate-shimmer" style={{ backgroundSize: '200% 100%' }} />
      
      <div className="container mx-auto px-2 sm:px-4 py-2 sm:py-4 flex items-center justify-between relative">
        {/* Logo */}
        <div className="flex items-center space-x-2 sm:space-x-6 animate-slide-in-left">
          <Link
            href="/dashboard"
            className="group flex items-center gap-1 sm:gap-2 text-lg sm:text-xl font-semibold text-white hover:text-orange-300 transition-all duration-300 hover:scale-105"
          >
            <div className="relative group-hover:animate-bounce-subtle">
              <Image src="/logo-ustore.png" alt="uStore Logo" width={60} height={40} className="sm:w-[80px] sm:h-[50px] object-contain" />
              <div className="absolute inset-0 bg-orange-400/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div className="flex flex-col">
              <span className="text-base sm:text-lg font-bold leading-tight bg-gradient-to-r from-white to-orange-200 bg-clip-text text-transparent">Ustore</span>
              <span className="text-xs -mt-1 leading-tight opacity-90 hidden sm:block">{t('app.subtitle')}</span>
            </div>
          </Link>

          {/* Navegação - oculta no mobile */}
          <nav className="hidden lg:flex items-center space-x-1">
            <Link
              href="/dashboard"
              className="group relative px-3 py-2 text-sm text-white/90 hover:text-white flex items-center space-x-2 transition-all duration-300 rounded-lg hover:bg-white/10"
            >
              <BarChart3 className="h-4 w-4 group-hover:scale-110 transition-transform" />
              <span className="font-medium">{t('dashboard.title')}</span>
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-400 scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
            </Link>
            <Link
              href="/teams"
              className="group relative px-3 py-2 text-sm text-white/90 hover:text-white flex items-center space-x-2 transition-all duration-300 rounded-lg hover:bg-white/10"
            >
              <Users className="h-4 w-4 group-hover:scale-110 transition-transform" />
              <span className="font-medium">{t('nav.teams')}</span>
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-400 scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
            </Link>
            <Link
              href="/tasks"
              className="group relative px-3 py-2 text-sm text-white/90 hover:text-white flex items-center space-x-2 transition-all duration-300 rounded-lg hover:bg-white/10"
            >
              <CheckSquare className="h-4 w-4 group-hover:scale-110 transition-transform" />
              <span className="font-medium">{t('nav.tasks')}</span>
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-400 scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
            </Link>
            {(user.role === "admin" || user.role === "manager") && (
              <Link
                href="/analytics"
                className="group relative px-3 py-2 text-sm text-white/90 hover:text-white flex items-center space-x-2 transition-all duration-300 rounded-lg hover:bg-white/10"
              >
                <TrendingUp className="h-4 w-4 group-hover:scale-110 transition-transform" />
                <span className="font-medium">{t('nav.analytics')}</span>
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-400 scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
              </Link>
            )}
            {(user.role === "admin" || user.role === "manager") && (
              <Link
                href="/reports"
                className="group relative px-3 py-2 text-sm text-white/90 hover:text-white flex items-center space-x-2 transition-all duration-300 rounded-lg hover:bg-white/10"
              >
                <FileText className="h-4 w-4 group-hover:scale-110 transition-transform" />
                <span className="font-medium">{t('nav.reports')}</span>
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-400 scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
              </Link>
            )}
          </nav>
        </div>

        {/* Usuário + Menu */}
        <div className="flex items-center space-x-1 sm:space-x-4 animate-slide-in-right">
          <div className="hidden sm:block">
            <LanguageSwitcher />
          </div>
          <span className="text-xs sm:text-sm bg-gradient-to-r from-white/20 to-white/10 backdrop-blur-sm text-white px-2 sm:px-3 py-1.5 rounded-lg capitalize hidden sm:block border border-white/20 shadow-lg">
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
              <Button variant="ghost" className="group relative h-10 w-10 rounded-full text-white hover:bg-white/10 transition-all duration-300 ring-2 ring-white/20 hover:ring-white/40 hover:scale-110">
                <Avatar className="h-9 w-9 transition-transform group-hover:scale-105">
                  <AvatarFallback className="bg-gradient-to-br from-orange-500 to-blue-600 text-white font-bold shadow-lg">
                    {user.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-orange-400/20 to-blue-400/20 opacity-0 group-hover:opacity-100 transition-opacity blur-md" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-64 animate-scale-in shadow-2xl border-2" align="end">
              <div className="px-4 py-3 border-b bg-gradient-to-r from-primary/10 to-blue-500/10">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">{user.name}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                  <span className="text-xs bg-gradient-to-r from-primary to-blue-600 text-white px-2.5 py-1 rounded-full capitalize font-semibold shadow-md">
                    {user.role}
                  </span>
                </div>
              </div>
              <div className="px-3 py-2 border-b lg:hidden">
                <LanguageSwitcher />
              </div>
              <DropdownMenuItem asChild>
                <Link href="/profile" className="group flex items-center cursor-pointer hover:bg-gradient-to-r hover:from-blue-500 hover:to-blue-600 dark:hover:from-primary/10 dark:hover:to-blue-500/10 transition-all duration-200">
                  <div className="p-1.5 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 mr-3 group-hover:scale-110 transition-transform">
                    <UserIcon className="h-4 w-4 text-white" />
                  </div>
                  <span className="font-medium group-hover:text-white dark:group-hover:text-primary transition-colors">{t('nav.profile')}</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/settings" className="group flex items-center cursor-pointer hover:bg-gradient-to-r hover:from-purple-500 hover:to-purple-600 dark:hover:from-primary/10 dark:hover:to-blue-500/10 transition-all duration-200">
                  <div className="p-1.5 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 mr-3 group-hover:scale-110 transition-transform">
                    <Settings className="h-4 w-4 text-white" />
                  </div>
                  <span className="font-medium group-hover:text-white dark:group-hover:text-primary transition-colors">{t('nav.settings')}</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleLogout} className="group flex items-center cursor-pointer hover:bg-gradient-to-r hover:from-red-500 hover:to-red-600 dark:hover:from-red-950 dark:hover:to-red-900 transition-all duration-200 text-red-600 dark:text-red-400">
                <div className="p-1.5 rounded-lg bg-gradient-to-br from-red-500 to-red-600 mr-3 group-hover:scale-110 transition-transform">
                  <LogOut className="h-4 w-4 text-white" />
                </div>
                <span className="font-medium group-hover:text-white dark:group-hover:text-red-300 transition-colors">{t('nav.logout')}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
