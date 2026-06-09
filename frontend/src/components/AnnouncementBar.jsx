import { useState, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import api from '../services/api'

const FALLBACK = [
  'FREE SHIPPING ON ORDERS ABOVE ₹999',
  'AUTHENTIC CLUB & NATIONAL TEAM JERSEYS',
  'USE CODE JERSEY10 FOR 10% OFF YOUR FIRST ORDER',
  '30-DAY HASSLE-FREE RETURNS & EXCHANGE',
  '100% LICENSED OFFICIAL MERCHANDISE',
]

export default function AnnouncementBar() {
  const [messages, setMessages] = useState(FALLBACK)
  const [index, setIndex] = useState(0)

  useEffect(() => {
    api.get('/announcements')
      .then(({ data }) => {
        const msgs = data.map((m) => m.message)
        if (msgs.length > 0) setMessages(msgs)
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (messages.length <= 1) return
    const timer = setInterval(() => setIndex((i) => (i + 1) % messages.length), 3000)
    return () => clearInterval(timer)
  }, [messages.length])

  return (
    <div className="bg-white border-b border-gray-100 flex items-center justify-center overflow-hidden" style={{ height: 40 }}>
      <AnimatePresence mode="wait">
        <motion.p
          key={index}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.4, ease: 'easeInOut' }}
          className="text-[11px] font-bold tracking-widest text-black uppercase text-center px-4 absolute"
        >
          {messages[index]}
        </motion.p>
      </AnimatePresence>
    </div>
  )
}
