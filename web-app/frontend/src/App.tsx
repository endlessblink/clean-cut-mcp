import { Routes, Route } from 'react-router-dom'
import { useState } from 'react'
import Navbar from '@/components/Navbar'
import Dashboard from '@/pages/Dashboard'
import VideoEditor from '@/pages/VideoEditor'
import Login from '@/pages/Login'
import Register from '@/pages/Register'
import { useAuthStore } from '@/stores/authStore'

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user, isLoading } = useAuthStore()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="loading-spinner"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {user && <Navbar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />}

      <main className={user ? "pt-16" : ""}>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected routes */}
          <Route path="/" element={<Dashboard />} />
          <Route path="/editor/:id?" element={<VideoEditor />} />

          {/* Fallback */}
          <Route path="*" element={<Dashboard />} />
        </Routes>
      </main>
    </div>
  )
}

export default App