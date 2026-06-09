import { useEffect, useState, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { Plus, Search, Edit2, Trash2, X, ChevronLeft, ChevronRight, AlertCircle, Package } from 'lucide-react'
import api, { getMediaUrl } from '../../services/api'
import MultiImageUpload from '../components/MultiImageUpload'

function ProductViewModal({ product, onClose, onEdit }) {
  const [activeImg, setActiveImg] = useState(0)
  const images = (product.images?.length ? product.images : (product.image_url ? [product.image_url] : [])).map(getMediaUrl)
  const discount = product.original_price
    ? Math.round((1 - product.price / product.original_price) * 100)
    : null

  const FLAG_MAP = [
    { key: 'is_new', label: 'NEW', cls: 'bg-blue-100 text-blue-600' },
    { key: 'is_bestseller', label: 'BESTSELLER', cls: 'bg-green-100 text-green-600' },
    { key: 'is_featured', label: 'FEATURED', cls: 'bg-purple-100 text-purple-600' },
    { key: 'is_on_sale', label: 'ON SALE', cls: 'bg-orange-100 text-orange-600' },
  ]

  return createPortal(
    <div className="fixed inset-0 z-[200] flex items-start justify-center bg-black/40 overflow-y-auto py-8 px-4" onClick={onClose}>
      <div className="bg-white w-full max-w-2xl rounded shadow-2xl my-auto" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="font-black text-base tracking-tight">PRODUCT DETAILS</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={onEdit}
              className="flex items-center gap-1.5 bg-black text-white text-[11px] font-black tracking-widest px-3 py-1.5 hover:bg-orange-500 transition-colors"
            >
              <Edit2 size={12} /> EDIT
            </button>
            <button onClick={onClose} className="text-gray-400 hover:text-black ml-1"><X size={20} /></button>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Images */}
            <div>
              {images.length > 0 ? (
                <>
                  <div className="aspect-[3/4] bg-gray-50 overflow-hidden rounded mb-2">
                    <img src={images[activeImg]} alt={product.name} className="w-full h-full object-cover" />
                  </div>
                  {images.length > 1 && (
                    <div className="flex gap-1.5 flex-wrap">
                      {images.map((img, i) => (
                        <button
                          key={i}
                          onClick={() => setActiveImg(i)}
                          className={`w-12 h-14 border-2 overflow-hidden rounded transition-colors ${i === activeImg ? 'border-black' : 'border-transparent hover:border-gray-300'}`}
                        >
                          <img src={img} alt="" className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div className="aspect-[3/4] bg-gray-100 rounded flex items-center justify-center text-gray-300">
                  <Package size={48} />
                </div>
              )}
            </div>

            {/* Info */}
            <div className="space-y-4">
              {product.club && (
                <p className="text-[10px] font-black tracking-widest text-orange-500 uppercase">{product.club}</p>
              )}
              <h3 className="text-lg font-black leading-tight">{product.name}</h3>

              {/* Flags */}
              <div className="flex flex-wrap gap-1">
                {FLAG_MAP.filter((f) => product[f.key]).map((f) => (
                  <span key={f.key} className={`text-[9px] font-black px-2 py-0.5 rounded ${f.cls}`}>{f.label}</span>
                ))}
              </div>

              {/* Price */}
              <div>
                <p className="text-[10px] font-black text-gray-400 tracking-widest mb-1">PRICE</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black">₹{Number(product.price).toLocaleString('en-IN')}</span>
                  {product.original_price && (
                    <>
                      <span className="text-sm text-gray-400 line-through">₹{Number(product.original_price).toLocaleString('en-IN')}</span>
                      <span className="text-[10px] font-black bg-orange-500 text-white px-1.5 py-0.5 rounded">{discount}% OFF</span>
                    </>
                  )}
                </div>
              </div>

              {/* Meta */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'CATEGORY', value: product.category?.replace(/-/g, ' ') },
                  { label: 'GENDER', value: product.gender },
                  { label: 'RATING', value: product.rating ? `${product.rating} ★ (${product.reviews_count})` : '—' },
                  { label: 'TOTAL STOCK', value: product.stock, red: product.stock < 10 },
                ].map(({ label, value, red }) => (
                  <div key={label}>
                    <p className="text-[9px] font-black text-gray-400 tracking-widest">{label}</p>
                    <p className={`text-sm font-semibold capitalize ${red ? 'text-red-500' : ''}`}>{value ?? '—'}</p>
                  </div>
                ))}
              </div>

              {/* Size stock */}
              {product.size_stock && Object.keys(product.size_stock).length > 0 && (
                <div>
                  <p className="text-[9px] font-black text-gray-400 tracking-widest mb-1.5">STOCK BY SIZE</p>
                  <div className="flex flex-wrap gap-1.5">
                    {Object.entries(product.size_stock).map(([sz, qty]) => (
                      <div key={sz} className={`flex flex-col items-center px-2.5 py-1.5 rounded border text-xs ${qty === 0 ? 'border-red-200 bg-red-50 text-red-400' : qty <= 5 ? 'border-orange-200 bg-orange-50 text-orange-600' : 'border-gray-200 bg-gray-50 text-gray-700'}`}>
                        <span className="font-black">{sz}</span>
                        <span className="font-semibold">{qty}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Description */}
              {product.description && (
                <div>
                  <p className="text-[9px] font-black text-gray-400 tracking-widest mb-1">DESCRIPTION</p>
                  <p className="text-xs text-gray-600 leading-relaxed line-clamp-4">{product.description}</p>
                </div>
              )}

              {product.composition && (
                <div>
                  <p className="text-[9px] font-black text-gray-400 tracking-widest mb-1">COMPOSITION</p>
                  <p className="text-xs text-gray-600">{product.composition}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  )
}

const CATEGORIES = ['club-jersey', 'national-team', 'jacket', 'training', 'kids', 'accessories']
const GENDERS = ['men', 'women', 'kids', 'unisex']
const DEFAULT_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL']

const EMPTY_FORM = {
  name: '', original_price: '', discount: '', category: 'club-jersey', club: '',
  gender: 'men', description: '', images: [], composition: '',
  is_new: false, is_bestseller: false, is_featured: false, is_on_sale: false,
  sizes: ['S', 'M', 'L', 'XL', 'XXL'],
  size_stock: { S: 0, M: 0, L: 0, XL: 0, XXL: 0 },
}

function ProductModal({ product, onClose, onSaved }) {
  const [form, setForm] = useState(() => {
    if (!product) return EMPTY_FORM
    const imgs = product.images?.length ? product.images : (product.image_url ? [product.image_url] : [])
    const ss = product.size_stock && Object.keys(product.size_stock).length
      ? product.size_stock
      : Object.fromEntries((product.sizes || DEFAULT_SIZES).map((s) => [s, 0]))
    const origPrice = product.original_price || product.price
    const discountedPrice = product.price
    const discPct = origPrice && discountedPrice < origPrice
      ? Math.round((1 - discountedPrice / origPrice) * 100)
      : 0
    return {
      ...product,
      original_price: String(origPrice || ''),
      discount: String(discPct || ''),
      images: imgs,
      size_stock: ss,
    }
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  const toggleSize = (size) => {
    const next = form.sizes.includes(size)
      ? form.sizes.filter((s) => s !== size)
      : [...form.sizes, size]
    const nextStock = { ...form.size_stock }
    if (!next.includes(size)) delete nextStock[size]
    else if (!(size in nextStock)) nextStock[size] = 0
    setForm((f) => ({ ...f, sizes: next, size_stock: nextStock }))
  }

  const setSizeStock = (size, val) => {
    set('size_stock', { ...form.size_stock, [size]: parseInt(val) || 0 })
  }

  const totalStock = Object.values(form.size_stock).reduce((a, b) => a + (parseInt(b) || 0), 0)

  const origPrice = parseFloat(form.original_price) || 0
  const discountPct = parseFloat(form.discount) || 0
  const finalPrice = origPrice > 0
    ? Math.round(origPrice * (1 - discountPct / 100))
    : 0

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!origPrice || origPrice <= 0) { setError('Original price is required'); return }
    setError(null)
    setSaving(true)
    try {
      const payload = {
        ...form,
        price: finalPrice,
        original_price: discountPct > 0 ? origPrice : null,
        image_url: form.images[0] || '',
        size_stock: form.size_stock,
        stock: totalStock,
      }
      if (product) {
        await api.put(`/admin/products/${product.id}`, payload)
      } else {
        await api.post('/admin/products', payload)
      }
      onSaved()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save product')
    } finally {
      setSaving(false)
    }
  }

  return createPortal(
    <div className="fixed inset-0 z-[200] flex items-start justify-center bg-black/40 overflow-y-auto py-8 px-4">
      <div className="bg-white w-full max-w-2xl rounded shadow-2xl my-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="font-black text-base">{product ? 'EDIT PRODUCT' : 'ADD PRODUCT'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-black"><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="flex gap-2 items-center bg-red-50 border border-red-200 text-red-600 text-xs px-3 py-2 rounded">
              <AlertCircle size={14} />
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-xs font-bold text-gray-500 mb-1">PRODUCT NAME *</label>
              <input
                value={form.name}
                onChange={(e) => set('name', e.target.value)}
                required
                className="w-full border border-gray-200 px-3 py-2 text-sm outline-none focus:border-black"
                placeholder="e.g. Real Madrid Home Jersey 2024"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">ORIGINAL PRICE / MRP (₹) *</label>
              <input
                type="number"
                min="0"
                step="1"
                value={form.original_price}
                onChange={(e) => set('original_price', e.target.value)}
                required
                className="w-full border border-gray-200 px-3 py-2 text-sm outline-none focus:border-black"
                placeholder="e.g. 1499"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">DISCOUNT (%)</label>
              <input
                type="number"
                min="0"
                max="99"
                step="1"
                value={form.discount}
                onChange={(e) => set('discount', e.target.value)}
                className="w-full border border-gray-200 px-3 py-2 text-sm outline-none focus:border-black"
                placeholder="0"
              />
            </div>

            {origPrice > 0 && (
              <div className="col-span-2">
                <div className="flex items-center gap-3 bg-orange-50 border border-orange-200 rounded px-4 py-2.5">
                  <div>
                    <p className="text-[10px] font-black text-gray-400 tracking-widest">SELLING PRICE</p>
                    <p className="text-xl font-black text-black">₹{finalPrice.toLocaleString('en-IN')}</p>
                  </div>
                  {discountPct > 0 && (
                    <>
                      <div className="h-8 w-px bg-orange-200" />
                      <div>
                        <p className="text-[10px] font-black text-gray-400 tracking-widest">MRP</p>
                        <p className="text-sm text-gray-400 line-through">₹{origPrice.toLocaleString('en-IN')}</p>
                      </div>
                      <div className="h-8 w-px bg-orange-200" />
                      <div className="bg-orange-500 text-white text-xs font-black px-2 py-1 rounded">
                        {discountPct}% OFF
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-gray-400 tracking-widest">YOU SAVE</p>
                        <p className="text-sm font-black text-green-600">₹{(origPrice - finalPrice).toLocaleString('en-IN')}</p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">CATEGORY *</label>
              <select
                value={form.category}
                onChange={(e) => set('category', e.target.value)}
                className="w-full border border-gray-200 px-3 py-2 text-sm outline-none focus:border-black"
              >
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">GENDER</label>
              <select
                value={form.gender}
                onChange={(e) => set('gender', e.target.value)}
                className="w-full border border-gray-200 px-3 py-2 text-sm outline-none focus:border-black"
              >
                {GENDERS.map((g) => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>

            <div className="col-span-2">
              <label className="block text-xs font-bold text-gray-500 mb-1">CLUB / TEAM</label>
              <input
                value={form.club}
                onChange={(e) => set('club', e.target.value)}
                className="w-full border border-gray-200 px-3 py-2 text-sm outline-none focus:border-black"
                placeholder="e.g. Real Madrid"
              />
            </div>

            <div className="col-span-2">
              <MultiImageUpload
                value={form.images}
                onChange={(urls) => set('images', urls)}
                label="PRODUCT IMAGES"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-xs font-bold text-gray-500 mb-1">DESCRIPTION</label>
              <textarea
                rows={3}
                value={form.description}
                onChange={(e) => set('description', e.target.value)}
                className="w-full border border-gray-200 px-3 py-2 text-sm outline-none focus:border-black resize-none"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-xs font-bold text-gray-500 mb-2">SIZES & STOCK</label>
              <div className="flex gap-2 flex-wrap mb-3">
                {DEFAULT_SIZES.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => toggleSize(s)}
                    className={`px-3 py-1 text-xs font-bold border transition-colors ${
                      form.sizes.includes(s) ? 'bg-black text-white border-black' : 'border-gray-300 text-gray-500 hover:border-black'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
              {form.sizes.length > 0 && (
                <div className="bg-gray-50 border border-gray-200 rounded p-3">
                  <div className="grid grid-cols-3 gap-2">
                    {form.sizes.map((s) => (
                      <div key={s} className="flex items-center gap-2">
                        <span className="text-xs font-black text-gray-600 w-8 flex-shrink-0">{s}</span>
                        <input
                          type="number"
                          min="0"
                          value={form.size_stock[s] ?? ''}
                          onChange={(e) => setSizeStock(s, e.target.value)}
                          placeholder="0"
                          className="flex-1 border border-gray-200 px-2 py-1.5 text-sm outline-none focus:border-black rounded min-w-0"
                        />
                      </div>
                    ))}
                  </div>
                  <p className="text-[10px] text-gray-400 mt-2">
                    Total stock: <span className="font-black text-black">{totalStock}</span>
                  </p>
                </div>
              )}
            </div>

            <div className="col-span-2">
              <label className="block text-xs font-bold text-gray-500 mb-2">FLAGS</label>
              <div className="flex flex-wrap gap-4">
                {[
                  { key: 'is_new', label: 'New Arrival' },
                  { key: 'is_bestseller', label: 'Bestseller' },
                  { key: 'is_featured', label: 'Featured' },
                  { key: 'is_on_sale', label: 'On Sale' },
                ].map(({ key, label }) => (
                  <label key={key} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form[key]}
                      onChange={(e) => set(key, e.target.checked)}
                      className="accent-orange-500"
                    />
                    <span className="text-xs font-semibold text-gray-600">{label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-gray-300 py-2.5 text-xs font-black tracking-widest hover:border-black transition-colors"
            >
              CANCEL
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-black text-white py-2.5 text-xs font-black tracking-widest hover:bg-orange-500 transition-colors disabled:opacity-60"
            >
              {saving ? 'SAVING...' : product ? 'UPDATE' : 'CREATE'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  )
}

export default function AdminProducts() {
  const [products, setProducts] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null)   // null | 'add' | product object (edit)
  const [viewing, setViewing] = useState(null) // product object | null (detail view)
  const [deleteId, setDeleteId] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const load = useCallback(() => {
    setLoading(true)
    api.get('/admin/products', { params: { page, per_page: 10, search } })
      .then(({ data }) => {
        setProducts(data.products)
        setTotal(data.total)
        setPages(data.pages)
      })
      .finally(() => setLoading(false))
  }, [page, search])

  useEffect(() => { load() }, [load])

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await api.delete(`/admin/products/${deleteId}`)
      setDeleteId(null)
      load()
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black tracking-tight">Products</h1>
          <p className="text-xs text-gray-400 mt-0.5">{total} total products</p>
        </div>
        <button
          onClick={() => setModal('add')}
          className="flex items-center gap-2 bg-black text-white text-xs font-black tracking-widest px-4 py-2.5 hover:bg-orange-500 transition-colors"
        >
          <Plus size={14} /> ADD PRODUCT
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1) }}
          placeholder="Search products..."
          className="w-full border border-gray-200 pl-9 pr-4 py-2 text-sm outline-none focus:border-black"
        />
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['Product', 'Category', 'Price', 'Stock', 'Flags', 'Actions'].map((h) => (
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
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-gray-400 text-sm">No products found</td>
                </tr>
              ) : products.map((p) => (
                <tr key={p.id} onClick={() => setViewing(p)} className="hover:bg-gray-50 transition-colors cursor-pointer">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {p.image_url && (
                        <img src={getMediaUrl(p.image_url)} alt={p.name} className="w-10 h-10 object-cover rounded bg-gray-100 flex-shrink-0" />
                      )}
                      <div>
                        <p className="font-semibold text-sm leading-tight line-clamp-1">{p.name}</p>
                        <p className="text-[11px] text-gray-400">{p.club || '—'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-[10px] font-black px-2 py-0.5 bg-gray-100 text-gray-600 rounded uppercase">{p.category}</span>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-bold text-sm">₹{p.price.toLocaleString('en-IN')}</p>
                    {p.original_price && (
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] text-gray-400 line-through">₹{p.original_price.toLocaleString('en-IN')}</span>
                        <span className="text-[9px] font-black text-orange-500">
                          {Math.round((1 - p.price / p.original_price) * 100)}% OFF
                        </span>
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-bold ${p.stock < 10 ? 'text-red-500' : 'text-gray-700'}`}>{p.stock}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1 flex-wrap">
                      {p.is_new && <span className="text-[9px] font-black px-1.5 py-0.5 bg-blue-100 text-blue-600 rounded">NEW</span>}
                      {p.is_bestseller && <span className="text-[9px] font-black px-1.5 py-0.5 bg-green-100 text-green-600 rounded">BEST</span>}
                      {p.is_featured && <span className="text-[9px] font-black px-1.5 py-0.5 bg-purple-100 text-purple-600 rounded">FEAT</span>}
                      {p.is_on_sale && <span className="text-[9px] font-black px-1.5 py-0.5 bg-orange-100 text-orange-600 rounded">SALE</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setModal(p)}
                        className="p-1.5 text-gray-400 hover:text-black hover:bg-gray-100 rounded transition-colors"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => setDeleteId(p.id)}
                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
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

      {/* Product detail view */}
      {viewing && (
        <ProductViewModal
          product={viewing}
          onClose={() => setViewing(null)}
          onEdit={() => { setModal(viewing); setViewing(null) }}
        />
      )}

      {/* Add / Edit modal */}
      {modal !== null && (
        <ProductModal
          product={modal === 'add' ? null : modal}
          onClose={() => setModal(null)}
          onSaved={() => { setModal(null); load() }}
        />
      )}

      {/* Delete confirm */}
      {deleteId && createPortal(
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded shadow-2xl p-6 max-w-sm w-full">
            <h3 className="font-black mb-2">Delete Product?</h3>
            <p className="text-sm text-gray-500 mb-5">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="flex-1 border border-gray-300 py-2 text-xs font-black hover:border-black transition-colors"
              >
                CANCEL
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 bg-red-500 text-white py-2 text-xs font-black hover:bg-red-600 transition-colors disabled:opacity-60"
              >
                {deleting ? 'DELETING...' : 'DELETE'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}
