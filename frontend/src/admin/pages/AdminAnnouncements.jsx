import { useEffect, useState, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { Plus, Edit2, Trash2, X, Eye, EyeOff, GripVertical } from 'lucide-react'
import api from '../../services/api'

function MessageModal({ item, onClose, onSaved }) {
  const [message, setMessage] = useState(item?.message || '')
  const [isActive, setIsActive] = useState(item?.is_active ?? true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!message.trim()) { setError('Message is required'); return }
    setError(null)
    setSaving(true)
    try {
      if (item) {
        await api.put(`/admin/announcements/${item.id}`, { message: message.trim(), is_active: isActive })
      } else {
        await api.post('/admin/announcements', { message: message.trim(), is_active: isActive })
      }
      onSaved()
    } catch (err) {
      setError(err.response?.data?.message || 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  return createPortal(
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white w-full max-w-lg rounded shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="font-black text-base">{item ? 'EDIT MESSAGE' : 'ADD MESSAGE'}</h2>
          <button onClick={onClose}><X size={20} className="text-gray-400 hover:text-black" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && <p className="text-xs text-red-500 bg-red-50 border border-red-200 px-3 py-2 rounded">{error}</p>}

          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1">ANNOUNCEMENT TEXT *</label>
            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full border border-gray-200 px-3 py-2 text-sm outline-none focus:border-black"
              placeholder="e.g. FREE SHIPPING ON ORDERS ABOVE ₹999"
              maxLength={300}
            />
            <p className="text-[10px] text-gray-400 mt-1">{message.length}/300 characters</p>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1">STATUS</label>
            <button
              type="button"
              onClick={() => setIsActive((v) => !v)}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-bold border transition-colors rounded ${
                isActive ? 'border-green-400 bg-green-50 text-green-700' : 'border-gray-200 text-gray-400'
              }`}
            >
              {isActive ? <><Eye size={13} /> ACTIVE</> : <><EyeOff size={13} /> HIDDEN</>}
            </button>
          </div>

          {/* Live preview */}
          <div className="bg-gray-50 border border-gray-200 rounded px-4 py-3 text-center">
            <p className="text-[10px] text-gray-400 mb-1 font-bold tracking-widest">PREVIEW</p>
            <p className="text-[11px] font-bold tracking-widest text-black uppercase">
              {message || 'Your message will appear here'}
            </p>
          </div>

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose}
              className="flex-1 border border-gray-300 py-2.5 text-xs font-black tracking-widest hover:border-black transition-colors">
              CANCEL
            </button>
            <button type="submit" disabled={saving}
              className="flex-1 bg-black text-white py-2.5 text-xs font-black tracking-widest hover:bg-orange-500 transition-colors disabled:opacity-60">
              {saving ? 'SAVING…' : item ? 'UPDATE' : 'ADD'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  )
}

export default function AdminAnnouncements() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null)
  const [deleteId, setDeleteId] = useState(null)

  const load = useCallback(() => {
    setLoading(true)
    api.get('/admin/announcements').then(({ data }) => setItems(data)).finally(() => setLoading(false))
  }, [])

  useEffect(() => { load() }, [load])

  const toggleActive = async (item) => {
    await api.put(`/admin/announcements/${item.id}`, { is_active: !item.is_active })
    load()
  }

  const handleDelete = async () => {
    await api.delete(`/admin/announcements/${deleteId}`)
    setDeleteId(null)
    load()
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black tracking-tight">Announcement Bar</h1>
          <p className="text-xs text-gray-400 mt-0.5">Messages rotate every 3 seconds on the storefront</p>
        </div>
        <button
          onClick={() => setModal('add')}
          className="flex items-center gap-2 bg-black text-white text-xs font-black tracking-widest px-4 py-2.5 hover:bg-orange-500 transition-colors"
        >
          <Plus size={14} /> ADD MESSAGE
        </button>
      </div>

      {/* Preview strip */}
      <div className="bg-white border border-gray-200 rounded px-4 py-3 flex items-center gap-3">
        <span className="text-[10px] font-black text-gray-400 tracking-widest flex-shrink-0">LIVE BAR:</span>
        <div className="flex-1 text-center text-[11px] font-bold tracking-widest text-black uppercase truncate">
          {items.filter((m) => m.is_active)[0]?.message || '—'}
        </div>
        <span className="text-[10px] text-gray-400 flex-shrink-0">{items.filter((m) => m.is_active).length} active</span>
      </div>

      {loading ? (
        <div className="space-y-2">
          {[...Array(4)].map((_, i) => <div key={i} className="h-14 bg-gray-100 rounded animate-pulse" />)}
        </div>
      ) : items.length === 0 ? (
        <div className="border-2 border-dashed border-gray-200 rounded py-16 text-center">
          <p className="text-gray-400 text-sm mb-4">No messages yet. Add your first announcement.</p>
          <button
            onClick={() => setModal('add')}
            className="bg-black text-white text-xs font-black tracking-widest px-6 py-2.5 hover:bg-orange-500 transition-colors"
          >
            ADD MESSAGE
          </button>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded overflow-hidden divide-y divide-gray-50">
          {items.map((item, idx) => (
            <div key={item.id} className={`flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors ${!item.is_active ? 'opacity-50' : ''}`}>
              <GripVertical size={14} className="text-gray-300 flex-shrink-0" />
              <span className="text-xs text-gray-400 w-5 flex-shrink-0">#{idx + 1}</span>
              <p className="flex-1 text-sm font-semibold truncate">{item.message}</p>
              <div className="flex items-center gap-1 flex-shrink-0">
                <button
                  onClick={() => toggleActive(item)}
                  className={`p-1.5 rounded transition-colors ${item.is_active ? 'text-green-500 hover:bg-green-50' : 'text-gray-400 hover:bg-gray-100'}`}
                  title={item.is_active ? 'Hide' : 'Show'}
                >
                  {item.is_active ? <Eye size={14} /> : <EyeOff size={14} />}
                </button>
                <button
                  onClick={() => setModal(item)}
                  className="p-1.5 text-gray-400 hover:text-black hover:bg-gray-100 rounded transition-colors"
                >
                  <Edit2 size={14} />
                </button>
                <button
                  onClick={() => setDeleteId(item.id)}
                  className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {modal !== null && (
        <MessageModal
          item={modal === 'add' ? null : modal}
          onClose={() => setModal(null)}
          onSaved={() => { setModal(null); load() }}
        />
      )}

      {deleteId && createPortal(
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded shadow-2xl p-6 max-w-sm w-full">
            <h3 className="font-black mb-2">Delete Message?</h3>
            <p className="text-sm text-gray-500 mb-5">This will remove it from the announcement bar.</p>
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
        </div>,
        document.body
      )}
    </div>
  )
}
