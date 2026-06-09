import { useState, useRef } from 'react'
import { Upload, Link, X, Loader } from 'lucide-react'
import api from '../../services/api'

export default function ImageUpload({ value, onChange, label = 'IMAGE' }) {
  const [tab, setTab] = useState('upload') // 'upload' | 'url'
  const [dragging, setDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState(null)
  const inputRef = useRef(null)

  const upload = async (file) => {
    if (!file) return
    setError(null)
    setUploading(true)
    try {
      const form = new FormData()
      form.append('file', file)
      // Setting Content-Type to undefined removes the instance-level
      // 'application/json' default so axios can auto-set multipart/form-data
      // with the correct boundary. Authorization is added by the interceptor.
      const { data } = await api.post('/admin/upload', form, {
        headers: { 'Content-Type': undefined },
      })
      onChange(data.url)
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) upload(file)
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) upload(file)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label className="text-xs font-bold text-gray-500">{label}</label>
        <div className="flex border border-gray-200 rounded overflow-hidden text-[10px] font-bold">
          <button
            type="button"
            onClick={() => setTab('upload')}
            className={`px-2.5 py-1 transition-colors ${tab === 'upload' ? 'bg-black text-white' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            UPLOAD
          </button>
          <button
            type="button"
            onClick={() => setTab('url')}
            className={`px-2.5 py-1 transition-colors ${tab === 'url' ? 'bg-black text-white' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            URL
          </button>
        </div>
      </div>

      {tab === 'upload' ? (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`relative border-2 border-dashed rounded cursor-pointer transition-colors flex flex-col items-center justify-center gap-2 py-5
            ${dragging ? 'border-orange-400 bg-orange-50' : 'border-gray-200 hover:border-black bg-gray-50'}`}
        >
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
          {uploading ? (
            <Loader size={20} className="text-gray-400 animate-spin" />
          ) : (
            <Upload size={20} className="text-gray-400" />
          )}
          <p className="text-xs text-gray-400 text-center">
            {uploading ? 'Uploading…' : 'Drag & drop or click to browse'}
          </p>
          <p className="text-[10px] text-gray-300">PNG, JPG, WEBP, GIF, AVIF, SVG & more</p>
        </div>
      ) : (
        <div className="flex gap-2">
          <input
            type="url"
            value={tab === 'url' ? value : ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder="https://..."
            className="flex-1 border border-gray-200 px-3 py-2 text-sm outline-none focus:border-black"
          />
          <Link size={14} className="self-center text-gray-400 flex-shrink-0" />
        </div>
      )}

      {error && (
        <p className="text-[11px] text-red-500 mt-1">{error}</p>
      )}

      {/* Preview */}
      {value && (
        <div className="mt-2 relative inline-block">
          <img
            src={value}
            alt="Preview"
            className="h-20 w-32 object-cover rounded border border-gray-200 bg-gray-100"
          />
          <button
            type="button"
            onClick={() => onChange('')}
            className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
          >
            <X size={10} />
          </button>
        </div>
      )}
    </div>
  )
}
