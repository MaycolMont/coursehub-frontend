import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { useDebounce } from '@/hooks/useDebounce'
import { materiasService } from '@/services/materias.service'
import type { Materia } from '@/types'

interface SearchModalProps {
  isOpen: boolean
  onClose: () => void
}

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Materia[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()

  const debouncedQuery = useDebounce(query, 300)

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => inputRef.current?.focus(), 50)
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  useEffect(() => {
    if (!debouncedQuery.trim()) return

    let cancelled = false

    const search = async () => {
      setIsLoading(true)
      try {
        const data = await materiasService.list({ search: debouncedQuery.trim() })
        if (!cancelled) {
          setResults(data.results)
          setSelectedIndex(0)
        }
      } catch {
        if (!cancelled) {
          setResults([])
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    search()

    return () => {
      cancelled = true
    }
  }, [debouncedQuery])

  const handleSelect = useCallback(
    (id: number) => {
      onClose()
      navigate(`/materia/${id}`)
    },
    [onClose, navigate]
  )

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
        return
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedIndex((prev) => Math.min(prev + 1, results.length - 1))
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedIndex((prev) => Math.max(prev - 1, 0))
      }
      if (e.key === 'Enter' && results[selectedIndex]) {
        handleSelect(results[selectedIndex].id)
      }
    },
    [onClose, results, selectedIndex, handleSelect]
  )

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh]">
      <div
        className="absolute inset-0 bg-primary/40 backdrop-blur-sm"
        onClick={onClose}
      />

      <div
        className={cn(
          'relative z-10 w-full max-w-lg mx-4',
          'rounded-2xl bg-surface-card shadow-2xl border border-border-subtle',
          'overflow-hidden'
        )}
        onKeyDown={handleKeyDown}
      >
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border-subtle">
          <span className="material-symbols-outlined text-outline">search</span>
          <input
            ref={inputRef}
            type="text"
            placeholder="Buscar materias..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-body-lg text-on-surface placeholder:text-outline outline-none"
          />
          <kbd className="hidden sm:inline-flex items-center rounded-md border border-border-subtle bg-surface px-1.5 py-0.5 text-label-sm text-outline">
            ESC
          </kbd>
        </div>

        <div className="max-h-80 overflow-y-auto">
          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <span className="material-symbols-outlined animate-spin text-secondary">
                autorenew
              </span>
            </div>
          )}

          {!isLoading && debouncedQuery.trim() && results.length === 0 && (
            <p className="py-8 text-center text-body-md text-outline">
              No se encontraron materias
            </p>
          )}

          {!isLoading &&
            results.map((materia, index) => (
              <button
                key={materia.id}
                onClick={() => handleSelect(materia.id)}
                className={cn(
                  'w-full flex items-center gap-3 px-4 py-3 text-left transition-colors',
                  index === selectedIndex
                    ? 'bg-secondary/10 text-secondary'
                    : 'text-on-surface hover:bg-surface'
                )}
              >
                <span className="material-symbols-outlined text-[20px] text-outline">
                  school
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-body-md font-medium truncate">
                    {materia.nombre}
                  </p>
                  <p className="text-label-sm text-outline truncate">
                    {materia.codigo}
                  </p>
                </div>
              </button>
            ))}

          {!debouncedQuery.trim() && !isLoading && (
            <div className="py-8 text-center">
              <span className="material-symbols-outlined text-[40px] text-outline-variant mb-2 block">
                search
              </span>
              <p className="text-body-md text-outline">
                Escribe para buscar materias
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
