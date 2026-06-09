import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Trash2, Minus, Plus, ShoppingBag, ArrowLeft, Tag } from 'lucide-react'
import { removeFromCart, updateQuantity, selectCartTotal } from '../store/slices/cartSlice'
import { getMediaUrl } from '../services/api'

export default function Cart() {
  const dispatch = useDispatch()
  const { items } = useSelector((s) => s.cart)
  const total = useSelector(selectCartTotal)
  const shipping = total >= 999 ? 0 : 99
  const grandTotal = total + shipping

  if (items.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-6 px-4">
        <ShoppingBag size={64} strokeWidth={1} className="text-gray-200" />
        <div className="text-center">
          <h1 className="text-xl font-black tracking-tight mb-2">YOUR BAG IS EMPTY</h1>
          <p className="text-gray-400 text-sm">Looks like you haven't added anything yet.</p>
        </div>
        <Link to="/products" className="btn-primary text-xs">
          CONTINUE SHOPPING
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-[1200px] mx-auto px-4 py-10">
      <div className="flex items-center gap-3 mb-8">
        <Link to="/products" className="text-gray-400 hover:text-black transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-2xl font-black tracking-tight">YOUR BAG ({items.length})</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Items list */}
        <div className="lg:col-span-2">
          <ul className="divide-y border-t border-b">
            {items.map((item) => (
              <motion.li
                key={item.key}
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="py-6 flex gap-5"
              >
                <Link to={`/products/${item.product.id}`}>
                  <img
                    src={getMediaUrl(item.product.image_url) || `https://picsum.photos/seed/${item.product.id}/200/260`}
                    alt={item.product.name}
                    className="w-24 h-32 md:w-28 md:h-36 object-cover bg-gray-50"
                  />
                </Link>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between gap-3">
                    <div>
                      <p className="text-[10px] font-black tracking-widest text-gray-400 uppercase mb-0.5">
                        {item.product.club}
                      </p>
                      <Link to={`/products/${item.product.id}`}>
                        <h3 className="text-sm font-semibold hover:text-orange-500 transition-colors leading-tight">
                          {item.product.name}
                        </h3>
                      </Link>
                    </div>
                    <button
                      onClick={() => dispatch(removeFromCart(item.key))}
                      className="text-gray-300 hover:text-red-500 transition-colors flex-shrink-0"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">Size: <span className="font-semibold text-black">{item.size}</span></p>
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center border border-gray-200">
                      <button
                        onClick={() => dispatch(updateQuantity({ key: item.key, quantity: item.quantity - 1 }))}
                        className="w-9 h-9 flex items-center justify-center hover:bg-gray-100 transition-colors"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="w-9 text-center text-sm font-semibold">{item.quantity}</span>
                      <button
                        onClick={() => dispatch(updateQuantity({ key: item.key, quantity: item.quantity + 1 }))}
                        className="w-9 h-9 flex items-center justify-center hover:bg-gray-100 transition-colors"
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                    <p className="font-black text-base">₹{(item.product.price * item.quantity).toLocaleString('en-IN')}</p>
                  </div>
                </div>
              </motion.li>
            ))}
          </ul>
        </div>

        {/* Summary */}
        <div className="lg:col-span-1">
          <div className="bg-gray-50 p-6 sticky top-24">
            <h2 className="text-xs font-black tracking-widest mb-6">ORDER SUMMARY</h2>

            {/* Coupon */}
            <div className="flex gap-2 mb-6">
              <div className="flex-1 flex items-center border border-gray-200 bg-white px-3 gap-2">
                <Tag size={14} className="text-gray-400" />
                <input
                  placeholder="Enter coupon code"
                  className="flex-1 text-xs py-3 outline-none"
                />
              </div>
              <button className="bg-black text-white text-xs font-black tracking-wider px-4 hover:bg-orange-500 transition-colors">
                APPLY
              </button>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Subtotal ({items.reduce((s, i) => s + i.quantity, 0)} items)</span>
                <span className="font-semibold">₹{total.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Shipping</span>
                {shipping === 0 ? (
                  <span className="font-semibold text-green-600">FREE</span>
                ) : (
                  <span className="font-semibold">₹{shipping}</span>
                )}
              </div>
              {shipping > 0 && (
                <p className="text-xs text-orange-500">Add ₹{(999 - total).toLocaleString('en-IN')} more for free shipping!</p>
              )}
            </div>

            <div className="border-t pt-4 mb-6">
              <div className="flex justify-between">
                <span className="font-black tracking-widest text-sm">TOTAL</span>
                <span className="font-black text-xl">₹{grandTotal.toLocaleString('en-IN')}</span>
              </div>
              <p className="text-xs text-gray-400 mt-1">Inclusive of all taxes</p>
            </div>

            <Link
              to="/checkout"
              className="block w-full bg-black text-white text-center font-black tracking-widest text-sm py-4 hover:bg-orange-500 transition-colors"
            >
              PROCEED TO CHECKOUT
            </Link>

            <div className="mt-4 flex items-center justify-center gap-4">
              {['VISA', 'MC', 'UPI', 'RP'].map((p) => (
                <span key={p} className="text-[9px] font-black text-gray-400 border border-gray-200 px-2 py-1">{p}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
