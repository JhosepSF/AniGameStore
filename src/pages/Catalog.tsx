import React, { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Filter, SlidersHorizontal, RotateCcw, LayoutGrid, Search } from 'lucide-react'
import { productService, Product, Category, Brand } from '../services/productService'
import { useSearchStore } from '../stores/searchStore' // Wait, searchStore is in src/stores or src/
import ProductCard from '../components/ui/ProductCard'

export default function Catalog() {
  const [searchParams, setSearchParams] = useSearchParams()
  const { searchQuery, setSearchQuery } = useSearchStore()

  // State lists
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [brands, setBrands] = useState<Brand[]>([])
  const [franchises, setFranchises] = useState<string[]>(['One Piece', 'Naruto', 'Dragon Ball', 'Demon Slayer', 'Pokémon', 'Genshin Impact', 'Gaming'])

  // Filter local states
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('categoria') || '')
  const [selectedBrand, setSelectedBrand] = useState('')
  const [selectedFranchise, setSelectedFranchise] = useState(searchParams.get('anime') || '')
  const [priceMax, setPriceMax] = useState(2000)
  const [sortBy, setSortBy] = useState('newest')

  useEffect(() => {
    productService.getCategories().then(setCategories)
    productService.getBrands().then(setBrands)
  }, [])

  // Sync route URL parameters with filters
  useEffect(() => {
    const catParam = searchParams.get('categoria')
    if (catParam) setSelectedCategory(catParam)

    const animeParam = searchParams.get('anime')
    if (animeParam) setSelectedFranchise(animeParam)
  }, [searchParams])

  useEffect(() => {
    // Perform filtered queries
    productService.getProducts({
      category: selectedCategory,
      brand: selectedBrand,
      franchise: selectedFranchise,
      search: searchQuery,
      maxPrice: priceMax,
      sortBy: sortBy
    }).then(setProducts)
  }, [selectedCategory, selectedBrand, selectedFranchise, searchQuery, priceMax, sortBy])

  const handleResetFilters = () => {
    setSelectedCategory('')
    setSelectedBrand('')
    setSelectedFranchise('')
    setPriceMax(2000)
    setSortBy('newest')
    setSearchQuery('')
    setSearchParams({})
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 text-geek-light">
      
      {/* Search Header Info */}
      <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Catálogo de Coleccionables</h2>
          <p className="text-xs text-geek-muted mt-1">
            Encontrados {products.length} productos {searchQuery && `para "${searchQuery}"`}
          </p>
        </div>

        {/* Sort Select */}
        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <span className="text-xs text-geek-muted font-bold whitespace-nowrap">Ordenar por:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3.5 py-1.5 bg-[#121422] border border-white/10 rounded-xl text-xs text-geek-light focus:outline-none focus:border-secondary"
          >
            <option value="newest">Novedades</option>
            <option value="price_asc">Precio: Menor a Mayor</option>
            <option value="price_desc">Precio: Mayor a Menor</option>
            <option value="rating">Mejor Valorados</option>
            <option value="sales">Más Vendidos</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* SIDEBAR FILTERS PANEL */}
        <div className="lg:col-span-1 space-y-6">
          <div className="p-6 bg-[#121422] rounded-2xl border border-white/5 space-y-6">
            
            <div className="flex justify-between items-center border-b border-white/5 pb-4">
              <span className="text-sm font-bold flex items-center">
                <SlidersHorizontal className="w-4 h-4 mr-2 text-secondary" />
                Filtros
              </span>
              <button
                onClick={handleResetFilters}
                className="text-xs text-primary hover:underline flex items-center"
              >
                <RotateCcw className="w-3.5 h-3.5 mr-1" />
                Limpiar
              </button>
            </div>

            {/* Category Filter */}
            <div className="space-y-2.5">
              <label className="block text-xs font-bold text-geek-muted uppercase tracking-wider">Categoría</label>
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-2">
                <button
                  onClick={() => setSelectedCategory('')}
                  className={`w-full text-left px-2 py-1 text-xs rounded transition ${
                    selectedCategory === '' ? 'bg-primary/20 text-primary font-bold' : 'text-geek-muted hover:text-white'
                  }`}
                >
                  Todas las categorías
                </button>
                {categories.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setSelectedCategory(c.slug)}
                    className={`w-full text-left px-2 py-1 text-xs rounded transition ${
                      selectedCategory === c.slug ? 'bg-primary/20 text-primary font-bold' : 'text-geek-muted hover:text-white'
                    }`}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Franchise / Anime Filter */}
            <div className="space-y-2.5">
              <label className="block text-xs font-bold text-geek-muted uppercase tracking-wider">Anime o Franquicia</label>
              <div className="space-y-1.5">
                <button
                  onClick={() => setSelectedFranchise('')}
                  className={`w-full text-left px-2 py-1 text-xs rounded transition ${
                    selectedFranchise === '' ? 'bg-secondary/20 text-secondary font-bold' : 'text-geek-muted hover:text-white'
                  }`}
                >
                  Todas las franquicias
                </button>
                {franchises.map((f) => (
                  <button
                    key={f}
                    onClick={() => setSelectedFranchise(f)}
                    className={`w-full text-left px-2 py-1 text-xs rounded transition ${
                      selectedFranchise === f ? 'bg-secondary/20 text-secondary font-bold' : 'text-geek-muted hover:text-white'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Max Filter */}
            <div className="space-y-2.5">
              <div className="flex justify-between text-xs font-bold text-geek-muted uppercase tracking-wider">
                <span>Precio Máximo</span>
                <span className="text-secondary font-bold">S/ {priceMax.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="10"
                max="2000"
                step="10"
                value={priceMax}
                onChange={(e) => setPriceMax(Number(e.target.value))}
                className="w-full accent-secondary"
              />
            </div>

          </div>
        </div>

        {/* PRODUCTS GRID */}
        <div className="lg:col-span-3">
          {products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((prod) => (
                <ProductCard key={prod.id} product={prod} />
              ))}
            </div>
          ) : (
            <div className="p-16 text-center bg-[#121422] border border-white/5 rounded-3xl">
              <p className="text-geek-muted text-sm">No encontramos productos que coincidan con los filtros seleccionados.</p>
              <button
                onClick={handleResetFilters}
                className="mt-4 px-6 py-2.5 bg-primary text-white text-xs font-bold uppercase rounded-xl shadow-neon-pink"
              >
                Restablecer Búsqueda
              </button>
            </div>
          )}
        </div>

      </div>

    </div>
  )
}
