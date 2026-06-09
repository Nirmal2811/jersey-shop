import { useEffect, useState, useMemo, useRef } from 'react'
import { createPortal } from 'react-dom'
import { Link, useNavigate } from 'react-router-dom'
import {
  TrendingUp, Package, ShoppingBag, Users, AlertTriangle,
  ArrowRight, ArrowUpRight, Search, X, PackageX,
  ChevronLeft, ChevronRight, Plus, Bell, Image, Zap, Clock,
} from 'lucide-react'
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  PieChart, Pie, Cell,
} from 'recharts'
import api from '../../services/api'

const STATUS_COLORS = {
  pending:    'bg-yellow-100 text-yellow-700',
  paid:       'bg-blue-100 text-blue-700',
  processing: 'bg-orange-100 text-orange-700',
  shipped:    'bg-purple-100 text-purple-700',
  delivered:  'bg-green-100 text-green-700',
  cancelled:  'bg-red-100 text-red-700',
}

/* ── Out-of-stock toast ── */
function OutOfStockToast({ products, onView, onClose }) {
  const [visible, setVisible] = useState(false)
  const timerRef = useRef(null)

  useEffect(() => {
    const show = setTimeout(() => setVisible(true), 50)
    timerRef.current = setTimeout(() => handleClose(), 7000)
    return () => { clearTimeout(show); clearTimeout(timerRef.current) }
  }, [])

  const handleClose = () => { setVisible(false); setTimeout(onClose, 350) }
  const handleView  = () => { handleClose(); onView() }

  return (
    <div className={`fixed bottom-6 right-6 z-[60] w-80 transition-all duration-350 ease-out
      ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
    >
      <div className="bg-gray-900 text-white rounded-xl shadow-2xl overflow-hidden">
        <div className="h-0.5 bg-red-500/30">
          <div className="h-full bg-red-500" style={{ animation: 'shrink 7s linear forwards' }} />
        </div>
        <div className="p-4">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 bg-red-500/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
              <PackageX size={17} className="text-red-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-black tracking-wide text-white">OUT OF STOCK ALERT</p>
              <p className="text-[11px] text-gray-400 mt-0.5 leading-relaxed">
                <span className="text-red-400 font-black">{products.length} product{products.length > 1 ? 's' : ''}</span>
                {' '}running out of stock. Restock to avoid lost sales.
              </p>
              <div className="mt-2 space-y-0.5">
                {products.slice(0, 2).map((p) => (
                  <p key={p.id} className="text-[10px] text-gray-500 truncate">· {p.name}</p>
                ))}
                {products.length > 2 && (
                  <p className="text-[10px] text-gray-600">+{products.length - 2} more</p>
                )}
              </div>
            </div>
            <button onClick={handleClose} className="text-gray-600 hover:text-gray-300 transition-colors flex-shrink-0">
              <X size={14} />
            </button>
          </div>
          <div className="flex gap-2 mt-3">
            <button onClick={handleView} className="flex-1 bg-red-500 hover:bg-red-600 text-white text-[10px] font-black tracking-widest py-2 rounded-lg transition-colors">
              VIEW STOCK
            </button>
            <button onClick={handleClose} className="px-3 text-[10px] font-bold text-gray-500 hover:text-gray-300 transition-colors">
              Dismiss
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function getSeverity(alerts) {
  if (alerts.some((a) => a.qty === 0)) return 'out'
  if (alerts.some((a) => a.qty <= 2))  return 'critical'
  return 'low'
}

const SEV_STYLES = {
  out:      { dot: 'bg-red-500',    badge: 'bg-red-100 text-red-600',      pill: 'bg-red-100 text-red-600' },
  critical: { dot: 'bg-orange-500', badge: 'bg-orange-100 text-orange-600', pill: 'bg-orange-100 text-orange-600' },
  low:      { dot: 'bg-yellow-400', badge: 'bg-yellow-100 text-yellow-700', pill: 'bg-yellow-100 text-yellow-700' },
}

const PAGE_SIZE = 10

/* ── Low Stock Modal ── */
function LowStockModal({ products, onClose }) {
  const [tab, setTab]       = useState('all')
  const [search, setSearch] = useState('')
  const [page, setPage]     = useState(1)

  useEffect(() => {
    const el = document.getElementById('admin-main')
    if (!el) return
    const prev = el.style.overflow
    el.style.overflow = 'hidden'
    return () => { el.style.overflow = prev }
  }, [])

  const counts = useMemo(() => ({
    out:      products.filter((p) => getSeverity(p.alerts) === 'out').length,
    critical: products.filter((p) => getSeverity(p.alerts) === 'critical').length,
    low:      products.filter((p) => getSeverity(p.alerts) === 'low').length,
  }), [products])

  const filtered = useMemo(() => {
    let list = tab === 'all' ? products : products.filter((p) => getSeverity(p.alerts) === tab)
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter((p) => p.name.toLowerCase().includes(q) || p.club?.toLowerCase().includes(q))
    }
    return list
  }, [products, tab, search])

  useEffect(() => { setPage(1) }, [tab, search])

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const TABS = [
    { key: 'all',      label: 'All',      count: products.length, active: 'border-gray-900 text-gray-900' },
    { key: 'out',      label: 'Out',      count: counts.out,      active: 'border-red-500 text-red-600' },
    { key: 'critical', label: 'Critical', count: counts.critical, active: 'border-orange-500 text-orange-600' },
    { key: 'low',      label: 'Low',      count: counts.low,      active: 'border-yellow-500 text-yellow-700' },
  ]

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 px-4" onClick={onClose}>
      <div
        className="bg-white rounded-lg shadow-2xl w-full max-w-5xl flex flex-col overflow-hidden"
        style={{ maxHeight: '85vh' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100">
          <AlertTriangle size={16} className="text-orange-500 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <h2 className="text-sm font-black tracking-wide">INVENTORY ALERTS</h2>
            <div className="flex items-center gap-1.5 mt-1 flex-wrap">
              {counts.out > 0 && (
                <span className="flex items-center gap-1 bg-red-100 text-red-600 text-[10px] font-black px-2 py-0.5 rounded-full">
                  <span className="w-1.5 h-1.5 bg-red-500 rounded-full inline-block" />{counts.out} Out of Stock
                </span>
              )}
              {counts.critical > 0 && (
                <span className="flex items-center gap-1 bg-orange-100 text-orange-600 text-[10px] font-black px-2 py-0.5 rounded-full">
                  <span className="w-1.5 h-1.5 bg-orange-500 rounded-full inline-block" />{counts.critical} Critical
                </span>
              )}
              {counts.low > 0 && (
                <span className="flex items-center gap-1 bg-yellow-100 text-yellow-700 text-[10px] font-black px-2 py-0.5 rounded-full">
                  <span className="w-1.5 h-1.5 bg-yellow-400 rounded-full inline-block" />{counts.low} Low
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            <Link to="/admin/products" onClick={onClose} className="flex items-center gap-1 text-[11px] font-bold text-gray-400 hover:text-black transition-colors">
              Manage <ArrowRight size={11} />
            </Link>
            <button onClick={onClose} className="text-gray-300 hover:text-gray-700 transition-colors">
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="flex items-center border-b border-gray-100 px-5 pt-3 pb-0 gap-4">
          <div className="flex flex-1 gap-0">
            {TABS.map((t) => (t.count > 0 || t.key === 'all') && (
              <button key={t.key} onClick={() => setTab(t.key)}
                className={`pb-2.5 mr-5 text-[11px] font-black tracking-widest border-b-2 transition-colors ${
                  tab === t.key ? t.active : 'border-transparent text-gray-400 hover:text-gray-600'
                }`}
              >
                {t.label}
                <span className={`ml-1.5 text-[9px] px-1.5 py-0.5 rounded-full font-black ${
                  tab === t.key ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-500'
                }`}>{t.count}</span>
              </button>
            ))}
          </div>
          <div className="relative mb-2.5">
            <Search size={11} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-300" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search..."
              className="pl-7 pr-3 py-1.5 text-xs border border-gray-200 rounded-md outline-none focus:border-gray-400 w-32 bg-gray-50" />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filtered.length === 0 ? (
            <p className="text-center text-xs text-gray-400 py-12">No products match</p>
          ) : (
            <div className="divide-y divide-gray-50">
              {paginated.map((p) => {
                const sev = getSeverity(p.alerts)
                const { dot } = SEV_STYLES[sev]
                return (
                  <div key={p.id} className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 transition-colors">
                    <span className={`w-2 h-2 rounded-full flex-shrink-0 ${dot}`} />
                    {p.image_url
                      ? <img src={p.image_url} alt="" className="w-9 h-9 object-cover rounded bg-gray-100 flex-shrink-0" />
                      : <div className="w-9 h-9 bg-gray-100 rounded flex-shrink-0" />}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold leading-tight truncate">{p.name}</p>
                      {p.club && <p className="text-[10px] text-gray-400 truncate">{p.club}</p>}
                    </div>
                    <div className="flex gap-1 flex-wrap justify-end">
                      {p.alerts.map((a, i) => (
                        <span key={i} className={`text-[9px] font-black px-1.5 py-0.5 rounded ${
                          a.qty === 0 ? 'bg-red-100 text-red-600' : a.qty <= 2 ? 'bg-orange-100 text-orange-600' : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {a.size ? `${a.size} ` : ''}{a.qty === 0 ? 'OUT' : a.qty}
                        </span>
                      ))}
                    </div>
                    <span className={`text-xs font-black w-7 text-right flex-shrink-0 ${
                      p.stock === 0 ? 'text-red-500' : p.stock <= 2 ? 'text-orange-500' : 'text-yellow-600'
                    }`}>{p.stock}</span>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <div className="px-5 py-2.5 border-t border-gray-100 bg-gray-50 flex-shrink-0 flex items-center justify-between">
          <p className="text-[10px] text-gray-400">
            Showing <span className="font-black text-gray-600">{paginated.length}</span> of{' '}
            <span className="font-black text-gray-600">{filtered.length}</span> affected products
          </p>
          {totalPages > 1 && (
            <div className="flex items-center gap-2">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                className="p-1 border border-gray-200 text-gray-500 disabled:opacity-30 hover:border-black transition-colors rounded">
                <ChevronLeft size={13} />
              </button>
              <span className="text-[10px] font-black text-gray-500">{page} / {totalPages}</span>
              <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="p-1 border border-gray-200 text-gray-500 disabled:opacity-30 hover:border-black transition-colors rounded">
                <ChevronRight size={13} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  )
}

/* ── Stat Card ── */
function StatCard({ label, value, sub, icon: Icon, accent, onClick, alert, to }) {
  const navigate = useNavigate()
  const handleClick = onClick || (to ? () => navigate(to) : undefined)
  const isClickable = Boolean(handleClick)

  return (
    <div
      onClick={handleClick}
      className={`bg-white rounded border border-gray-200 p-5 flex items-start gap-4 transition-all group relative
        ${isClickable ? 'cursor-pointer hover:shadow-md hover:border-gray-300 hover:-translate-y-0.5' : ''}`}
    >
      <div className={`w-10 h-10 flex items-center justify-center rounded relative flex-shrink-0 ${accent}`}>
        <Icon size={18} className="text-white" />
        {alert && (
          <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 rounded-full border-2 border-white animate-pulse" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-2xl font-black">{value}</p>
        <p className="text-xs font-semibold text-gray-500 mt-0.5">{label}</p>
        {sub && (
          <p className={`text-[11px] mt-1 font-semibold ${alert ? 'text-orange-500' : 'text-gray-400'}`}>{sub}</p>
        )}
      </div>
      {isClickable && (
        <ArrowUpRight size={14} className="text-gray-300 group-hover:text-gray-500 transition-colors flex-shrink-0 mt-0.5" />
      )}
    </div>
  )
}

/* ── Quick Actions ── */
function QuickActions() {
  const actions = [
    { label: 'Add Product',    icon: Plus,       to: '/admin/products',      color: 'bg-orange-500', desc: 'Create new listing' },
    { label: 'Manage Orders',  icon: ShoppingBag,to: '/admin/orders',        color: 'bg-blue-500',   desc: 'View & update orders' },
    { label: 'Edit Banners',   icon: Image,      to: '/admin/home-banners',  color: 'bg-purple-500', desc: 'Update homepage banners' },
    { label: 'Announcements',  icon: Bell,       to: '/admin/announcements', color: 'bg-green-500',  desc: 'Manage announcement bar' },
  ]
  return (
    <div className="bg-white border border-gray-200 rounded p-5">
      <div className="flex items-center gap-2 mb-4">
        <Zap size={13} className="text-orange-500" />
        <h2 className="text-sm font-black tracking-wide">QUICK ACTIONS</h2>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {actions.map(({ label, icon: Icon, to, color, desc }) => (
          <Link key={to} to={to}
            className="flex items-center gap-3 p-3.5 border border-gray-100 rounded-lg hover:border-gray-300 hover:shadow-sm transition-all group bg-gray-50 hover:bg-white"
          >
            <div className={`w-8 h-8 rounded-lg ${color} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
              <Icon size={14} className="text-white" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-black text-gray-800 leading-tight">{label}</p>
              <p className="text-[10px] text-gray-400 leading-tight mt-0.5 truncate">{desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

/* ── Dashboard ── */
export default function AdminDashboard() {
  const [stats, setStats]           = useState(null)
  const [loading, setLoading]       = useState(true)
  const [stockModal, setStockModal] = useState(false)
  const [toast, setToast]           = useState(null)

  useEffect(() => {
    api.get('/admin/stats')
      .then(({ data }) => {
        setStats(data)
        if (!sessionStorage.getItem('stockToastShown')) {
          const outOfStock = (data.low_stock_products || []).filter((p) =>
            p.alerts.some((a) => a.qty === 0)
          )
          if (outOfStock.length > 0) {
            setToast(outOfStock)
            sessionStorage.setItem('stockToastShown', '1')
          }
        }
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-24 bg-gray-100 rounded animate-pulse" />)}
        </div>
        <div className="h-20 bg-gray-100 rounded animate-pulse" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 h-72 bg-gray-100 rounded animate-pulse" />
          <div className="h-72 bg-gray-100 rounded animate-pulse" />
        </div>
        <div className="h-64 bg-gray-100 rounded animate-pulse" />
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <p className="text-gray-500 font-semibold">Failed to load dashboard data.</p>
        <button
          onClick={() => { setLoading(true); api.get('/admin/stats').then(({ data }) => setStats(data)).finally(() => setLoading(false)) }}
          className="text-xs font-black tracking-widest bg-black text-white px-4 py-2 hover:bg-orange-500 transition-colors"
        >
          RETRY
        </button>
      </div>
    )
  }

  const hasLowStock = stats.low_stock_products?.length > 0

  const processingCount = (stats.status_chart || []).find(
    (s) => s.status.toLowerCase() === 'processing'
  )?.count || 0

  const shippedCount = (stats.status_chart || []).find(
    (s) => s.status.toLowerCase() === 'shipped'
  )?.count || 0

  const pendingShipment = processingCount + shippedCount

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black tracking-tight">Dashboard</h1>
          <p className="text-sm text-gray-400 mt-0.5">Welcome back, here's what's happening.</p>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-gray-400">
          <Clock size={11} />
          <span>{new Date().toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}</span>
        </div>
      </div>

      {/* Stat cards — all clickable */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Revenue"
          value={`₹${(stats.total_revenue / 1000).toFixed(1)}k`}
          sub={`₹${stats.recent_revenue.toLocaleString('en-IN')} this month`}
          icon={TrendingUp}
          accent="bg-green-500"
          to="/admin/orders"
        />
        <StatCard
          label="Total Orders"
          value={stats.total_orders}
          sub={pendingShipment > 0 ? `${pendingShipment} need attention` : 'All fulfilled'}
          icon={ShoppingBag}
          accent="bg-blue-500"
          to="/admin/orders"
        />
        <StatCard
          label="Products"
          value={stats.total_products}
          sub={hasLowStock ? `${stats.low_stock_count} low stock` : 'All in stock'}
          icon={Package}
          accent="bg-orange-500"
          alert={hasLowStock}
          onClick={hasLowStock ? () => setStockModal(true) : undefined}
          to={!hasLowStock ? '/admin/products' : undefined}
        />
        <StatCard
          label="Customers"
          value={stats.total_users}
          sub="View all customers"
          icon={Users}
          accent="bg-purple-500"
          to="/admin/users"
        />
      </div>

      {/* Quick actions */}
      {/* <QuickActions /> */}

      {/* Out-of-stock toast */}
      {toast && (
        <OutOfStockToast products={toast} onView={() => setStockModal(true)} onClose={() => setToast(null)} />
      )}

      {/* Low stock modal */}
      {stockModal && hasLowStock && (
        <LowStockModal products={stats.low_stock_products} onClose={() => setStockModal(false)} />
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Revenue area chart */}
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-black tracking-wide">REVENUE & ORDERS</h2>
              <p className="text-[11px] text-gray-400 mt-0.5">Last 14 days</p>
            </div>
            <Link to="/admin/orders" className="flex items-center gap-1 text-[11px] font-semibold text-gray-400 hover:text-black transition-colors">
              View All <ArrowRight size={11} />
            </Link>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={stats.daily_chart || []} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#f97316" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="ordGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#9ca3af' }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{ border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                formatter={(val, name) => [name === 'Revenue' ? `₹${val.toLocaleString('en-IN')}` : val, name]}
              />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
              <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#f97316" strokeWidth={2} fill="url(#revGrad)" dot={false} activeDot={{ r: 4 }} />
              <Area type="monotone" dataKey="orders"  name="Orders"  stroke="#6366f1" strokeWidth={2} fill="url(#ordGrad)" dot={false} activeDot={{ r: 4 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Orders by status */}
        <div className="bg-white border border-gray-200 rounded p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-black tracking-wide">ORDER STATUS</h2>
              <p className="text-[11px] text-gray-400 mt-0.5">All time breakdown</p>
            </div>
            <Link to="/admin/orders" className="flex items-center gap-1 text-[11px] font-semibold text-gray-400 hover:text-black transition-colors">
              <ArrowRight size={11} />
            </Link>
          </div>
          {(stats.status_chart || []).length === 0 ? (
            <div className="flex items-center justify-center h-[220px] text-gray-300 text-xs">No orders yet</div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={170}>
                <PieChart>
                  <Pie data={stats.status_chart} dataKey="count" nameKey="status"
                    cx="50%" cy="50%" innerRadius={48} outerRadius={72} paddingAngle={3} strokeWidth={0}
                  >
                    {(stats.status_chart || []).map((entry, i) => (
                      <Cell key={i} fill={['#f97316','#6366f1','#10b981','#3b82f6','#8b5cf6','#ef4444'][i % 6]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap gap-x-3 gap-y-1.5 mt-2">
                {(stats.status_chart || []).map((entry, i) => (
                  <div key={i} className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: ['#f97316','#6366f1','#10b981','#3b82f6','#8b5cf6','#ef4444'][i % 6] }} />
                    <span className="text-[10px] text-gray-500 capitalize">{entry.status} <span className="font-black text-gray-700">{entry.count}</span></span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Recent orders */}
      <div className="bg-white border border-gray-200 rounded overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="text-sm font-black tracking-wide">RECENT ORDERS</h2>
          <Link to="/admin/orders" className="flex items-center gap-1 text-xs font-semibold text-gray-400 hover:text-black transition-colors">
            View All <ArrowRight size={12} />
          </Link>
        </div>

        {stats.recent_orders.length === 0 ? (
          <div className="py-12 text-center text-gray-400 text-sm">No orders yet</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['Order ID', 'Customer', 'Items', 'Amount', 'Status', 'Date'].map((h) => (
                    <th key={h} className="text-left text-[11px] font-black tracking-widest text-gray-400 px-5 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {stats.recent_orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3 font-black text-xs text-orange-500">#{order.id}</td>
                    <td className="px-5 py-3 text-gray-700 text-xs font-medium">{order.delivery?.name || '—'}</td>
                    <td className="px-5 py-3 text-gray-400 text-xs">{order.items?.length || 0} item{order.items?.length !== 1 ? 's' : ''}</td>
                    <td className="px-5 py-3 font-bold text-sm">₹{order.total_amount.toLocaleString('en-IN')}</td>
                    <td className="px-5 py-3">
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded ${STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-600'}`}>
                        {order.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-gray-400 text-xs">
                      {new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
