"use client"

import { useState, useEffect, useRef } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Search, X, User, CheckSquare, Folder } from "lucide-react"
import { useRouter } from "next/navigation"

interface SearchResult {
  id: string
  type: "task" | "member" | "project"
  title: string
  subtitle: string
  description?: string
  metadata?: string
}

interface GlobalSearchProps {
  placeholder?: string
  className?: string
}

export function GlobalSearch({
  placeholder = "Search tasks, members, projects...",
  className = "",
}: GlobalSearchProps) {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchResult[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (query.trim()) {
        performSearch(query)
      } else {
        setResults([])
        setIsOpen(false)
      }
    }, 300)

    return () => clearTimeout(debounceTimer)
  }, [query])

  const performSearch = async (searchQuery: string) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`)
      const data = await response.json()
      setResults(data.results || [])
      setIsOpen(true)
    } catch (error) {
      console.error("Search failed:", error)
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  const handleResultClick = (result: SearchResult) => {
    setIsOpen(false)
    setQuery("")

    switch (result.type) {
      case "task":
        router.push(`/tasks?highlight=${result.id}`)
        break
      case "member":
        router.push(`/teams?highlight=${result.id}`)
        break
      case "project":
        router.push(`/analytics?project=${result.id}`)
        break
    }
  }

  const getResultIcon = (type: string) => {
    switch (type) {
      case "task":
        return CheckSquare
      case "member":
        return User
      case "project":
        return Folder
      default:
        return Search
    }
  }

  const getResultTypeColor = (type: string) => {
    switch (type) {
      case "task":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
      case "member":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      case "project":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
    }
  }

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="pl-10 pr-10"
          onFocus={() => query.trim() && setIsOpen(true)}
        />
        {query && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
            onClick={() => {
              setQuery("")
              setResults([])
              setIsOpen(false)
            }}
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>

      {isOpen && (
        <Card className="absolute top-full left-0 right-0 mt-2 z-50 max-h-96 overflow-y-auto">
          <CardContent className="p-2">
            {loading ? (
              <div className="p-4 text-center text-sm text-muted-foreground">Searching...</div>
            ) : results.length > 0 ? (
              <div className="space-y-1">
                {results.map((result) => {
                  const Icon = getResultIcon(result.type)
                  return (
                    <div
                      key={result.id}
                      className="flex items-center space-x-3 p-3 rounded-md hover:bg-muted cursor-pointer"
                      onClick={() => handleResultClick(result)}
                    >
                      <Icon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <h4 className="text-sm font-medium truncate">{result.title}</h4>
                          <Badge variant="secondary" className={getResultTypeColor(result.type)}>
                            {result.type}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground truncate">{result.subtitle}</p>
                        {result.description && (
                          <p className="text-xs text-muted-foreground truncate mt-1">{result.description}</p>
                        )}
                      </div>
                      {result.metadata && <div className="text-xs text-muted-foreground">{result.metadata}</div>}
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="p-4 text-center text-sm text-muted-foreground">No results found for "{query}"</div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
