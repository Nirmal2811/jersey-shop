import { useEffect, useState, useCallback } from 'react'
import { ChevronDown, ChevronUp, Save, Eye, EyeOff } from 'lucide-react'
import ImageUpload from '../components/ImageUpload'
import api from '../../services/api'

const SLOT_META = {
  1: {
    label: 'Banner 1 — Split Layout',
    desc: 'Left image · Center text · Right image',
    fields: { image1: 'Left Image', image2: 'Right Image' },
  },
  2: {
    label: 'Banner 2 — Full Width',
    desc: 'Full-width background image with text overlay',
    fields: { image1: 'Background Image' },
  },
  3: {
    label: 'Banner 3 — Three Panel',
    desc: 'Three equal image panels with text on right',
    fields: { image1: 'Left Image', image2: 'Center Image', image3: 'Right Image' },
  },
}

function BannerEditor({ banner, onSaved }) {
  const [form, setForm]       = useState(banner)
  const [open, setOpen]       = useState(false)
  const [saving, setSaving]   = useState(false)
  const [saved, setSaved]     = useState(false)

  useEffect(() => { setForm(banner) }, [banner])

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  const handleSave = async () => {
    setSaving(true)
    try {
      await api.put(`/admin/home-banners/${form.slot}`, form)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
      onSaved()
    } finally {
      setSaving(false)
    }
  }

  const meta = SLOT_META[form.slot]

  return (
    <div className="bg-white border border-gray-200 rounded overflow-hidden">
      {/* Header row */}
      <button
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors"
        onClick={() => setOpen((v) => !v)}
      >
        <div className="flex items-center gap-3">
          <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${form.is_active ? 'bg-green-500' : 'bg-gray-300'}`} />
          <div className="text-left">
            <p className="text-sm font-black">{meta.label}</p>
            <p className="text-[11px] text-gray-400 mt-0.5">{meta.desc}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={(e) => { e.stopPropagation(); set('is_active', !form.is_active) }}
            className={`p-1.5 rounded transition-colors ${form.is_active ? 'text-green-500 hover:bg-green-50' : 'text-gray-400 hover:bg-gray-100'}`}
            title={form.is_active ? 'Hide banner' : 'Show banner'}
          >
            {form.is_active ? <Eye size={15} /> : <EyeOff size={15} />}
          </button>
          {open ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
        </div>
      </button>

      {open && (
        <div className="border-t border-gray-100 p-5 space-y-5">
          {/* Text fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black text-gray-400 tracking-widest mb-1">BADGE / LABEL</label>
              <input value={form.badge} onChange={(e) => set('badge', e.target.value)}
                className="w-full border border-gray-200 px-3 py-2 text-sm outline-none focus:border-black"
                placeholder="e.g. 2026/27 SEASON" />
            </div>

            <div>
              <label className="block text-[10px] font-black text-gray-400 tracking-widest mb-1">TITLE *</label>
              <input value={form.title} onChange={(e) => set('title', e.target.value)}
                className="w-full border border-gray-200 px-3 py-2 text-sm outline-none focus:border-black"
                placeholder="e.g. MADE FOR CHAMPIONS" />
            </div>

            <div className="md:col-span-2">
              <label className="block text-[10px] font-black text-gray-400 tracking-widest mb-1">SUBTITLE</label>
              <input value={form.subtitle} onChange={(e) => set('subtitle', e.target.value)}
                className="w-full border border-gray-200 px-3 py-2 text-sm outline-none focus:border-black"
                placeholder="Short description shown below the title" />
            </div>

            <div>
              <label className="block text-[10px] font-black text-gray-400 tracking-widest mb-1">BUTTON TEXT</label>
              <input value={form.cta_text} onChange={(e) => set('cta_text', e.target.value)}
                className="w-full border border-gray-200 px-3 py-2 text-sm outline-none focus:border-black" />
            </div>

            <div>
              <label className="block text-[10px] font-black text-gray-400 tracking-widest mb-1">BUTTON LINK</label>
              <input value={form.cta_link} onChange={(e) => set('cta_link', e.target.value)}
                className="w-full border border-gray-200 px-3 py-2 text-sm outline-none focus:border-black"
                placeholder="/products?category=..." />
            </div>

            {form.slot === 1 && (
              <>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 tracking-widest mb-1">SECONDARY BUTTON TEXT</label>
                  <input value={form.cta_secondary_text} onChange={(e) => set('cta_secondary_text', e.target.value)}
                    className="w-full border border-gray-200 px-3 py-2 text-sm outline-none focus:border-black"
                    placeholder="Leave blank to hide" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 tracking-widest mb-1">SECONDARY BUTTON LINK</label>
                  <input value={form.cta_secondary_link} onChange={(e) => set('cta_secondary_link', e.target.value)}
                    className="w-full border border-gray-200 px-3 py-2 text-sm outline-none focus:border-black" />
                </div>
              </>
            )}
          </div>

          {/* Images */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {meta.fields.image1 && (
              <ImageUpload value={form.image1_url} onChange={(url) => set('image1_url', url)} label={meta.fields.image1.toUpperCase()} />
            )}
            {meta.fields.image2 && (
              <ImageUpload value={form.image2_url} onChange={(url) => set('image2_url', url)} label={meta.fields.image2.toUpperCase()} />
            )}
            {meta.fields.image3 && (
              <ImageUpload value={form.image3_url} onChange={(url) => set('image3_url', url)} label={meta.fields.image3.toUpperCase()} />
            )}
          </div>

          {/* Background (split only) */}
          {form.slot === 1 && (
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex-1 min-w-[200px]">
                <label className="block text-[10px] font-black text-gray-400 tracking-widest mb-1">BACKGROUND COLOR</label>
                <div className="flex items-center gap-2">
                  {/* Color picker */}
                  <input
                    type="color"
                    value={form.bg.startsWith('#') ? form.bg : '#f5f5f5'}
                    onChange={(e) => set('bg', e.target.value)}
                    className="w-10 h-10 rounded border border-gray-200 cursor-pointer p-0.5 bg-white flex-shrink-0"
                    title="Pick background colour"
                  />
                  {/* Hex readout */}
                  <input
                    value={form.bg}
                    onChange={(e) => set('bg', e.target.value)}
                    className="flex-1 border border-gray-200 px-3 py-2 text-sm outline-none focus:border-black font-mono"
                    placeholder="#f5f5f5"
                  />
                  {/* Live swatch */}
                  <div
                    className="w-10 h-10 rounded border border-gray-200 flex-shrink-0"
                    style={{ backgroundColor: form.bg }}
                    title="Preview"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-400 tracking-widest mb-1">TEXT STYLE</label>
                <button
                  type="button"
                  onClick={() => set('text_dark', !form.text_dark)}
                  className={`px-4 py-2 text-xs font-black border transition-colors rounded ${
                    form.text_dark ? 'bg-black text-white border-black' : 'border-gray-200 text-gray-600'
                  }`}
                >
                  {form.text_dark ? 'DARK TEXT' : 'LIGHT TEXT'}
                </button>
              </div>
            </div>
          )}

          {/* Save */}
          <div className="flex justify-end pt-1">
            <button
              onClick={handleSave}
              disabled={saving}
              className={`flex items-center gap-2 px-6 py-2.5 text-xs font-black tracking-widest transition-colors disabled:opacity-60 ${
                saved ? 'bg-green-500 text-white' : 'bg-black text-white hover:bg-orange-500'
              }`}
            >
              <Save size={13} />
              {saving ? 'SAVING…' : saved ? 'SAVED!' : 'SAVE BANNER'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default function AdminHomeBanners() {
  const [banners, setBanners] = useState([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(() => {
    setLoading(true)
    api.get('/admin/home-banners').then(({ data }) => setBanners(data)).finally(() => setLoading(false))
  }, [])

  useEffect(() => { load() }, [load])

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-black tracking-tight">Home Page Banners</h1>
        <p className="text-xs text-gray-400 mt-0.5">Edit content and images for the 3 banners displayed on the homepage</p>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <div key={i} className="h-16 bg-gray-100 rounded animate-pulse" />)}
        </div>
      ) : (
        <div className="space-y-3">
          {banners.map((b) => (
            <BannerEditor key={b.slot} banner={b} onSaved={load} />
          ))}
        </div>
      )}
    </div>
  )
}
