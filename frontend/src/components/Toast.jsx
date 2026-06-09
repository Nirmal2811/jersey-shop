import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { AnimatePresence, motion } from 'framer-motion'
import { CheckCircle, XCircle, X } from 'lucide-react'
import { hideToast } from '../store/slices/uiSlice'

const CART_W = 448 // max-w-md in px

export default function Toast() {
  const dispatch = useDispatch()
  const { toast, cartOpen } = useSelector((s) => s.ui)

  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => dispatch(hideToast()), 3000)
      return () => clearTimeout(t)
    }
  }, [toast, dispatch])

  // Center within the area not covered by the cart drawer
  const leftStyle = cartOpen
    ? { left: `calc((100vw - ${CART_W}px) / 2)`, transform: 'translateX(-50%)' }
    : { left: '50%', transform: 'translateX(-50%)' }

  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          initial={{ y: -40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -40, opacity: 0 }}
          transition={{ duration: 0.25 }}
          style={leftStyle}
          className="fixed top-[6.5rem] z-[200] flex items-center gap-3 bg-black text-white px-5 py-3 shadow-2xl min-w-[240px]"
        >
          {toast.type === 'error' ? (
            <XCircle size={18} className="text-red-400 flex-shrink-0" />
          ) : (
            <CheckCircle size={18} className="text-orange-400 flex-shrink-0" />
          )}
          <span className="text-sm font-semibold flex-1">{toast.message}</span>
          <button onClick={() => dispatch(hideToast())} className="text-white/60 hover:text-white">
            <X size={14} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
