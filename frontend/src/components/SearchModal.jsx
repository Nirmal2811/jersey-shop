import { useState, useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, X, TrendingUp } from 'lucide-react'
import { closeSearch } from '../store/slices/uiSlice'

const TRENDING = [
  'Real Madrid Jersey',
  'Argentina Jersey',
  'Brazil Jersey',
  'Training Jacket',
  'Champions League',
  'Manchester United',
]

const QUICK_LINKS = [
  { label: 'Club Jerseys', path: '/products?category=club-jersey' },
  { label: 'National Teams', path: '/products?category=national-team' },
  { label: 'Training Jackets', path: '/products?category=jacket' },
  { label: 'Sale', path: '/products?sale=true' },
]

export default function SearchModal() {
  const dispatch = useDispatch()
  const { searchOpen } = useSelector((s) => s.ui)
  const [query, setQuery] = useState('')
  const inputRef = useRef(null)

  useEffect(() => {
    if (searchOpen) {
      setTimeout(() => inputRef.current?.focus(), 100)
    } else {
      setQuery('')
    }
  }, [searchOpen])

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') dispatch(closeSearch()) }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [dispatch])

  const handleSearch = (e) => {
    e.preventDefault()
    if (query.trim()) {
      dispatch(closeSearch())
      window.location.href = `/products?search=${encodeURIComponent(query.trim())}`
    }
  }

  return (
    <AnimatePresence>
      {searchOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => dispatch(closeSearch())}
            className="fixed inset-0 bg-black/60 z-50"
          />
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed top-0 left-0 right-0 bg-white z-50 shadow-2xl"
          >
            <div className="max-w-3xl mx-auto px-6 py-6">
              <form onSubmit={handleSearch} className="flex items-center gap-3 border-b-2 border-black pb-4">
                <Search size={22} className="text-gray-400 flex-shrink-0" />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search jerseys, clubs, teams..."
                  className="flex-1 text-xl font-medium outline-none placeholder:text-gray-300"
                />
                {query && (
                  <button type="button" onClick={() => setQuery('')}>
                    <X size={18} className="text-gray-400 hover:text-black" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => dispatch(closeSearch())}
                  className="p-2 hover:bg-gray-100 ml-2"
                >
                  <X size={20} />
                </button>
              </form>

              <div className="mt-6 grid grid-cols-2 gap-8">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <TrendingUp size={14} />
                    <h3 className="text-xs font-black tracking-widest">TRENDING</h3>
                  </div>
                  <ul className="space-y-2">
                    {TRENDING.map((term) => (
                      <li key={term}>
                        <Link
                          to={`/products?search=${encodeURIComponent(term)}`}
                          onClick={() => dispatch(closeSearch())}
                          className="text-sm text-gray-600 hover:text-orange-500 hover:translate-x-1 transition-all block"
                        >
                          {term}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="text-xs font-black tracking-widest mb-3">QUICK LINKS</h3>
                  <ul className="space-y-2">
                    {QUICK_LINKS.map((link) => (
                      <li key={link.label}>
                        <Link
                          to={link.path}
                          onClick={() => dispatch(closeSearch())}
                          className="text-sm text-gray-600 hover:text-orange-500 hover:translate-x-1 transition-all block"
                        >
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
