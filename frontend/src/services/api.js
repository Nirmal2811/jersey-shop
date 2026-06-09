import axios from 'axios'

const API_ORIGIN = import.meta.env.VITE_API_URL || ''

const BASE = API_ORIGIN ? `${API_ORIGIN}/api` : '/api'

const api = axios.create({
  baseURL: BASE,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const isAdminRoute = config.url?.startsWith('/admin/')
  const token = isAdminRoute
    ? (localStorage.getItem('admin_token') || localStorage.getItem('token'))
    : localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/auth'
    }
    if (err.response?.status === 403 && err.config?.url?.startsWith('/admin/')) {
      localStorage.removeItem('token')
      localStorage.removeItem('admin_token')
      window.location.href = '/auth'
    }
    return Promise.reject(err)
  }
)

/**
 * Prefix backend-served paths (/uploads/...) with the API origin.
 * Frontend static assets (/images/...) and absolute URLs are returned unchanged.
 */
export function getMediaUrl(path) {
  if (!path) return ''
  if (/^https?:\/\//.test(path)) return path          // already absolute
  if (path.startsWith('/uploads/')) return `${API_ORIGIN}${path}`  // backend file
  return path                                          // frontend static asset
}

export default api
