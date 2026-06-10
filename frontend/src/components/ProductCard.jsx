import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { motion } from 'framer-motion'
import { Heart, ShoppingBag, Star } from 'lucide-react'
import { toggleWishlist, selectIsWishlisted } from '../store/slices/wishlistSlice'
import { addToCart } from '../store/slices/cartSlice'
import { openCart, showToast } from '../store/slices/uiSlice'
import { getMediaUrl } from '../services/api'

export default function ProductCard({ product }) {
  const dispatch = useDispatch()
  const isWishlisted = useSelector(selectIsWishlisted(product.id))

  const handleWishlist = (e) => {
    e.preventDefault()
    dispatch(toggleWishlist(product))
    dispatch(showToast({
      message: isWishlisted ? 'Removed from wishlist' : 'Added to wishlist',
      type: 'success',
    }))
  }

  const handleQuickAdd = (e) => {
    e.preventDefault()
    dispatch(addToCart({ product, size: 'M', quantity: 1 }))
    dispatch(openCart())
    dispatch(showToast({ message: 'Added to cart!', type: 'success' }))
  }

  const discount = product.original_price
    ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
    : null

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
    >
      <Link to={`/products/${product.id}`} className="group block">
        {/* Image */}
        <div className="relative overflow-hidden bg-gray-50 aspect-[3/4]">
          <img
            src={getMediaUrl(product.image_url) || `https://picsum.photos/seed/${product.id}/600/800`}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1 pointer-events-none">
            {product.is_new && (
              <span className="bg-black text-white text-[9px] font-black tracking-widest px-2 py-0.5">NEW</span>
            )}
            {discount && (
              <span className="bg-orange-500 text-white text-[9px] font-black tracking-widest px-2 py-0.5">
                -{discount}%
              </span>
            )}
            {product.is_bestseller && (
              <span className="bg-white text-black text-[9px] font-black tracking-widest px-2 py-0.5 border border-black">
                BESTSELLER
              </span>
            )}
          </div>

          {/* Top-right actions */}
          <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <button
              onClick={handleWishlist}
              className={`w-9 h-9 flex items-center justify-center shadow-md transition-colors ${
                isWishlisted ? 'bg-orange-500 text-white' : 'bg-white text-black hover:bg-orange-500 hover:text-white'
              }`}
            >
              <Heart size={15} fill={isWishlisted ? 'currentColor' : 'none'} />
            </button>
          </div>

          {/* Quick add */}
          <div className="absolute bottom-0 left-0 right-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
            <button
              onClick={handleQuickAdd}
              className="w-full bg-black text-white text-xs font-black tracking-widest py-3 flex items-center justify-center gap-2 hover:bg-orange-500 transition-colors"
            >
              <ShoppingBag size={14} /> QUICK ADD
            </button>
          </div>
        </div>

        {/* Info */}
        <div className="pt-3 pb-1 flex flex-col">
          {/* Fixed 1-line height so cards without a club name stay aligned */}
          <p className="text-[10px] font-bold tracking-widest text-gray-400 uppercase mb-0.5 h-4 truncate">
            {product.club || ''}
          </p>
          {/* Fixed 2-line height so price/sizes always start at the same row */}
          <h3 className="text-sm font-semibold text-black leading-tight line-clamp-2 min-h-[2.5rem] group-hover:text-orange-500 transition-colors">
            {product.name}
          </h3>
          {/* Fixed 1-line height for rating row */}
          <div className="flex items-center gap-1 mt-1 h-4">
            {product.rating > 0 && (
              <>
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    size={10}
                    className={i < Math.round(product.rating) ? 'text-orange-500 fill-orange-500' : 'text-gray-300'}
                  />
                ))}
                <span className="text-[10px] text-gray-400">({product.reviews_count || 0})</span>
              </>
            )}
          </div>
          <div className="flex items-center gap-2 mt-1.5">
            <span className="text-sm font-black text-black">₹{product.price?.toLocaleString('en-IN')}</span>
            {product.original_price && (
              <span className="text-xs text-gray-400 line-through">
                ₹{product.original_price?.toLocaleString('en-IN')}
              </span>
            )}
          </div>
          {product.sizes && (
            <div className="flex gap-1 mt-2 flex-wrap">
              {product.sizes.slice(0, 5).map((sz) => (
                <span key={sz} className="text-[9px] border border-gray-200 px-1.5 py-0.5 text-gray-500">
                  {sz}
                </span>
              ))}
            </div>
          )}
        </div>
      </Link>
    </motion.div>
  )
}
