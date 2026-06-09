import { useState, useEffect, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Heart, ShoppingBag, Star, Truck, RefreshCw, Shield,
  ChevronRight, ChevronLeft, Minus, Plus, X, ZoomIn,
} from 'lucide-react'
import { addToCart } from '../store/slices/cartSlice'
import { toggleWishlist, selectIsWishlisted } from '../store/slices/wishlistSlice'
import { openCart, showToast } from '../store/slices/uiSlice'
import api, { getMediaUrl } from '../services/api'
import ProductCard from '../components/ProductCard'

/* ── Lightbox ── */
function Lightbox({ images, startIndex, onClose }) {
  const [current, setCurrent] = useState(startIndex)

  const prev = useCallback(() => setCurrent((i) => (i - 1 + images.length) % images.length), [images.length])
  const next = useCallback(() => setCurrent((i) => (i + 1) % images.length), [images.length])

  useEffect(() => {
    const scrollY = window.scrollY
    document.body.style.position = 'fixed'
    document.body.style.top = `-${scrollY}px`
    document.body.style.width = '100%'
    return () => {
      document.body.style.position = ''
      document.body.style.top = ''
      document.body.style.width = ''
      window.scrollTo(0, scrollY)
    }
  }, [])

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'ArrowLeft') prev()
      if (e.key === 'ArrowRight') next()
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [prev, next, onClose])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center"
      onClick={onClose}
    >
      {/* Close */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white/60 hover:text-white z-10 p-2"
      >
        <X size={28} />
      </button>

      {/* Counter */}
      <p className="absolute top-5 left-1/2 -translate-x-1/2 text-white/50 text-xs font-bold tracking-widest">
        {current + 1} / {images.length}
      </p>

      {/* Prev */}
      {images.length > 1 && (
        <button
          onClick={(e) => { e.stopPropagation(); prev() }}
          className="absolute left-4 md:left-8 text-white/60 hover:text-white p-2 hover:bg-white/10 rounded-full transition-colors z-10"
        >
          <ChevronLeft size={36} />
        </button>
      )}

      {/* Image */}
      <AnimatePresence mode="wait">
        <motion.img
          key={current}
          src={images[current]}
          alt=""
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          transition={{ duration: 0.2 }}
          className="max-h-[85vh] max-w-[85vw] object-contain select-none"
          onClick={(e) => e.stopPropagation()}
        />
      </AnimatePresence>

      {/* Next */}
      {images.length > 1 && (
        <button
          onClick={(e) => { e.stopPropagation(); next() }}
          className="absolute right-4 md:right-8 text-white/60 hover:text-white p-2 hover:bg-white/10 rounded-full transition-colors z-10"
        >
          <ChevronRight size={36} />
        </button>
      )}

      {/* Thumbnails strip */}
      {images.length > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={(e) => { e.stopPropagation(); setCurrent(i) }}
              className={`w-12 h-12 border-2 transition-colors overflow-hidden flex-shrink-0 ${i === current ? 'border-white' : 'border-white/20 opacity-50 hover:opacity-80'}`}
            >
              <img src={img} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </motion.div>
  )
}

export default function ProductDetail() {
  const { id } = useParams()
  const dispatch = useDispatch()
  const isWishlisted = useSelector(selectIsWishlisted(Number(id)))

  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedSize, setSelectedSize] = useState(null)
  const [quantity, setQuantity] = useState(1)
  const [activeImage, setActiveImage] = useState(0)
  const [sizeError, setSizeError] = useState(false)
  const [lightbox, setLightbox] = useState(false)
  const [related, setRelated] = useState([])

  useEffect(() => {
    setLoading(true)
    setProduct(null)
    setSelectedSize(null)
    setActiveImage(0)
    setQuantity(1)
    setRelated([])
    window.scrollTo(0, 0)
    api.get(`/products/${id}`)
      .then(({ data }) => {
        setProduct(data)
        return data
      })
      .then((p) =>
        api.get('/products', { params: { category: p.category, per_page: 7 } })
          .then(({ data }) => {
            const items = (data.products || data).filter((x) => x.id !== p.id).slice(0, 6)
            setRelated(items)
          })
          .catch(() => {})
      )
      .catch(() => setProduct(null))
      .finally(() => setLoading(false))
  }, [id])

  // Reset quantity to 1 when size changes
  useEffect(() => { setQuantity(1) }, [selectedSize])

  const getSizeStock = (sz) => {
    if (product?.size_stock && product.size_stock[sz] !== undefined)
      return product.size_stock[sz]
    return null
  }

  const maxQty = selectedSize ? (getSizeStock(selectedSize) ?? 99) : 99

  const handleAddToCart = () => {
    if (!selectedSize) { setSizeError(true); return }
    setSizeError(false)
    dispatch(addToCart({ product, size: selectedSize, quantity }))
    dispatch(openCart())
    dispatch(showToast({ message: 'Added to cart!', type: 'success' }))
  }

  const handleWishlist = () => {
    dispatch(toggleWishlist(product))
    dispatch(showToast({ message: isWishlisted ? 'Removed from wishlist' : 'Added to wishlist', type: 'success' }))
  }

  if (loading) {
    return (
      <div className="max-w-[1400px] mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div className="bg-gray-100 animate-pulse rounded" style={{ aspectRatio: '3/4' }} />
          <div className="space-y-4 pt-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-6 bg-gray-100 rounded animate-pulse" style={{ width: `${[25, 75, 50, 33, 60][i]}%` }} />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <p className="text-gray-400 font-semibold text-lg">Product not found</p>
        <Link to="/products" className="btn-primary text-xs">BROWSE ALL PRODUCTS</Link>
      </div>
    )
  }

  const images = (product.images?.length ? product.images : (product.image_url ? [product.image_url] : [])).map(getMediaUrl)
  const discount = product.original_price
    ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
    : null

  const goImage = (dir) => setActiveImage((i) => (i + dir + images.length) % images.length)

  return (
    <>
      {/* Lightbox */}
      <AnimatePresence>
        {lightbox && (
          <Lightbox images={images} startIndex={activeImage} onClose={() => setLightbox(false)} />
        )}
      </AnimatePresence>

      <div className="max-w-[1400px] mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-gray-400 mb-6 flex-wrap">
          <Link to="/" className="hover:text-black">Home</Link>
          <ChevronRight size={12} />
          <Link to="/products" className="hover:text-black">Products</Link>
          <ChevronRight size={12} />
          <Link to={`/products?category=${product.category}`} className="hover:text-black capitalize">
            {product.category.replace(/-/g, ' ')}
          </Link>
          <ChevronRight size={12} />
          <span className="text-black truncate max-w-[200px]">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* ── Images ── */}
          <div className="flex gap-3">
            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex flex-col gap-2 w-16 flex-shrink-0">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(i)}
                    className={`border-2 transition-colors ${activeImage === i ? 'border-black' : 'border-transparent hover:border-gray-300'}`}
                  >
                    <img src={img} alt="" className="w-16 h-20 object-cover bg-gray-50" />
                  </button>
                ))}
              </div>
            )}

            {/* Main image */}
            <div className="flex-1 relative group" style={{ aspectRatio: '3/4' }}>
              <motion.div
                key={activeImage}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="w-full h-full bg-gray-50 overflow-hidden cursor-zoom-in"
                onClick={() => setLightbox(true)}
              >
                <img
                  src={images[activeImage] || ''}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </motion.div>

              {/* Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-1 pointer-events-none">
                {product.is_new && (
                  <span className="bg-black text-white text-[9px] font-black tracking-widest px-3 py-1">NEW</span>
                )}
                {discount > 0 && (
                  <span className="bg-orange-500 text-white text-[9px] font-black tracking-widest px-3 py-1">-{discount}%</span>
                )}
              </div>

              {/* Zoom hint */}
              <div className="absolute bottom-3 right-3 bg-black/60 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                <ZoomIn size={16} />
              </div>

              {/* Prev / Next arrows */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={(e) => { e.stopPropagation(); goImage(-1) }}
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white shadow p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); goImage(1) }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white shadow p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <ChevronRight size={18} />
                  </button>
                </>
              )}

              {/* Dot indicators */}
              {images.length > 1 && (
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                  {images.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveImage(i)}
                      className={`rounded-full transition-all ${i === activeImage ? 'w-4 h-1.5 bg-black' : 'w-1.5 h-1.5 bg-black/30'}`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ── Info ── */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            {product.club && (
              <p className="text-xs font-black tracking-widest text-orange-500 uppercase mb-2">{product.club}</p>
            )}
            <h1 className="text-2xl md:text-3xl font-black tracking-tight mb-3">{product.name}</h1>

            {product.reviews_count > 0 && (
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={14} className={i < Math.round(product.rating) ? 'text-orange-500 fill-orange-500' : 'text-gray-300'} />
                  ))}
                </div>
                <span className="text-sm text-gray-500">({product.reviews_count} reviews)</span>
              </div>
            )}

            {/* Price */}
            <div className="flex items-baseline gap-3 mb-1">
              <span className="text-2xl font-black">₹{Number(product.price).toLocaleString('en-IN')}</span>
              {product.original_price && (
                <>
                  <span className="text-base text-gray-400 line-through">₹{Number(product.original_price).toLocaleString('en-IN')}</span>
                  <span className="bg-orange-500 text-white text-xs font-black px-2 py-0.5">SAVE {discount}%</span>
                </>
              )}
            </div>
            <p className="text-xs text-gray-400 mb-6">MRP inclusive of all taxes</p>

            {/* Size */}
            <div className="mb-6">
              <h3 className="text-xs font-black tracking-widest mb-3">SELECT SIZE</h3>
              <div className="flex flex-wrap gap-2">
                {(product.sizes || []).map((sz) => {
                  const stock = getSizeStock(sz)
                  const outOfStock = stock !== null && stock === 0
                  return (
                    <button
                      key={sz}
                      disabled={outOfStock}
                      onClick={() => { setSelectedSize(sz); setSizeError(false) }}
                      className={`w-14 h-12 border-2 text-sm font-semibold transition-all relative
                        ${outOfStock ? 'border-gray-100 text-gray-300 cursor-not-allowed line-through' : ''}
                        ${selectedSize === sz && !outOfStock ? 'border-black bg-black text-white' : ''}
                        ${!outOfStock && selectedSize !== sz ? 'border-gray-200 hover:border-black' : ''}
                      `}
                    >
                      {sz}
                      {stock !== null && stock > 0 && stock <= 5 && (
                        <span className="absolute -top-1.5 -right-1.5 bg-orange-500 text-white text-[8px] font-black px-1 rounded-full leading-none py-0.5">
                          {stock}
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>
              {sizeError && <p className="text-red-500 text-xs mt-2 font-semibold">Please select a size to continue</p>}
              {selectedSize && maxQty <= 5 && maxQty > 0 && (
                <p className="text-orange-500 text-xs mt-2 font-semibold">Only {maxQty} left in size {selectedSize}!</p>
              )}
            </div>

            {/* Quantity */}
            <div className="mb-6">
              <h3 className="text-xs font-black tracking-widest mb-3">
                QUANTITY
                {selectedSize && maxQty < 99 && (
                  <span className="font-normal text-gray-400 ml-2 normal-case tracking-normal">
                    (max {maxQty})
                  </span>
                )}
              </h3>
              <div className={`flex items-center border w-fit transition-opacity ${!selectedSize ? 'opacity-40 pointer-events-none border-gray-200' : 'border-gray-200'}`}>
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={!selectedSize || quantity <= 1}
                  className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 disabled:opacity-30 transition-colors"
                >
                  <Minus size={14} />
                </button>
                <span className="w-12 text-center font-semibold text-sm">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => Math.min(maxQty, q + 1))}
                  disabled={!selectedSize || quantity >= maxQty}
                  className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 disabled:opacity-30 transition-colors"
                >
                  <Plus size={14} />
                </button>
              </div>
              {!selectedSize && (
                <p className="text-xs text-gray-400 mt-1.5">Select a size to set quantity</p>
              )}
            </div>

            {/* CTA */}
            <div className="flex gap-3 mb-8">
              <button
                onClick={handleAddToCart}
                className="flex-1 bg-black text-white font-black tracking-widest text-sm py-4 flex items-center justify-center gap-2 hover:bg-orange-500 transition-colors"
              >
                <ShoppingBag size={16} /> ADD TO BAG
              </button>
              <button
                onClick={handleWishlist}
                className={`w-14 border-2 flex items-center justify-center transition-all ${
                  isWishlisted ? 'border-orange-500 bg-orange-500 text-white' : 'border-gray-200 hover:border-black'
                }`}
              >
                <Heart size={18} fill={isWishlisted ? 'currentColor' : 'none'} />
              </button>
            </div>

            {/* Trust */}
            <div className="space-y-3 border-t border-b py-5 mb-6">
              {[
                { icon: Truck, text: 'Free shipping on orders above ₹999' },
                { icon: RefreshCw, text: '30-day hassle-free exchange & return' },
                { icon: Shield, text: '100% authentic licensed merchandise' },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-3 text-sm text-gray-600">
                  <Icon size={16} className="text-orange-500 flex-shrink-0" />
                  {text}
                </div>
              ))}
            </div>

            {/* Details */}
            <div>
              <h3 className="text-xs font-black tracking-widest mb-3">PRODUCT DETAILS</h3>
              {product.description && (
                <p className="text-sm text-gray-600 leading-relaxed mb-4">{product.description}</p>
              )}
              {product.features?.length > 0 && (
                <ul className="list-disc list-inside space-y-1 mb-3">
                  {product.features.map((f) => <li key={f} className="text-sm text-gray-600">{f}</li>)}
                </ul>
              )}
              {product.composition && (
                <p className="text-xs text-gray-400 mt-3">
                  <span className="font-semibold">Composition:</span> {product.composition}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* You may also like */}
      {related.length > 0 && (
        <div className="max-w-[1400px] mx-auto px-4 pb-16 mt-16 border-t pt-12">
          <h2 className="text-xs font-black tracking-widest mb-6">YOU MAY ALSO LIKE</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}
    </>
  )
}
