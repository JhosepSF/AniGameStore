import { create } from 'zustand'

export interface SearchFilters {
  category?: string
  brand?: string
  franchise?: string
  minPrice: number
  maxPrice: number
  rating: number
  sortBy: string
}

interface SearchState {
  searchQuery: string
  filters: SearchFilters
  setSearchQuery: (query: string) => void
  setFilters: (filters: Partial<SearchFilters>) => void
  resetFilters: () => void
}

const initialFilters: SearchFilters = {
  category: '',
  brand: '',
  franchise: '',
  minPrice: 0,
  maxPrice: 2000,
  rating: 0,
  sortBy: 'newest'
}

export const useSearchStore = create<SearchState>((set) => ({
  searchQuery: '',
  filters: initialFilters,

  setSearchQuery: (query) => set({ searchQuery: query }),
  setFilters: (newFilters) => set((state) => ({ filters: { ...state.filters, ...newFilters } })),
  resetFilters: () => set({ filters: initialFilters, searchQuery: '' })
}))
