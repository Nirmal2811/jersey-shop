import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
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

export default api
