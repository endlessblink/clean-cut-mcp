import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { Project } from '@/types'

export default function Dashboard() {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate loading projects
    setTimeout(() => {
      setProjects([
        {
          id: '1',
          name: 'Product Launch Video',
          description: 'New product announcement with animated graphics',
          thumbnail: '/api/placeholder/400/225',
          duration: 30,
          createdAt: '2024-01-15T10:30:00Z',
          updatedAt: '2024-01-15T14:20:00Z',
          userId: user?.id || '',
          settings: {
            resolution: { width: 1920, height: 1080 },
            frameRate: 30,
            quality: 'high'
          }
        },
        {
          id: '2',
          name: 'Social Media Ad',
          description: 'Instagram story ad with text animations',
          thumbnail: '/api/placeholder/400/225',
          duration: 15,
          createdAt: '2024-01-14T16:45:00Z',
          updatedAt: '2024-01-14T18:30:00Z',
          userId: user?.id || '',
          settings: {
            resolution: { width: 1080, height: 1920 },
            frameRate: 30,
            quality: 'standard'
          }
        }
      ])
      setIsLoading(false)
    }, 1000)
  }, [user])

  const handleCreateProject = () => {
    navigate('/editor')
  }

  const handleOpenProject = (projectId: string) => {
    navigate(`/editor/${projectId}`)
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <div className="border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-white">
                Clean Cut Video
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-300">
                Welcome, {user?.name}
              </span>
              <button
                onClick={handleLogout}
                className="btn btn-secondary"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">
              Your Projects
            </h2>
            <p className="text-gray-400">
              Create and manage your video projects
            </p>
          </div>
          <button
            onClick={handleCreateProject}
            className="btn btn-primary"
          >
            + New Project
          </button>
        </div>

        {/* Projects Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="loading-spinner"></div>
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-gray-800 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
              <svg
                className="w-10 h-10 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-white mb-2">
              No projects yet
            </h3>
            <p className="text-gray-400 mb-6">
              Create your first video project to get started
            </p>
            <button
              onClick={handleCreateProject}
              className="btn btn-primary"
            >
              Create Your First Project
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {projects.map((project) => (
              <div
                key={project.id}
                className="card hover:border-primary-500 transition-all duration-200 cursor-pointer group"
                onClick={() => handleOpenProject(project.id)}
              >
                {/* Thumbnail */}
                <div className="aspect-video bg-gray-700 rounded-lg mb-4 overflow-hidden">
                  <div className="w-full h-full bg-gray-800 flex items-center justify-center group-hover:bg-gray-700 transition-colors">
                    <svg
                      className="w-12 h-12 text-gray-600 group-hover:text-gray-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                </div>

                {/* Project Info */}
                <div>
                  <h3 className="font-medium text-white mb-1 group-hover:text-primary-400 transition-colors">
                    {project.name}
                  </h3>
                  <p className="text-sm text-gray-400 mb-3 line-clamp-2">
                    {project.description}
                  </p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{project.duration}s</span>
                    <span>
                      {new Date(project.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}