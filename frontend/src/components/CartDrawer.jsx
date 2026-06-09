import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react'
import { closeCart } from '../store/slices/uiSlice'
import { removeFromCart, updateQuantity, selectCartTotal } from '../store/slices/cartSlice'
import { getMediaUrl } from '../services/api'

export default function CartDrawer() {
  const dispatch = useDispatch()
  const { cartOpen } = useSelector((s) => s.ui)
  const { items } = useSelector((s) => s.cart)
  const total = useSelector(selectCartTotal)

  return (
    <AnimatePresence>
      {cartOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => dispatch(closeCart())}
            className="fixed inset-0 bg-black/50 z-50"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-white z-50 flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b">
              <div className="flex items-center gap-2">
                <ShoppingBag size={20} />
                <h2 className="font-black text-base tracking-widest uppercase">
                  Your Bag ({items.length})
                </h2>
              </div>
              <button
                onClick={() => dispatch(closeCart())}
                className="p-2 hover:bg-gray-100 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-4 text-gray-400">
                  <ShoppingBag size={48} strokeWidth={1} />
                  <p className="font-semibold text-sm tracking-widest">YOUR BAG IS EMPTY</p>
                  <Link
                    to="/products"
                    onClick={() => dispatch(closeCart())}
                    className="btn-primary text-xs"
                  >
                    SHOP NOW
                  </Link>
                </div>
              ) : (
                <ul className="divide-y">
                  {items.map((item) => (
                    <li key={item.key} className="p-4 flex gap-4">
                      <Link to={`/products/${item.product.id}`} onClick={() => dispatch(closeCart())}>
                        <img
                          src={getMediaUrl(item.product.image_url) || `https://picsum.photos/seed/${item.product.id}/120/160`}
                          alt={item.product.name}
                          className="w-20 h-28 object-cover bg-gray-50"
                        />
                      </Link>
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">
                          {item.product.club}
                        </p>
                        <p className="text-sm font-semibold leading-tight line-clamp-2 mt-0.5">
                          {item.product.name}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">Size: {item.size}</p>
                        <div className="flex items-center justify-between mt-3">
                          <div className="flex items-center border border-gray-200">
                            <button
                              onClick={() => dispatch(updateQuantity({ key: item.key, quantity: item.quantity - 1 }))}
                              className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 transition-colors"
                            >
                              <Minus size={12} />
                            </button>
                            <span className="w-8 text-center text-sm font-semibold">{item.quantity}</span>
                            <button
                              onClick={() => dispatch(updateQuantity({ key: item.key, quantity: item.quantity + 1 }))}
                              className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 transition-colors"
                            >
                              <Plus size={12} />
                            </button>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="font-black text-sm">
                              ₹{(item.product.price * item.quantity).toLocaleString('en-IN')}
                            </span>
                            <button
                              onClick={() => dispatch(removeFromCart(item.key))}
                              className="text-gray-400 hover:text-red-500 transition-colors"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t p-5 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-semibold tracking-widest">SUBTOTAL</span>
                  <span className="font-black text-lg">₹{total.toLocaleString('en-IN')}</span>
                </div>
                <p className="text-xs text-gray-500">Shipping & taxes calculated at checkout</p>
                <Link
                  to="/checkout"
                  onClick={() => dispatch(closeCart())}
                  className="block w-full bg-black text-white text-center font-black tracking-widest text-sm py-4 hover:bg-orange-500 transition-colors"
                >
                  CHECKOUT
                </Link>
                <Link
                  to="/cart"
                  onClick={() => dispatch(closeCart())}
                  className="block w-full border-2 border-black text-black text-center font-black tracking-widest text-sm py-3.5 hover:bg-black hover:text-white transition-all"
                >
                  VIEW FULL BAG
                </Link>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
