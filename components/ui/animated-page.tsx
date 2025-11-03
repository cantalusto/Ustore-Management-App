"use client"

import { ReactNode } from "react"

interface AnimatedPageProps {
  children: ReactNode
  className?: string
}

export function AnimatedPage({ children, className = "" }: AnimatedPageProps) {
  return (
    <div className={`animate-fade-in ${className}`}>
      {children}
    </div>
  )
}

export function AnimatedSection({ children, delay = 0, className = "" }: AnimatedPageProps & { delay?: number }) {
  return (
    <div 
      className={`animate-slide-in-up ${className}`}
      style={{ animationDelay: `${delay}ms` }}
    >
      {children}
    </div>
  )
}

export function AnimatedCard({ children, index = 0, className = "" }: AnimatedPageProps & { index?: number }) {
  return (
    <div 
      className={`animate-scale-in ${className}`}
      style={{ animationDelay: `${index * 100}ms` }}
    >
      {children}
    </div>
  )
}
