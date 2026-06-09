import { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Navigate } from 'react-router-dom'
import { fetchProfile } from '../store/slices/authSlice'

export default function AdminRoute({ children }) {
  const dispatch = useDispatch()
  const { isAuthenticated, user } = useSelector((s) => s.auth)

  // On page refresh user is null; fetch profile so we know is_admin
  useEffect(() => {
    if (isAuthenticated && !user) dispatch(fetchProfile())
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  if (!isAuthenticated) return <Navigate to="/auth" replace />

  // Still loading user (page refresh)
  if (!user) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (!user.is_admin) return <Navigate to="/" replace />

  return children
}
