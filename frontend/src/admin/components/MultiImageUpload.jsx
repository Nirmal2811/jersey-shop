import { useRef, useState } from 'react'
import { Plus, X, Loader, GripVertical } from 'lucide-react'
import axios from 'axios'

export default function MultiImageUpload({ value = [], onChange, label = 'PRODUCT IMAGES', max = 6 }) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState(null)
  const inputRef = useRef(null)

  const uploadFiles = async (files) => {
    const remaining = max - value.length
    const toUpload = Array.from(files).slice(0, remaining)
    if (!toUpload.length) return
    setError(null)
    setUploading(true)
    try {
      const urls = []
      for (const file of toUpload) {
        const form = new FormData()
        form.append('file', file)
        const token = localStorage.getItem('token')
        const { data } = await axios.post('/api/admin/upload', form, {
          headers: { Authorization: `Bearer ${token}` },
        })
        urls.push(data.url)
      }
      onChange([...value, ...urls])
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const remove = (index) => onChange(value.filter((_, i) => i !== index))

  const handleDrop = (e) => {
    e.preventDefault()
    uploadFiles(e.dataTransfer.files)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="text-xs font-bold text-gray-500">{label}</label>
        <span className="text-[10px] text-gray-400">{value.length}/{max} — first image is primary</span>
      </div>

      <div className="flex flex-wrap gap-2">
        {value.map((url, i) => (
          <div key={url + i} className="relative group w-24 h-24 flex-shrink-0">
            <img src={url} alt="" className="w-full h-full object-cover border border-gray-200 bg-gray-100" />
            {i === 0 && (
              <span className="absolute bottom-0 left-0 right-0 text-center text-[8px] font-black bg-black/70 text-white py-0.5 tracking-widest">
                MAIN
              </span>
            )}
            <button
              type="button"
              onClick={() => remove(i)}
              className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow"
            >
              <X size={10} />
            </button>
          </div>
        ))}

        {value.length < max && (
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => !uploading && inputRef.current?.click()}
            className="w-24 h-24 border-2 border-dashed border-gray-300 hover:border-black flex flex-col items-center justify-center gap-1 text-gray-400 hover:text-black transition-colors cursor-pointer flex-shrink-0"
          >
            {uploading
              ? <Loader size={18} className="animate-spin" />
              : <Plus size={18} />
            }
            <span className="text-[9px] font-bold tracking-widest">
              {uploading ? 'UPLOADING' : 'ADD'}
            </span>
          </div>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => uploadFiles(e.target.files)}
      />

      {error && <p className="text-[11px] text-red-500 mt-1.5">{error}</p>}
    </div>
  )
}
