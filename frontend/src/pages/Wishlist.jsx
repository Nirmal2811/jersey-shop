import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, ShoppingBag, X } from 'lucide-react'
import { toggleWishlist } from '../store/slices/wishlistSlice'
import { addToCart } from '../store/slices/cartSlice'
import { openCart, showToast } from '../store/slices/uiSlice'

export default function Wishlist() {
  const dispatch = useDispatch()
  const { items } = useSelector((s) => s.wishlist)

  const handleAddToCart = (product) => {
    dispatch(addToCart({ product, size: 'M', quantity: 1 }))
    dispatch(openCart())
    dispatch(showToast({ message: 'Added to cart!', type: 'success' }))
  }

  return (
    <div className="max-w-[1400px] mx-auto px-4 py-10">
      <div className="flex items-center gap-3 mb-8">
        <Heart size={24} className="text-orange-500" />
        <h1 className="text-2xl font-black tracking-tight">MY WISHLIST ({items.length})</h1>
      </div>

      {items.length === 0 ? (
        <div className="min-h-[50vh] flex flex-col items-center justify-center gap-6 text-center">
          <Heart size={64} strokeWidth={1} className="text-gray-200" />
          <div>
            <h2 className="text-lg font-black mb-2">YOUR WISHLIST IS EMPTY</h2>
            <p className="text-gray-400 text-sm">Save your favourite jerseys here.</p>
          </div>
          <Link to="/products" className="btn-primary text-xs">BROWSE PRODUCTS</Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          <AnimatePresence>
            {items.map((product) => (
              <motion.div
                key={product.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="group relative"
              >
                <Link to={`/products/${product.id}`}>
                  <div className="relative overflow-hidden bg-gray-50 aspect-[3/4]">
                    <img
                      src={product.image_url || `https://picsum.photos/seed/${product.id}/400/530`}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <button
                      onClick={(e) => {
                        e.preventDefault()
                        dispatch(toggleWishlist(product))
                        dispatch(showToast({ message: 'Removed from wishlist', type: 'success' }))
                      }}
                      className="absolute top-3 right-3 w-9 h-9 bg-white flex items-center justify-center shadow-md hover:bg-red-50 transition-colors"
                    >
                      <X size={14} />
                    </button>
                  </div>
                  <div className="pt-3">
                    <p className="text-[10px] font-bold tracking-widest text-gray-400 uppercase mb-0.5">{product.club}</p>
                    <h3 className="text-sm font-semibold line-clamp-2 group-hover:text-orange-500 transition-colors">{product.name}</h3>
                    <p className="font-black text-sm mt-1.5">₹{product.price?.toLocaleString('en-IN')}</p>
                  </div>
                </Link>
                <button
                  onClick={() => handleAddToCart(product)}
                  className="mt-2 w-full border border-black text-black text-xs font-black tracking-widest py-2.5 flex items-center justify-center gap-2 hover:bg-black hover:text-white transition-all"
                >
                  <ShoppingBag size={12} /> ADD TO BAG
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}
