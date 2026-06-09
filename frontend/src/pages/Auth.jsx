import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, EyeOff, Mail, Lock, User, ArrowRight } from 'lucide-react'
import { loginUser, registerUser, clearError } from '../store/slices/authSlice'

export default function Auth() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { isAuthenticated, loading, error, user } = useSelector((s) => s.auth)
  const [mode, setMode] = useState('login')
  const [showPassword, setShowPassword] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' })
  const [formError, setFormError] = useState(null)

  useEffect(() => {
    if (isAuthenticated) navigate(user?.is_admin ? '/admin' : '/account')
  }, [isAuthenticated, navigate, user])

  useEffect(() => {
    dispatch(clearError())
    setFormError(null)
  }, [mode, dispatch])

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormError(null)

    if (mode === 'register') {
      if (form.password !== form.confirmPassword) {
        setFormError('Passwords do not match')
        return
      }
      if (form.password.length < 6) {
        setFormError('Password must be at least 6 characters')
        return
      }
      dispatch(registerUser({ name: form.name, email: form.email, password: form.password }))
    } else {
      dispatch(loginUser({ email: form.email, password: form.password }))
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center justify-center gap-2 mb-6">
            <div className="w-10 h-10 bg-black flex items-center justify-center">
              <span className="text-white font-black text-lg">JS</span>
            </div>
          </Link>
          <h1 className="text-2xl font-black tracking-tight">
            {mode === 'login' ? 'WELCOME BACK' : 'CREATE ACCOUNT'}
          </h1>
          <p className="text-gray-400 text-sm mt-2">
            {mode === 'login'
              ? 'Sign in to your JerseyShop account'
              : 'Join JerseyShop for exclusive deals'}
          </p>
        </div>

        {/* Mode toggle */}
        <div className="flex border border-black mb-8">
          <button
            onClick={() => setMode('login')}
            className={`flex-1 py-3 text-xs font-black tracking-widest transition-colors ${
              mode === 'login' ? 'bg-black text-white' : 'text-black hover:bg-gray-50'
            }`}
          >
            SIGN IN
          </button>
          <button
            onClick={() => setMode('register')}
            className={`flex-1 py-3 text-xs font-black tracking-widest transition-colors ${
              mode === 'register' ? 'bg-black text-white' : 'text-black hover:bg-gray-50'
            }`}
          >
            REGISTER
          </button>
        </div>

        {/* Form */}
        <AnimatePresence mode="wait">
          <motion.form
            key={mode}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            onSubmit={handleSubmit}
            className="space-y-4"
          >
            {mode === 'register' && (
              <div className="relative">
                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Full Name"
                  required
                  className="w-full border border-gray-200 pl-9 pr-4 py-3 text-sm outline-none focus:border-black transition-colors"
                />
              </div>
            )}

            <div className="relative">
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Email Address"
                required
                className="w-full border border-gray-200 pl-9 pr-4 py-3 text-sm outline-none focus:border-black transition-colors"
              />
            </div>

            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={form.password}
                onChange={handleChange}
                placeholder="Password"
                required
                className="w-full border border-gray-200 pl-9 pr-10 py-3 text-sm outline-none focus:border-black transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {mode === 'register' && (
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  name="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  value={form.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm Password"
                  required
                  className="w-full border border-gray-200 pl-9 pr-4 py-3 text-sm outline-none focus:border-black transition-colors"
                />
              </div>
            )}

            {mode === 'login' && (
              <div className="text-right">
                <Link to="/forgot-password" className="text-xs text-gray-400 hover:text-black">
                  Forgot password?
                </Link>
              </div>
            )}

            {(error || formError) && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-xs font-semibold px-4 py-3">
                {formError || error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black text-white font-black tracking-widest text-sm py-4 flex items-center justify-center gap-2 hover:bg-orange-500 transition-colors disabled:opacity-60"
            >
              {loading ? 'LOADING...' : mode === 'login' ? 'SIGN IN' : 'CREATE ACCOUNT'}
              {!loading && <ArrowRight size={14} />}
            </button>

            {mode === 'register' && (
              <p className="text-xs text-gray-400 text-center leading-relaxed">
                By creating an account you agree to our{' '}
                <Link to="/terms" className="underline hover:text-black">Terms</Link> and{' '}
                <Link to="/privacy" className="underline hover:text-black">Privacy Policy</Link>
              </p>
            )}
          </motion.form>
        </AnimatePresence>

        {/* Demo credentials hint */}
        <div className="mt-6 p-3 bg-orange-50 border border-orange-100 text-xs text-orange-600 space-y-1">
          <p className="text-center"><strong>Customer:</strong> test@jerseyshop.com / password123</p>
          <p className="text-center"><strong>Admin:</strong> admin@jerseyshop.com / admin123</p>
        </div>
      </div>
    </div>
  )
}
