import { Suspense, lazy, useEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { AnimatePresence, motion } from 'framer-motion'
import { logout } from './store/slices/authSlice'
import AnnouncementBar from './components/AnnouncementBar'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import CartDrawer from './components/CartDrawer'
import SearchModal from './components/SearchModal'
import Toast from './components/Toast'
import SmoothScroll from './components/SmoothScroll'
import AdminLayout from './admin/AdminLayout'
import AdminRoute from './admin/AdminRoute'
import AdminDashboard from './admin/pages/AdminDashboard'
import AdminProducts from './admin/pages/AdminProducts'
import AdminOrders from './admin/pages/AdminOrders'
import AdminUsers from './admin/pages/AdminUsers'
import AdminBanners from './admin/pages/AdminBanners'
import AdminAnnouncements from './admin/pages/AdminAnnouncements'
import AdminHomeBanners from './admin/pages/AdminHomeBanners'

const Home = lazy(() => import('./pages/Home'))
const Products = lazy(() => import('./pages/Products'))
const ProductDetail = lazy(() => import('./pages/ProductDetail'))
const Cart = lazy(() => import('./pages/Cart'))
const Checkout = lazy(() => import('./pages/Checkout'))
const Auth = lazy(() => import('./pages/Auth'))
const Account = lazy(() => import('./pages/Account'))
const Wishlist = lazy(() => import('./pages/Wishlist'))

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    if (window.__lenis) {
      window.__lenis.scrollTo(0, { immediate: true })
    } else {
      window.scrollTo(0, 0)
    }
  }, [pathname])
  return null
}

function PageTransition({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.25 }}
    >
      {children}
    </motion.div>
  )
}

function LoadingFallback() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin" />
    </div>
  )
}

export default function App() {
  const dispatch = useDispatch()
  const location = useLocation()

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) return

    // Wipe malformed tokens immediately — no API call needed.
    // A valid JWT always has exactly 3 base64url segments.
    if (token.split('.').length !== 3) {
      localStorage.removeItem('token')
      dispatch(logout())
    }
    // Do NOT call fetchProfile here — it causes a race condition where the
    // in-flight stale request can clear the fresh token set during login.
    // Profile fetching happens per-page (Account.jsx) when data is needed.
  }, [dispatch])

  return (
    <Suspense fallback={<LoadingFallback />}>
      {/* Outer Routes has no key/location — admin layout won't remount on navigation */}
      <Routes>
        {/* Admin — separate layout, no public Navbar/Footer */}
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminLayout />
            </AdminRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="banners" element={<AdminBanners />} />
          <Route path="announcements" element={<AdminAnnouncements />} />
          <Route path="home-banners" element={<AdminHomeBanners />} />
        </Route>

        {/* Public store */}
        <Route path="*" element={
          <SmoothScroll>
            <div className="min-h-screen flex flex-col">
              <div className="sticky top-0 z-50">
                <AnnouncementBar />
                <Navbar />
              </div>
              <SearchModal />
              <CartDrawer />
              <Toast />

              <ScrollToTop />
              <main className="flex-1">
                <AnimatePresence mode="wait">
                  <Routes location={location} key={location.pathname}>
                    <Route path="/" element={<PageTransition><Home /></PageTransition>} />
                    <Route path="/products" element={<PageTransition><Products /></PageTransition>} />
                    <Route path="/products/:id" element={<PageTransition><ProductDetail /></PageTransition>} />
                    <Route path="/cart" element={<PageTransition><Cart /></PageTransition>} />
                    <Route path="/checkout" element={<PageTransition><Checkout /></PageTransition>} />
                    <Route path="/auth" element={<PageTransition><Auth /></PageTransition>} />
                    <Route path="/account" element={<PageTransition><Account /></PageTransition>} />
                    <Route path="/wishlist" element={<PageTransition><Wishlist /></PageTransition>} />
                    <Route path="*" element={
                      <PageTransition>
                        <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 px-4 text-center">
                          <h1 className="text-6xl font-black">404</h1>
                          <p className="text-gray-400">Page not found</p>
                          <a href="/" className="btn-primary text-xs">GO HOME</a>
                        </div>
                      </PageTransition>
                    } />
                  </Routes>
                </AnimatePresence>
              </main>

              <Footer />
            </div>
          </SmoothScroll>
        } />
      </Routes>
    </Suspense>
  )
}
