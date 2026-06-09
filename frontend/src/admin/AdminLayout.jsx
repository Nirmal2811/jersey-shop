import { useState, Suspense } from 'react'
import { NavLink, useNavigate, Outlet } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import {
  LayoutDashboard, Package, ShoppingBag, Users, LogOut,
  ChevronLeft, ChevronRight, Menu, Megaphone, LayoutTemplate,
} from 'lucide-react'
import { logout } from '../store/slices/authSlice'

const NAV = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/products', label: 'Products', icon: Package },
  { to: '/admin/orders', label: 'Orders', icon: ShoppingBag },
  { to: '/admin/users', label: 'Users', icon: Users },
  { to: '/admin/home-banners', label: 'Home Banners', icon: LayoutTemplate },
  { to: '/admin/announcements', label: 'Announcements', icon: Megaphone },
]

function SidebarContent({ collapsed, user, onNavClick, onLogout }) {
  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className={`flex items-center gap-3 px-4 py-5 border-b border-white/10 ${collapsed ? 'justify-center' : ''}`}>
        <div className="w-8 h-8 bg-orange-500 flex items-center justify-center flex-shrink-0">
          <span className="text-white font-black text-sm">JS</span>
        </div>
        {!collapsed && (
          <div>
            <p className="text-white font-black text-sm leading-none">JERSEY SHOP</p>
            <p className="text-white/40 text-[10px] tracking-widest mt-0.5">ADMIN</p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 overflow-y-auto">
        {NAV.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={onNavClick}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 mx-2 rounded transition-colors text-sm font-semibold
               ${isActive
                 ? 'bg-orange-500 text-white'
                 : 'text-white/60 hover:text-white hover:bg-white/10'
               }
               ${collapsed ? 'justify-center' : ''}`
            }
          >
            <Icon size={18} className="flex-shrink-0" />
            {!collapsed && label}
          </NavLink>
        ))}
      </nav>

      {/* User + Logout */}
      <div className="border-t border-white/10 p-4">
        {!collapsed && (
          <div className="mb-3">
            <p className="text-white text-xs font-bold truncate">{user?.name}</p>
            <p className="text-white/40 text-[10px] truncate">{user?.email}</p>
          </div>
        )}
        <button
          onClick={onLogout}
          className={`flex items-center gap-2 text-white/50 hover:text-red-400 transition-colors text-xs font-semibold ${collapsed ? 'justify-center w-full' : ''}`}
        >
          <LogOut size={16} />
          {!collapsed && 'Sign Out'}
        </button>
      </div>
    </div>
  )
}

export default function AdminLayout() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { user } = useSelector((s) => s.auth)
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleLogout = () => {
    dispatch(logout())
    navigate('/')
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Desktop sidebar */}
      <aside
        className={`hidden md:flex flex-col bg-[#111] transition-all duration-200 flex-shrink-0
          ${collapsed ? 'w-16' : 'w-56'}`}
      >
        <SidebarContent
          collapsed={collapsed}
          user={user}
          onNavClick={() => {}}
          onLogout={handleLogout}
        />
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute top-4 bg-[#111] border border-white/10 rounded-full w-6 h-6 flex items-center justify-center text-white/40 hover:text-white transition-colors"
          style={{ left: collapsed ? '52px' : '212px' }}
        >
          {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
        </button>
      </aside>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div className="w-56 bg-[#111] flex flex-col h-full">
            <SidebarContent
              collapsed={false}
              user={user}
              onNavClick={() => setMobileOpen(false)}
              onLogout={handleLogout}
            />
          </div>
          <div className="flex-1 bg-black/50" onClick={() => setMobileOpen(false)} />
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between flex-shrink-0">
          <button
            className="md:hidden p-1 text-gray-500 hover:text-black"
            onClick={() => setMobileOpen(true)}
          >
            <Menu size={20} />
          </button>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold tracking-widest text-gray-400 hidden md:block">ADMIN PANEL</span>
          </div>
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-semibold text-gray-400 hover:text-black transition-colors"
          >
            View Store →
          </a>
        </header>

        <main id="admin-main" className="flex-1 overflow-auto p-6 flex flex-col">
          <Suspense fallback={
            <div className="flex-1 flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin" />
            </div>
          }>
            <Outlet />
          </Suspense>
        </main>
      </div>
    </div>
  )
}
