import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { SlidersHorizontal, X, ChevronDown, ChevronUp, Grid, List } from 'lucide-react'
import { fetchProducts, setFilters } from '../store/slices/productsSlice'
import ProductCard from '../components/ProductCard'


const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'popular', label: 'Most Popular' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
]

const CATEGORIES = ['all', 'club-jersey', 'national-team', 'jacket']
const GENDERS = ['all', 'men', 'women', 'kids', 'unisex']
const PRICE_RANGES = [
  { label: 'Under ₹3,000', min: 0, max: 3000 },
  { label: '₹3,000 – ₹5,000', min: 3000, max: 5000 },
  { label: '₹5,000 – ₹7,000', min: 5000, max: 7000 },
  { label: 'Above ₹7,000', min: 7000, max: 99999 },
]

function FilterSection({ title, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="border-b pb-4 mb-4">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full text-xs font-black tracking-widest mb-3"
      >
        {title}
        {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function Products() {
  const dispatch = useDispatch()
  const [searchParams] = useSearchParams()
  const { items, loading, total } = useSelector((s) => s.products)
  const [filterOpen, setFilterOpen] = useState(false)
  const [localFilters, setLocalFilters] = useState({
    category: searchParams.get('category') || '',
    gender: searchParams.get('gender') || '',
    sort: searchParams.get('sort') || 'newest',
    priceRange: null,
    search: searchParams.get('search') || '',
  })

  useEffect(() => {
    const params = {
      category: localFilters.category,
      gender: localFilters.gender,
      sort: localFilters.sort,
      search: localFilters.search,
    }
    if (localFilters.priceRange) {
      params.min_price = localFilters.priceRange.min
      params.max_price = localFilters.priceRange.max
    }
    dispatch(fetchProducts(params))
  }, [dispatch, localFilters])

  const products = items

  const pageTitle = localFilters.category
    ? localFilters.category.replace(/-/g, ' ').toUpperCase()
    : localFilters.gender === 'unisex'
    ? 'UNISEX JERSEYS'
    : localFilters.gender
    ? `${localFilters.gender.toUpperCase()}'S JERSEYS`
    : 'ALL PRODUCTS'

  return (
    <div className="max-w-[1400px] mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-black tracking-tight">{pageTitle}</h1>
        <p className="text-gray-400 text-sm mt-1">{loading ? '...' : `${total ?? products.length} products`}</p>
      </div>

      <div className="flex gap-8">
        {/* Sidebar filters — desktop */}
        <aside className="hidden lg:block w-56 flex-shrink-0">
          <div className="sticky top-24">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xs font-black tracking-widest">FILTERS</h2>
              <button
                onClick={() => setLocalFilters({ category: '', gender: '', sort: 'newest', priceRange: null, search: '' })}
                className="text-xs text-gray-400 hover:text-orange-500 transition-colors"
              >
                CLEAR ALL
              </button>
            </div>

            <FilterSection title="CATEGORY">
              <div className="space-y-2">
                {CATEGORIES.map((c) => (
                  <label key={c} className="flex items-center gap-2 cursor-pointer group">
                    <input
                      type="radio"
                      name="category"
                      checked={localFilters.category === (c === 'all' ? '' : c)}
                      onChange={() => setLocalFilters((f) => ({ ...f, category: c === 'all' ? '' : c }))}
                      className="accent-orange-500"
                    />
                    <span className="text-sm text-gray-600 group-hover:text-black capitalize">
                      {c === 'all' ? 'All' : c.replace(/-/g, ' ')}
                    </span>
                  </label>
                ))}
              </div>
            </FilterSection>

            <FilterSection title="GENDER">
              <div className="space-y-2">
                {GENDERS.map((g) => (
                  <label key={g} className="flex items-center gap-2 cursor-pointer group">
                    <input
                      type="radio"
                      name="gender"
                      checked={localFilters.gender === (g === 'all' ? '' : g)}
                      onChange={() => setLocalFilters((f) => ({ ...f, gender: g === 'all' ? '' : g }))}
                      className="accent-orange-500"
                    />
                    <span className="text-sm text-gray-600 group-hover:text-black capitalize">{g}</span>
                  </label>
                ))}
              </div>
            </FilterSection>

            <FilterSection title="PRICE RANGE">
              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="radio"
                    name="price"
                    checked={localFilters.priceRange === null}
                    onChange={() => setLocalFilters((f) => ({ ...f, priceRange: null }))}
                    className="accent-orange-500"
                  />
                  <span className="text-sm text-gray-600 group-hover:text-black">All prices</span>
                </label>
                {PRICE_RANGES.map((r) => (
                  <label key={r.label} className="flex items-center gap-2 cursor-pointer group">
                    <input
                      type="radio"
                      name="price"
                      checked={localFilters.priceRange?.label === r.label}
                      onChange={() => setLocalFilters((f) => ({ ...f, priceRange: r }))}
                      className="accent-orange-500"
                    />
                    <span className="text-sm text-gray-600 group-hover:text-black">{r.label}</span>
                  </label>
                ))}
              </div>
            </FilterSection>
          </div>
        </aside>

        {/* Main content */}
        <div className="flex-1 min-w-0">
          {/* Top bar */}
          <div className="flex items-center justify-between mb-6 gap-4">
            <button
              onClick={() => setFilterOpen(true)}
              className="lg:hidden flex items-center gap-2 border border-black px-4 py-2 text-xs font-black tracking-widest hover:bg-black hover:text-white transition-colors"
            >
              <SlidersHorizontal size={14} /> FILTER
            </button>

            <div className="flex items-center gap-2 ml-auto">
              <label className="text-xs font-bold tracking-widest text-gray-500 hidden sm:block">SORT:</label>
              <select
                value={localFilters.sort}
                onChange={(e) => setLocalFilters((f) => ({ ...f, sort: e.target.value }))}
                className="border border-gray-200 text-sm py-2 px-3 outline-none focus:border-black"
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Grid */}
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="aspect-[3/4] bg-gray-100 shimmer" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-gray-400 font-semibold text-lg">No products found</p>
              <button
                onClick={() => setLocalFilters({ category: '', gender: '', sort: 'newest', priceRange: null, search: '' })}
                className="mt-4 btn-outline text-xs"
              >
                CLEAR FILTERS
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mobile filter drawer */}
      <AnimatePresence>
        {filterOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setFilterOpen(false)}
              className="fixed inset-0 bg-black/50 z-50 lg:hidden"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 28 }}
              className="fixed left-0 top-0 h-full w-72 bg-white z-50 overflow-y-auto p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xs font-black tracking-widest">FILTERS</h2>
                <button onClick={() => setFilterOpen(false)}>
                  <X size={20} />
                </button>
              </div>
              <FilterSection title="CATEGORY">
                <div className="space-y-2">
                  {CATEGORIES.map((c) => (
                    <label key={c} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="mob-category"
                        checked={localFilters.category === (c === 'all' ? '' : c)}
                        onChange={() => setLocalFilters((f) => ({ ...f, category: c === 'all' ? '' : c }))}
                        className="accent-orange-500"
                      />
                      <span className="text-sm capitalize">{c === 'all' ? 'All' : c.replace(/-/g, ' ')}</span>
                    </label>
                  ))}
                </div>
              </FilterSection>
              <FilterSection title="GENDER">
                <div className="space-y-2">
                  {GENDERS.map((g) => (
                    <label key={g} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="mob-gender"
                        checked={localFilters.gender === (g === 'all' ? '' : g)}
                        onChange={() => setLocalFilters((f) => ({ ...f, gender: g === 'all' ? '' : g }))}
                        className="accent-orange-500"
                      />
                      <span className="text-sm capitalize">{g}</span>
                    </label>
                  ))}
                </div>
              </FilterSection>
              <button
                onClick={() => { setFilterOpen(false); setLocalFilters({ category: '', gender: '', sort: 'newest', priceRange: null, search: '' }) }}
                className="w-full btn-primary text-xs mt-4"
              >
                CLEAR ALL
              </button>
              <button
                onClick={() => setFilterOpen(false)}
                className="w-full btn-outline text-xs mt-2"
              >
                APPLY FILTERS
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
