import { useEffect, useState, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { ChevronLeft, ChevronRight, ChevronDown, X, Package, MapPin, Phone, Mail, CreditCard, Truck, User } from 'lucide-react'
import api, { getMediaUrl } from '../../services/api'

const STATUSES = ['', 'processing', 'shipped', 'delivered', 'cancelled']

const STATUS_STYLES = {
  pending:    'bg-yellow-100 text-yellow-700',
  paid:       'bg-blue-100 text-blue-700',
  processing: 'bg-orange-100 text-orange-700',
  shipped:    'bg-purple-100 text-purple-700',
  delivered:  'bg-green-100 text-green-700',
  cancelled:  'bg-red-100 text-red-700',
}

// Linear progression — admin advances one step at a time, no cancel from admin
const NEXT_STATUS = {
  processing: 'shipped',
  shipped:    'delivered',
}

function StatusSelect({ orderId, current, onChanged }) {
  const [value, setValue] = useState(current)
  const [saving, setSaving] = useState(false)

  const next = NEXT_STATUS[value]

  const handleChange = async (e) => {
    const nextVal = e.target.value
    if (nextVal === value) return
    setSaving(true)
    try {
      await api.put(`/admin/orders/${orderId}`, { status: nextVal })
      setValue(nextVal)
      onChanged(orderId, nextVal)
    } finally {
      setSaving(false)
    }
  }

  // No next step (delivered / cancelled): plain badge, read-only
  if (!next) {
    return (
      <span className={`text-[10px] font-black px-2.5 py-1 rounded ${STATUS_STYLES[value] || 'bg-gray-100 text-gray-600'}`}>
        {value.toUpperCase()}
      </span>
    )
  }

  return (
    <div className="relative inline-flex items-center">
      <select
        value={value}
        onChange={handleChange}
        disabled={saving}
        className={`text-[10px] font-black pl-2.5 pr-7 py-1 rounded appearance-none cursor-pointer border-0 outline-none disabled:opacity-60 ${STATUS_STYLES[value] || 'bg-gray-100 text-gray-600'}`}
      >
        <option value={value}>{value.toUpperCase()}</option>
        <option value={next}>{next.toUpperCase()}</option>
      </select>
      <ChevronDown size={11} className="absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none opacity-60" />
    </div>
  )
}

/* ── Order Detail Modal ── */
function OrderDetailModal({ order, onClose, onStatusChanged }) {
  useEffect(() => {
    const el = document.getElementById('admin-main')
    if (!el) return
    const prev = el.style.overflow
    el.style.overflow = 'hidden'
    return () => { el.style.overflow = prev }
  }, [])

  const isCOD    = !order.razorpay_payment_id
  const subtotal = order.items?.reduce((s, i) => s + i.subtotal, 0) || 0
  const shipping = Number(order.shipping_amount)
  const codFee   = isCOD ? 50 : 0
  const gst      = Math.round(subtotal * 0.18)

  return createPortal(
    <div
      className="fixed inset-0 z-[200] bg-black/50 flex items-start justify-center px-4"
      style={{ paddingTop: 24, paddingBottom: 24 }}
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-2xl rounded shadow-2xl flex flex-col"
        style={{ height: 'calc(100vh - 48px)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b flex-none bg-white rounded-t">
          <div>
            <p className="text-xs text-gray-400 font-semibold">ORDER</p>
            <h2 className="text-base font-black tracking-tight">#{order.id}</h2>
          </div>
          <div className="flex items-center gap-3">
            <StatusSelect
              orderId={order.id}
              current={order.status}
              onChanged={(id, s) => { onStatusChanged(id, s); order.status = s }}
            />
            <button onClick={onClose} className="text-gray-400 hover:text-black transition-colors ml-1">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Items */}
          <div>
            <p className="text-[10px] font-black tracking-widest text-gray-400 mb-3">ITEMS ORDERED</p>
            <div className="divide-y divide-gray-50 border border-gray-100 rounded">
              {order.items?.map((item) => (
                <div key={item.id} className="flex items-center gap-3 p-3">
                  {item.product_image
                    ? <img src={getMediaUrl(item.product_image)} alt={item.product_name} className="w-14 h-16 object-cover bg-gray-50 rounded flex-shrink-0" />
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

          {/* Delivery + Payment */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
      </div>
    </div>,
    document.body
  )
}

export default function AdminOrders() {
  const [orders, setOrders]           = useState([])
  const [total, setTotal]             = useState(0)
  const [page, setPage]               = useState(1)
  const [pages, setPages]             = useState(1)
  const [statusFilter, setStatusFilter] = useState('')
  const [loading, setLoading]         = useState(true)
  const [selectedOrder, setSelectedOrder] = useState(null)

  const load = useCallback(() => {
    setLoading(true)
    api.get('/admin/orders', { params: { page, per_page: 20, status: statusFilter } })
      .then(({ data }) => {
        setOrders(data.orders)
        setTotal(data.total)
        setPages(data.pages)
      })
      .finally(() => setLoading(false))
  }, [page, statusFilter])

  useEffect(() => { load() }, [load])

  const handleStatusChanged = (id, newStatus) => {
    setOrders((prev) => prev.map((o) => o.id === id ? { ...o, status: newStatus } : o))
  }

  return (
    <div className="space-y-4 w-full">
      <div>
        <h1 className="text-xl font-black tracking-tight">Orders</h1>
        <p className="text-xs text-gray-400 mt-0.5">{total} total orders</p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {STATUSES.map((s) => (
          <button
            key={s || 'all'}
            onClick={() => { setStatusFilter(s); setPage(1) }}
            className={`px-3 py-1.5 text-[11px] font-black tracking-wider rounded transition-colors
              ${statusFilter === s
                ? 'bg-black text-white'
                : 'bg-white border border-gray-200 text-gray-500 hover:border-black'
              }`}
          >
            {s ? s.toUpperCase() : 'ALL'}
          </button>
        ))}
      </div>

      <div className="bg-white border border-gray-200 rounded overflow-hidden w-full">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['Order', 'Customer', 'Items', 'Amount', 'Status', 'Date'].map((h) => (
                  <th key={h} className="text-left text-[11px] font-black tracking-widest text-gray-400 px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                [...Array(8)].map((_, i) => (
                  <tr key={i}>
                    {[...Array(6)].map((_, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-4 bg-gray-100 rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-gray-400 text-sm">No orders found</td>
                </tr>
              ) : orders.map((order) => (
                <tr
                  key={order.id}
                  className="hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => setSelectedOrder(order)}
                >
                  <td className="px-4 py-3 font-black text-xs">#{order.id}</td>
                  <td className="px-4 py-3">
                    <p className="text-xs font-semibold">{order.delivery?.name || order.user?.name || '—'}</p>
                    <p className="text-[11px] text-gray-400">{order.delivery?.email || order.user?.email || ''}</p>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-600">{order.items?.length || 0} item(s)</td>
                  <td className="px-4 py-3 font-bold text-sm">₹{Number(order.total_amount).toLocaleString('en-IN')}</td>
                  <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                    <StatusSelect orderId={order.id} current={order.status} onChanged={handleStatusChanged} />
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-400">
                    {new Date(order.created_at).toLocaleDateString('en-IN')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {pages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
            <p className="text-xs text-gray-400">Page {page} of {pages}</p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1.5 border border-gray-200 text-gray-500 disabled:opacity-40 hover:border-black transition-colors rounded"
              >
                <ChevronLeft size={14} />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(pages, p + 1))}
                disabled={page === pages}
                className="p-1.5 border border-gray-200 text-gray-500 disabled:opacity-40 hover:border-black transition-colors rounded"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onStatusChanged={handleStatusChanged}
        />
      )}
    </div>
  )
}
