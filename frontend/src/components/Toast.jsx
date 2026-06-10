import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { AnimatePresence, motion } from 'framer-motion'
import { CheckCircle, XCircle, X } from 'lucide-react'
import { hideToast } from '../store/slices/uiSlice'

const CART_W = 448

export default function Toast() {
  const dispatch = useDispatch()
  const { toast, cartOpen } = useSelector((s) => s.ui)
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 640)

  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 640)
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])

  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => dispatch(hideToast()), 3000)
      return () => clearTimeout(t)
    }
  }, [toast, dispatch])

  const positionStyle = isMobile
    ? { left: '50%', transform: 'translateX(-50%)' }
    : cartOpen
      ? { left: `calc((100vw - ${CART_W}px) / 2)`, transform: 'translateX(-50%)' }
      : { left: '50%', transform: 'translateX(-50%)' }

  const yDir = isMobile ? 40 : -40

  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          initial={{ y: yDir, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: yDir, opacity: 0 }}
          transition={{ duration: 0.25 }}
          style={positionStyle}
          className="fixed z-[200] flex items-center gap-3 bg-black text-white px-5 py-3 shadow-2xl min-w-[240px] bottom-6 sm:bottom-auto sm:top-[6.5rem]"
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
