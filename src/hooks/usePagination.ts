import { useCallback, useState } from 'react'

interface UsePaginationReturn {
  page: number
  nextPage: () => void
  prevPage: () => void
  setPage: (page: number) => void
  resetPage: () => void
}

export function usePagination(initialPage: number = 1): UsePaginationReturn {
  const [page, setPageState] = useState(initialPage)

  const nextPage = useCallback(() => {
    setPageState((prev) => prev + 1)
  }, [])

  const prevPage = useCallback(() => {
    setPageState((prev) => Math.max(1, prev - 1))
  }, [])

  const setPage = useCallback((p: number) => {
    setPageState(Math.max(1, p))
  }, [])

  const resetPage = useCallback(() => {
    setPageState(initialPage)
  }, [initialPage])

  return { page, nextPage, prevPage, setPage, resetPage }
}
