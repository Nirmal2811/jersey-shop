import { useEffect, useState, useCallback } from 'react'
import { Search, ChevronLeft, ChevronRight, ShieldCheck, Shield } from 'lucide-react'
import { useSelector } from 'react-redux'
import api from '../../services/api'

export default function AdminUsers() {
  const me = useSelector((s) => s.auth.user)
  const [users, setUsers] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [toggling, setToggling] = useState(null)

  const load = useCallback(() => {
    setLoading(true)
    api.get('/admin/users', { params: { page, per_page: 20, search } })
      .then(({ data }) => {
        setUsers(data.users)
        setTotal(data.total)
        setPages(data.pages)
      })
      .finally(() => setLoading(false))
  }, [page, search])

  useEffect(() => { load() }, [load])

  const handleToggleAdmin = async (userId) => {
    setToggling(userId)
    try {
      const { data } = await api.put(`/admin/users/${userId}/toggle-admin`)
      setUsers((prev) => prev.map((u) => u.id === userId ? data : u))
    } finally {
      setToggling(null)
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-black tracking-tight">Users</h1>
        <p className="text-xs text-gray-400 mt-0.5">{total} registered customers</p>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1) }}
          placeholder="Search by name or email..."
          className="w-full border border-gray-200 pl-9 pr-4 py-2 text-sm outline-none focus:border-black"
        />
      </div>

      <div className="bg-white border border-gray-200 rounded overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['User', 'Email', 'Phone', 'Role', 'Joined', 'Actions'].map((h) => (
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
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-gray-400 text-sm">No users found</td>
                </tr>
              ) : users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-xs font-black">{user.name?.[0]?.toUpperCase()}</span>
                      </div>
                      <span className="font-semibold text-sm">{user.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-600">{user.email}</td>
                  <td className="px-4 py-3 text-xs text-gray-600">{user.phone || '—'}</td>
                  <td className="px-4 py-3">
                    {user.is_admin ? (
                      <span className="flex items-center gap-1 text-[10px] font-black text-orange-600 bg-orange-50 px-2 py-0.5 rounded w-fit">
                        <ShieldCheck size={10} /> ADMIN
                      </span>
                    ) : (
                      <span className="text-[10px] font-black text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                        CUSTOMER
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-400">
                    {new Date(user.created_at).toLocaleDateString('en-IN')}
                  </td>
                  <td className="px-4 py-3">
                    {me?.id !== user.id && (
                      <button
                        onClick={() => handleToggleAdmin(user.id)}
                        disabled={toggling === user.id}
                        title={user.is_admin ? 'Remove admin' : 'Make admin'}
                        className={`p-1.5 rounded transition-colors disabled:opacity-50
                          ${user.is_admin
                            ? 'text-orange-500 hover:bg-orange-50 hover:text-orange-700'
                            : 'text-gray-400 hover:bg-gray-100 hover:text-black'
                          }`}
                      >
                        {user.is_admin ? <Shield size={15} /> : <ShieldCheck size={15} />}
                      </button>
                    )}
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
    </div>
  )
}
