import { useEffect, useState, useRef, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react'
import api from '../services/api'
import ProductCard from './ProductCard'

const CARD_WIDTH = 300 // px per card including gap

export default function FeaturedProducts({
  title = 'FEATURED',
  subtitle,
  link = '/products',
  flag,
  category,
}) {
  const [products, setProducts] = useState([])
  const [loading, setLoading]   = useState(true)
  const [canPrev, setCanPrev]   = useState(false)
  const [canNext, setCanNext]   = useState(false)
  const scrollRef = useRef(null)

  useEffect(() => {
    const params = { per_page: 12 }
    if (flag) params[flag] = 'true'
    if (category) params.category = category

    setLoading(true)
    api.get('/products/', { params })
      .then(({ data }) => setProducts(data.products || []))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false))
  }, [flag, category])

  const updateArrows = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    setCanPrev(el.scrollLeft > 8)
    setCanNext(el.scrollLeft < el.scrollWidth - el.clientWidth - 8)
  }, [])

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    updateArrows()
    el.addEventListener('scroll', updateArrows, { passive: true })
    window.addEventListener('resize', updateArrows)
    return () => {
      el.removeEventListener('scroll', updateArrows)
      window.removeEventListener('resize', updateArrows)
    }
  }, [products, updateArrows])

  const scroll = (dir) => {
    scrollRef.current?.scrollBy({ left: dir * CARD_WIDTH * 2, behavior: 'smooth' })
  }

  if (!loading && products.length === 0) return null

  return (
    <section className="py-12 max-w-[1400px] mx-auto px-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl md:text-3xl font-black tracking-tight">{title}</h2>
          {subtitle && <p className="text-gray-500 text-sm mt-1">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-3">
          {/* Arrows — desktop only */}
          {!loading && (
            <div className="hidden md:flex gap-1.5">
              <button
                onClick={() => scroll(-1)}
                disabled={!canPrev}
                className="w-9 h-9 border-2 border-gray-200 flex items-center justify-center hover:border-black transition-colors disabled:opacity-25 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() => scroll(1)}
                disabled={!canNext}
                className="w-9 h-9 border-2 border-gray-200 flex items-center justify-center hover:border-black transition-colors disabled:opacity-25 disabled:cursor-not-allowed"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
          <Link
            to={link}
            className="flex items-center gap-1 text-sm font-bold tracking-widest text-black hover:text-orange-500 transition-colors border-b-2 border-black hover:border-orange-500 pb-0.5"
          >
            VIEW ALL <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      {/* Carousel */}
      {loading ? (
        <div className="flex gap-4 overflow-hidden">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex-shrink-0 w-[280px] aspect-[3/4] bg-gray-100 animate-pulse rounded" />
          ))}
        </div>
      ) : (
        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto scroll-smooth pb-2"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          <style>{`.featured-scroll::-webkit-scrollbar{display:none}`}</style>
          {products.map((product) => (
            <div key={product.id} className="flex-shrink-0 w-[280px]">
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
