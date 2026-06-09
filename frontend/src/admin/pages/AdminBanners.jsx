import { useEffect, useState, useCallback } from 'react'
import { Plus, Edit2, Trash2, X, GripVertical, Eye, EyeOff } from 'lucide-react'
import ImageUpload from '../components/ImageUpload'
import api from '../../services/api'

const BG_OPTIONS = [
  { label: 'Dark', value: 'from-gray-900 via-gray-800 to-black' },
  { label: 'Blue', value: 'from-blue-900 via-blue-800 to-black' },
  { label: 'Green', value: 'from-green-900 via-green-800 to-black' },
  { label: 'Red', value: 'from-red-900 via-red-800 to-black' },
  { label: 'Purple', value: 'from-purple-900 via-purple-800 to-black' },
  { label: 'Zinc', value: 'from-zinc-900 via-zinc-800 to-black' },
]

const ACCENT_OPTIONS = [
  { label: 'Orange', value: 'bg-orange-500' },
  { label: 'Blue', value: 'bg-blue-500' },
  { label: 'Green', value: 'bg-green-500' },
  { label: 'Red', value: 'bg-red-500' },
  { label: 'Purple', value: 'bg-purple-500' },
  { label: 'Yellow', value: 'bg-yellow-500' },
]

const EMPTY = {
  badge: '', title: '', subtitle: '', image_url: '',
  bg_color: 'from-gray-900 via-gray-800 to-black',
  accent_color: 'bg-orange-500',
  cta_text: 'SHOP NOW', cta_link: '/products',
  cta_secondary_text: 'EXPLORE', cta_secondary_link: '/products',
  is_active: true,
}

function SlideModal({ slide, onClose, onSaved }) {
  const [form, setForm] = useState(slide || EMPTY)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setSaving(true)
    try {
      if (slide) {
        await api.put(`/admin/banners/${slide.id}`, form)
      } else {
        await api.post('/admin/banners', form)
      }
      onSaved()
    } catch (err) {
      setError(err.response?.data?.message || 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-start justify-center bg-black/40 overflow-y-auto py-8 px-4">
      <div className="bg-white w-full max-w-2xl rounded shadow-2xl my-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="font-black text-base">{slide ? 'EDIT SLIDE' : 'ADD SLIDE'}</h2>
          <button onClick={onClose}><X size={20} className="text-gray-400 hover:text-black" /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && <p className="text-xs text-red-500 bg-red-50 border border-red-200 px-3 py-2 rounded">{error}</p>}

          {/* Live mini preview */}
          <div className={`relative rounded overflow-hidden h-24 bg-gradient-to-r ${form.bg_color} flex items-center px-5 gap-4`}>
            {form.image_url && (
              <img src={form.image_url} alt="" className="absolute right-0 top-0 h-full w-40 object-cover opacity-40" />
            )}
            <div className="relative z-10">
              {form.badge && (
                <span className={`${form.accent_color} text-white text-[9px] font-black px-2 py-0.5 block mb-1`}>{form.badge}</span>
              )}
              <p className="text-white font-black text-lg leading-tight">{form.title || 'TITLE'}</p>
              <p className="text-white/60 text-xs">{form.subtitle}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">BADGE TEXT</label>
              <input value={form.badge} onChange={(e) => set('badge', e.target.value)}
                className="w-full border border-gray-200 px-3 py-2 text-sm outline-none focus:border-black"
                placeholder="e.g. 2024/25 SEASON" />
            </div>

            <div className="flex items-end gap-2">
              <div className="flex-1">
                <label className="block text-xs font-bold text-gray-500 mb-1">STATUS</label>
                <button type="button" onClick={() => set('is_active', !form.is_active)}
                  className={`w-full flex items-center justify-center gap-2 py-2 text-xs font-bold border transition-colors
                    ${form.is_active ? 'border-green-400 bg-green-50 text-green-700' : 'border-gray-200 text-gray-400'}`}>
                  {form.is_active ? <><Eye size={12} /> ACTIVE</> : <><EyeOff size={12} /> HIDDEN</>}
                </button>
              </div>
            </div>

            <div className="col-span-2">
              <label className="block text-xs font-bold text-gray-500 mb-1">TITLE *</label>
              <input value={form.title} onChange={(e) => set('title', e.target.value)} required
                className="w-full border border-gray-200 px-3 py-2 text-sm outline-none focus:border-black"
                placeholder="e.g. MADE FOR CHAMPIONS" />
            </div>

            <div className="col-span-2">
              <label className="block text-xs font-bold text-gray-500 mb-1">SUBTITLE</label>
              <input value={form.subtitle} onChange={(e) => set('subtitle', e.target.value)}
                className="w-full border border-gray-200 px-3 py-2 text-sm outline-none focus:border-black"
                placeholder="e.g. Official Club & National Team Jerseys" />
            </div>

            <div className="col-span-2">
              <ImageUpload value={form.image_url} onChange={(url) => set('image_url', url)} label="SLIDE IMAGE" />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">BACKGROUND</label>
              <select value={form.bg_color} onChange={(e) => set('bg_color', e.target.value)}
                className="w-full border border-gray-200 px-3 py-2 text-sm outline-none focus:border-black">
                {BG_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">ACCENT COLOUR</label>
              <div className="flex gap-2">
                {ACCENT_OPTIONS.map((o) => (
                  <button key={o.value} type="button" onClick={() => set('accent_color', o.value)}
                    className={`w-6 h-6 rounded-full ${o.value} border-2 transition-all ${form.accent_color === o.value ? 'border-black scale-125' : 'border-transparent'}`}
                    title={o.label} />
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">PRIMARY BUTTON TEXT</label>
              <input value={form.cta_text} onChange={(e) => set('cta_text', e.target.value)}
                className="w-full border border-gray-200 px-3 py-2 text-sm outline-none focus:border-black" />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">PRIMARY BUTTON LINK</label>
              <input value={form.cta_link} onChange={(e) => set('cta_link', e.target.value)}
                className="w-full border border-gray-200 px-3 py-2 text-sm outline-none focus:border-black" />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">SECONDARY BUTTON TEXT</label>
              <input value={form.cta_secondary_text} onChange={(e) => set('cta_secondary_text', e.target.value)}
                className="w-full border border-gray-200 px-3 py-2 text-sm outline-none focus:border-black"
                placeholder="Leave blank to hide" />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">SECONDARY BUTTON LINK</label>
              <input value={form.cta_secondary_link} onChange={(e) => set('cta_secondary_link', e.target.value)}
                className="w-full border border-gray-200 px-3 py-2 text-sm outline-none focus:border-black" />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 border border-gray-300 py-2.5 text-xs font-black tracking-widest hover:border-black transition-colors">
              CANCEL
            </button>
            <button type="submit" disabled={saving}
              className="flex-1 bg-black text-white py-2.5 text-xs font-black tracking-widest hover:bg-orange-500 transition-colors disabled:opacity-60">
              {saving ? 'SAVING…' : slide ? 'UPDATE SLIDE' : 'ADD SLIDE'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function AdminBanners() {
  const [slides, setSlides] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null)
  const [deleteId, setDeleteId] = useState(null)

  const load = useCallback(() => {
    setLoading(true)
    api.get('/admin/banners').then(({ data }) => setSlides(data)).finally(() => setLoading(false))
  }, [])

  useEffect(() => { load() }, [load])

  const handleDelete = async () => {
    await api.delete(`/admin/banners/${deleteId}`)
    setDeleteId(null)
    load()
  }

  const toggleActive = async (slide) => {
    await api.put(`/admin/banners/${slide.id}`, { is_active: !slide.is_active })
    load()
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black tracking-tight">Banner Slides</h1>
          <p className="text-xs text-gray-400 mt-0.5">Manage the hero banner on the store homepage</p>
        </div>
        <button onClick={() => setModal('add')}
          className="flex items-center gap-2 bg-black text-white text-xs font-black tracking-widest px-4 py-2.5 hover:bg-orange-500 transition-colors">
          <Plus size={14} /> ADD SLIDE
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => <div key={i} className="h-28 bg-gray-100 rounded animate-pulse" />)}
        </div>
      ) : slides.length === 0 ? (
        <div className="border-2 border-dashed border-gray-200 rounded py-16 text-center">
          <p className="text-gray-400 text-sm mb-4">No slides yet. Add your first banner slide.</p>
          <button onClick={() => setModal('add')}
            className="bg-black text-white text-xs font-black tracking-widest px-6 py-2.5 hover:bg-orange-500 transition-colors">
            ADD SLIDE
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {slides.map((slide, idx) => (
            <div key={slide.id}
              className={`bg-white border rounded overflow-hidden flex gap-0 ${!slide.is_active ? 'opacity-60' : ''}`}>
              {/* Mini preview strip */}
              <div className={`w-40 h-28 bg-gradient-to-r ${slide.bg_color} flex-shrink-0 relative overflow-hidden`}>
                {slide.image_url && (
                  <img src={slide.image_url} alt="" className="absolute inset-0 w-full h-full object-cover opacity-40" />
                )}
                <div className="absolute inset-0 flex flex-col justify-center px-3">
                  {slide.badge && (
                    <span className={`${slide.accent_color} text-white text-[8px] font-black px-1.5 py-0.5 mb-1 self-start`}>
                      {slide.badge}
                    </span>
                  )}
                  <p className="text-white font-black text-xs leading-tight line-clamp-2">{slide.title}</p>
                </div>
              </div>

              {/* Info */}
              <div className="flex-1 px-4 py-3 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-bold text-sm truncate">{slide.title}</p>
                    <p className="text-xs text-gray-400 truncate">{slide.subtitle}</p>
                    <div className="flex gap-3 mt-2">
                      <span className="text-[10px] text-gray-500">CTA: <strong>{slide.cta_text}</strong> → {slide.cta_link}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <span className="text-xs text-gray-400">#{idx + 1}</span>
                    <button onClick={() => toggleActive(slide)} title={slide.is_active ? 'Hide slide' : 'Show slide'}
                      className={`p-1.5 rounded transition-colors ${slide.is_active ? 'text-green-500 hover:bg-green-50' : 'text-gray-400 hover:bg-gray-100'}`}>
                      {slide.is_active ? <Eye size={15} /> : <EyeOff size={15} />}
                    </button>
                    <button onClick={() => setModal(slide)}
                      className="p-1.5 text-gray-400 hover:text-black hover:bg-gray-100 rounded transition-colors">
                      <Edit2 size={15} />
                    </button>
                    <button onClick={() => setDeleteId(slide.id)}
                      className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {modal !== null && (
        <SlideModal
          slide={modal === 'add' ? null : modal}
          onClose={() => setModal(null)}
          onSaved={() => { setModal(null); load() }}
        />
      )}

      {deleteId && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded shadow-2xl p-6 max-w-sm w-full">
            <h3 className="font-black mb-2">Delete Slide?</h3>
            <p className="text-sm text-gray-500 mb-5">This will remove it from the store immediately.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)}
                className="flex-1 border border-gray-300 py-2 text-xs font-black hover:border-black transition-colors">
                CANCEL
              </button>
              <button onClick={handleDelete}
                className="flex-1 bg-red-500 text-white py-2 text-xs font-black hover:bg-red-600 transition-colors">
                DELETE
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
