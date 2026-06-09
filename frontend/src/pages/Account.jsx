import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { User, ShoppingBag, Heart, LogOut, ChevronRight, Package, X, MapPin, Phone, Mail, CreditCard, Truck, Save, Eye, EyeOff } from 'lucide-react'
import { logout, fetchProfile } from '../store/slices/authSlice'
import api from '../services/api'

const STATUS_COLOR = {
  delivered:  'text-green-700 bg-green-100',
  processing: 'text-orange-700 bg-orange-100',
  shipped:    'text-blue-700 bg-blue-100',
  paid:       'text-blue-700 bg-blue-100',
  confirmed:  'text-green-700 bg-green-100',
  pending:    'text-yellow-700 bg-yellow-100',
  cancelled:  'text-red-700 bg-red-100',
}

/* ── Order Detail Modal ── */
const CANCELLABLE = ['processing']

function OrderModal({ order, onClose, onCancelled }) {
  const [cancelling, setCancelling] = useState(false)
  const [cancelError, setCancelError] = useState('')
  const [status, setStatus] = useState(order.status)

  useEffect(() => {
    window.__lenis?.stop()
    return () => window.__lenis?.start()
  }, [])

  const handleCancel = async () => {
    setCancelError('')
    setCancelling(true)
    try {
      await api.put(`/orders/${order.id}/cancel`)
      setStatus('cancelled')
      onCancelled(order.id)
    } catch (err) {
      setCancelError(err.response?.data?.message || 'Failed to cancel order')
    } finally {
      setCancelling(false)
    }
  }

  const isCOD     = !order.razorpay_payment_id
  const subtotal  = order.items.reduce((s, i) => s + i.subtotal, 0)
  const shipping  = Number(order.shipping_amount)
  const codFee    = isCOD ? 50 : 0
  const gst       = Math.round(subtotal * 0.18)

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] bg-black/50 flex items-start justify-center px-4"
        style={{ paddingTop: 24, paddingBottom: 24 }}
        onClick={onClose}
      >
        <motion.div
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 40, opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="bg-white w-full max-w-2xl rounded shadow-2xl flex flex-col"
          style={{ height: 'calc(100vh - 48px)' }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header — never scrolls */}
          <div className="flex items-center justify-between px-6 py-4 border-b flex-none bg-white rounded-t">
            <div>
              <p className="text-xs text-gray-400 font-semibold">ORDER</p>
              <h2 className="text-base font-black tracking-tight">#{order.id}</h2>
            </div>
            <div className="flex items-center gap-3">
              <span className={`text-[10px] font-black px-2.5 py-1 rounded ${STATUS_COLOR[status] || 'bg-gray-100 text-gray-600'}`}>
                {status?.toUpperCase()}
              </span>
              {CANCELLABLE.includes(status) && (
                <button
                  onClick={handleCancel}
                  disabled={cancelling}
                  className="text-[10px] font-black px-3 py-1 border border-red-300 text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50 rounded"
                >
                  {cancelling ? 'CANCELLING…' : 'CANCEL ORDER'}
                </button>
              )}
              <button onClick={onClose} className="text-gray-400 hover:text-black transition-colors">
                <X size={20} />
              </button>
            </div>
          </div>
          {cancelError && (
            <div className="px-6 py-2 bg-red-50 border-b border-red-100 text-xs text-red-500 font-semibold flex-none">
              {cancelError}
            </div>
          )}

          {/* Scrollable body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6" data-lenis-prevent>
            {/* Items */}
            <div>
              <p className="text-[10px] font-black tracking-widest text-gray-400 mb-3">ITEMS ORDERED</p>
              <div className="divide-y divide-gray-50 border border-gray-100 rounded">
                {order.items.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 p-3">
                    {item.product_image
                      ? <img src={item.product_image} alt={item.product_name} className="w-14 h-16 object-cover bg-gray-50 rounded flex-shrink-0" />
                      : <div className="w-14 h-16 bg-gray-100 rounded flex-shrink-0 flex items-center justify-center"><Package size={20} className="text-gray-300" /></div>
                    }
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold leading-tight line-clamp-2">{item.product_name}</p>
                      <p className="text-xs text-gray-400 mt-0.5">Size: {item.size} &nbsp;·&nbsp; Qty: {item.quantity}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-black">₹{item.subtotal.toLocaleString('en-IN')}</p>
                      <p className="text-[10px] text-gray-400">₹{item.unit_price.toLocaleString('en-IN')} each</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Price breakdown */}
            <div>
              <p className="text-[10px] font-black tracking-widest text-gray-400 mb-3">PRICE BREAKDOWN</p>
              <div className="bg-gray-50 rounded p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Subtotal</span>
                  <span>₹{subtotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Shipping</span>
                  <span>₹{shipping}</span>
                </div>
                {isCOD && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">COD Fee</span>
                    <span>₹{codFee}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-500">GST (18%)</span>
                  <span>₹{gst.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between font-black text-base pt-2 border-t border-gray-200">
                  <span>TOTAL</span>
                  <span>₹{Number(order.total_amount).toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            {/* Delivery + Payment side-by-side */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Delivery address */}
              <div>
                <p className="text-[10px] font-black tracking-widest text-gray-400 mb-3">DELIVERY ADDRESS</p>
                <div className="border border-gray-100 rounded p-4 space-y-2">
                  <div className="flex items-start gap-2">
                    <User size={13} className="text-gray-400 mt-0.5 flex-shrink-0" />
                    <p className="text-sm font-semibold">{order.delivery?.name}</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin size={13} className="text-gray-400 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-gray-600 leading-relaxed">
                      {order.delivery?.address},<br />
                      {order.delivery?.city}, {order.delivery?.state} – {order.delivery?.pincode}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone size={13} className="text-gray-400 flex-shrink-0" />
                    <p className="text-xs text-gray-600">{order.delivery?.phone}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail size={13} className="text-gray-400 flex-shrink-0" />
                    <p className="text-xs text-gray-600 truncate">{order.delivery?.email}</p>
                  </div>
                </div>
              </div>

              {/* Payment & order info */}
              <div>
                <p className="text-[10px] font-black tracking-widest text-gray-400 mb-3">PAYMENT & ORDER INFO</p>
                <div className="border border-gray-100 rounded p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    {isCOD
                      ? <Truck size={14} className="text-orange-500 flex-shrink-0" />
                      : <CreditCard size={14} className="text-blue-500 flex-shrink-0" />
                    }
                    <p className="text-sm font-semibold">{isCOD ? 'Cash on Delivery' : 'Online Payment'}</p>
                  </div>
                  {order.razorpay_payment_id && (
                    <div>
                      <p className="text-[10px] text-gray-400 font-bold tracking-widest">PAYMENT ID</p>
                      <p className="text-xs text-gray-600 font-mono break-all">{order.razorpay_payment_id}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-[10px] text-gray-400 font-bold tracking-widest">ORDER DATE</p>
                    <p className="text-xs text-gray-600">
                      {new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 font-bold tracking-widest">ORDER ID</p>
                    <p className="text-xs text-gray-600 font-mono">#{order.id}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

/* ── Edit Profile Form ── */
function EditProfilePanel({ user, onSaved }) {
  const dispatch = useDispatch()
  const [form, setForm] = useState({ name: user?.name || '', phone: user?.phone || '', password: '', confirm: '' })
  const [showPw, setShowPw]   = useState(false)
  const [saving, setSaving]   = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError]     = useState('')

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.password && form.password !== form.confirm) {
      setError('Passwords do not match')
      return
    }
    setError('')
    setSaving(true)
    try {
      const payload = { name: form.name.trim(), phone: form.phone.trim() }
      if (form.password) payload.password = form.password
      await api.put('/auth/profile', payload)
      dispatch(fetchProfile())
      setSuccess(true)
      setForm((f) => ({ ...f, password: '', confirm: '' }))
      setTimeout(() => setSuccess(false), 3000)
      onSaved()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 text-xs font-semibold px-4 py-3 rounded">
          Profile updated successfully!
        </div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-xs font-semibold px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div>
        <label className="block text-xs font-black tracking-widest mb-1.5 text-gray-500">FULL NAME</label>
        <input
          type="text"
          value={form.name}
          onChange={(e) => set('name', e.target.value)}
          required
          className="w-full border border-gray-200 px-4 py-3 text-sm outline-none focus:border-black transition-colors"
          placeholder="Your name"
        />
      </div>

      <div>
        <label className="block text-xs font-black tracking-widest mb-1.5 text-gray-500">EMAIL</label>
        <input
          type="email"
          value={user?.email || ''}
          disabled
          className="w-full border border-gray-100 px-4 py-3 text-sm bg-gray-50 text-gray-400 cursor-not-allowed"
        />
        <p className="text-[10px] text-gray-400 mt-1">Email cannot be changed</p>
      </div>

      <div>
        <label className="block text-xs font-black tracking-widest mb-1.5 text-gray-500">PHONE</label>
        <input
          type="tel"
          value={form.phone}
          onChange={(e) => set('phone', e.target.value)}
          className="w-full border border-gray-200 px-4 py-3 text-sm outline-none focus:border-black transition-colors"
          placeholder="Phone number"
        />
      </div>

      <div className="pt-2 border-t border-gray-100">
        <p className="text-xs font-black tracking-widest text-gray-400 mb-4">CHANGE PASSWORD <span className="font-normal text-gray-300">(leave blank to keep current)</span></p>
        <div className="space-y-3">
          <div className="relative">
            <input
              type={showPw ? 'text' : 'password'}
              value={form.password}
              onChange={(e) => set('password', e.target.value)}
              className="w-full border border-gray-200 px-4 py-3 text-sm outline-none focus:border-black transition-colors pr-12"
              placeholder="New password"
            />
            <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black">
              {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          <input
            type={showPw ? 'text' : 'password'}
            value={form.confirm}
            onChange={(e) => set('confirm', e.target.value)}
            className="w-full border border-gray-200 px-4 py-3 text-sm outline-none focus:border-black transition-colors"
            placeholder="Confirm new password"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={saving}
        className="flex items-center gap-2 bg-black text-white px-6 py-3 text-xs font-black tracking-widest hover:bg-orange-500 transition-colors disabled:opacity-60"
      >
        <Save size={14} />
        {saving ? 'SAVING...' : 'SAVE CHANGES'}
      </button>
    </form>
  )
}

export default function Account() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { user, isAuthenticated, token } = useSelector((s) => s.auth)
  const [activeTab, setActiveTab]         = useState('orders')
  const [orders, setOrders]               = useState([])
  const [ordersLoading, setOrdersLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState(null)

  useEffect(() => {
    if (!isAuthenticated && !token) navigate('/auth')
  }, [isAuthenticated, token, navigate])

  useEffect(() => {
    if (isAuthenticated && !user) dispatch(fetchProfile())
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!isAuthenticated) return
    setOrdersLoading(true)
    api.get('/orders/')
      .then(({ data }) => setOrders(data.orders || data || []))
      .catch(() => setOrders([]))
      .finally(() => setOrdersLoading(false))
  }, [isAuthenticated])

  if (!user && isAuthenticated) {
    return (
      <div className="w-full px-6 py-10">
        <div className="h-8 w-48 bg-gray-100 shimmer mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3">
            <div className="h-40 bg-gray-100 shimmer" />
            <div className="h-12 bg-gray-100 shimmer" />
            <div className="h-12 bg-gray-100 shimmer" />
          </div>
          <div className="md:col-span-3 space-y-3">
            <div className="h-24 bg-gray-100 shimmer" />
            <div className="h-24 bg-gray-100 shimmer" />
          </div>
        </div>
      </div>
    )
  }

  const handleLogout = () => {
    dispatch(logout())
    navigate('/')
  }

  const NAV_ITEMS = [
    { id: 'orders',  icon: ShoppingBag, label: 'My Orders',    count: ordersLoading ? '…' : (orders.length || null) },
    { id: 'wishlist',icon: Heart,       label: 'Wishlist',     path: '/wishlist' },
    { id: 'profile', icon: User,        label: 'Edit Profile' },
  ]

  return (
    <>
      <div className="w-full px-6 py-10">
        <h1 className="text-2xl font-black tracking-tight mb-8">MY ACCOUNT</h1>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="md:col-span-1">
            <div className="bg-black text-white p-6 mb-4">
              <div className="w-16 h-16 bg-orange-500 flex items-center justify-center mb-4">
                <span className="text-2xl font-black">{user?.name?.[0]?.toUpperCase() || 'U'}</span>
              </div>
              <p className="font-black text-lg">{user?.name || 'User'}</p>
              <p className="text-white/60 text-xs mt-0.5">{user?.email}</p>
              {user?.phone && <p className="text-white/40 text-xs mt-0.5">{user.phone}</p>}
            </div>

            <nav className="space-y-1">
              {NAV_ITEMS.map(({ id, icon: Icon, label, path, count }) => {
                const isActive = activeTab === id
                if (path) {
                  return (
                    <Link key={id} to={path}
                      className="flex items-center justify-between p-4 border border-gray-100 hover:border-black hover:bg-gray-50 transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <Icon size={18} className="text-gray-400 group-hover:text-orange-500" />
                        <span className="text-sm font-semibold">{label}</span>
                      </div>
                      <ChevronRight size={14} className="text-gray-300" />
                    </Link>
                  )
                }
                return (
                  <button key={id} onClick={() => setActiveTab(id)}
                    className={`w-full flex items-center justify-between p-4 border transition-all group text-left
                      ${isActive ? 'border-black bg-black text-white' : 'border-gray-100 hover:border-black hover:bg-gray-50'}`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon size={18} className={isActive ? 'text-orange-400' : 'text-gray-400 group-hover:text-orange-500'} />
                      <span className="text-sm font-semibold">{label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {count != null && <span className={`text-xs font-bold ${isActive ? 'text-white/60' : 'text-gray-400'}`}>{count}</span>}
                      <ChevronRight size={14} className={isActive ? 'text-white/40' : 'text-gray-300'} />
                    </div>
                  </button>
                )
              })}
              <button onClick={handleLogout}
                className="w-full flex items-center gap-3 p-4 border border-gray-100 hover:border-red-200 hover:bg-red-50 transition-all group text-left"
              >
                <LogOut size={18} className="text-gray-400 group-hover:text-red-500" />
                <span className="text-sm font-semibold group-hover:text-red-500">Sign Out</span>
              </button>
            </nav>
          </div>

          {/* Main content */}
          <div className="md:col-span-3">
            {activeTab === 'orders' && (
              <>
                <h2 className="text-xs font-black tracking-widest mb-5">RECENT ORDERS</h2>
                {ordersLoading ? (
                  <div className="space-y-3">
                    {[1, 2].map((i) => <div key={i} className="h-20 bg-gray-100 animate-pulse rounded" />)}
                  </div>
                ) : orders.length === 0 ? (
                  <div className="text-center py-16 border border-dashed border-gray-200">
                    <ShoppingBag size={40} strokeWidth={1} className="text-gray-200 mx-auto mb-4" />
                    <p className="text-gray-400 text-sm">No orders yet</p>
                    <Link to="/products" className="btn-primary text-xs mt-4 inline-block">SHOP NOW</Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {orders.map((order) => (
                      <motion.button
                        key={order.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        onClick={() => setSelectedOrder(order)}
                        className="w-full border border-gray-100 p-5 hover:border-black hover:shadow-sm transition-all text-left group"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <Package size={14} className="text-orange-500" />
                              <span className="text-xs font-black tracking-widest">#{order.id}</span>
                            </div>
                            <p className="text-xs text-gray-400">
                              {new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                              {' · '}{order.items?.length ?? 0} item(s)
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-black text-base">₹{Number(order.total_amount).toLocaleString('en-IN')}</p>
                            <span className={`text-[10px] font-black px-2 py-0.5 mt-1 inline-block rounded ${STATUS_COLOR[order.status] || 'text-gray-600 bg-gray-100'}`}>
                              {order.status?.toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <p className="text-[11px] text-gray-400 mt-2 group-hover:text-orange-500 transition-colors">
                          Click to view details →
                        </p>
                      </motion.button>
                    ))}
                  </div>
                )}
              </>
            )}

            {activeTab === 'profile' && (
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                {/* Form */}
                <div className="lg:col-span-3">
                  <h2 className="text-xs font-black tracking-widest mb-6">EDIT PROFILE</h2>
                  <EditProfilePanel user={user} onSaved={() => {}} />
                </div>

                {/* Right info panel */}
                <div className="lg:col-span-2 space-y-4">
                  {/* Account stats */}
                  <div className="bg-black text-white p-6">
                    <p className="text-[10px] font-black tracking-widest text-white/40 mb-5">ACCOUNT SUMMARY</p>
                    <div className="grid grid-cols-2 gap-4 mb-5">
                      <div>
                        <p className="text-3xl font-black">{ordersLoading ? '—' : orders.length}</p>
                        <p className="text-[11px] text-white/50 mt-0.5">Total Orders</p>
                      </div>
                      <div>
                        <p className="text-3xl font-black">{ordersLoading ? '—' : orders.filter((o) => o.status === 'delivered').length}</p>
                        <p className="text-[11px] text-white/50 mt-0.5">Delivered</p>
                      </div>
                    </div>
                    <div className="h-px bg-white/10 mb-4" />
                    <div>
                      <p className="text-[10px] text-white/40 font-bold tracking-widest">LATEST ORDER</p>
                      {orders.length > 0 ? (
                        <p className="text-xs text-white/70 mt-1">
                          #{orders[0].id} · ₹{Number(orders[0].total_amount).toLocaleString('en-IN')}
                        </p>
                      ) : (
                        <p className="text-xs text-white/30 mt-1">No orders yet</p>
                      )}
                    </div>
                  </div>

                  {/* Order status breakdown */}
                  {orders.length > 0 && (
                    <div className="border border-gray-100 p-5">
                      <p className="text-[10px] font-black tracking-widest text-gray-400 mb-4">ORDER STATUS</p>
                      <div className="space-y-2.5">
                        {[
                          { label: 'Pending / Paid', statuses: ['pending', 'paid'], color: 'bg-yellow-400' },
                          { label: 'Processing / Shipped', statuses: ['processing', 'shipped'], color: 'bg-blue-400' },
                          { label: 'Delivered', statuses: ['delivered'], color: 'bg-green-400' },
                          { label: 'Cancelled', statuses: ['cancelled'], color: 'bg-red-400' },
                        ].map(({ label, statuses, color }) => {
                          const count = orders.filter((o) => statuses.includes(o.status)).length
                          const pct   = orders.length ? Math.round((count / orders.length) * 100) : 0
                          return (
                            <div key={label}>
                              <div className="flex justify-between text-[10px] mb-1">
                                <span className="text-gray-500">{label}</span>
                                <span className="font-bold text-gray-700">{count}</span>
                              </div>
                              <div className="h-1 bg-gray-100 rounded-full">
                                <div className={`h-1 rounded-full ${color}`} style={{ width: `${pct}%` }} />
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  {/* Tips */}
                  <div className="border border-dashed border-gray-200 p-5">
                    <p className="text-[10px] font-black tracking-widest text-gray-400 mb-3">TIPS</p>
                    <ul className="space-y-2.5">
                      {[
                        'Keep your phone number updated for delivery alerts',
                        'Use a strong password to secure your account',
                        'Your email is used to track orders and receive updates',
                      ].map((tip) => (
                        <li key={tip} className="flex items-start gap-2">
                          <span className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-1.5 flex-shrink-0" />
                          <p className="text-xs text-gray-400 leading-relaxed">{tip}</p>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {selectedOrder && (
        <OrderModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onCancelled={(id) => setOrders((prev) => prev.map((o) => o.id === id ? { ...o, status: 'cancelled' } : o))}
        />
      )}
    </>
  )
}
