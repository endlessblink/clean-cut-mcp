import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'

export default function VideoEditor() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async () => {
    setIsSaving(true)
    // TODO: Implement save functionality
    setTimeout(() => {
      setIsSaving(false)
    }, 1000)
  }

  const handleExport = async () => {
    // TODO: Implement export functionality
    alert('Export functionality coming soon!')
  }

  const handleBack = () => {
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      {/* Editor Header */}
      <div className="border-b border-gray-800 bg-gray-800/50 backdrop-blur">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleBack}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div>
              <h1 className="text-lg font-semibold text-white">
                {id ? 'Edit Project' : 'New Project'}
              </h1>
              <p className="text-sm text-gray-400">
                Professional video editor
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="btn btn-secondary disabled:opacity-50"
            >
              {isSaving ? (
                <div className="flex items-center">
                  <div className="loading-spinner w-4 h-4 mr-2"></div>
                  Saving...
                </div>
              ) : (
                'Save'
              )}
            </button>
            <button
              onClick={handleExport}
              className="btn btn-primary"
            >
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Editor Workspace */}
      <div className="flex-1 flex">
        {/* Left Sidebar - Tools & Assets */}
        <div className="w-64 border-r border-gray-800 bg-gray-800/50">
          <div className="p-4">
            <h3 className="text-sm font-medium text-gray-300 mb-4">Tools</h3>
            <div className="space-y-2">
              <button className="w-full text-left px-3 py-2 text-sm text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors">
                Text
              </button>
              <button className="w-full text-left px-3 py-2 text-sm text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors">
                Media
              </button>
              <button className="w-full text-left px-3 py-2 text-sm text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors">
                Effects
              </button>
              <button className="w-full text-left px-3 py-2 text-sm text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors">
                Transitions
              </button>
              <button className="w-full text-left px-3 py-2 text-sm text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors">
                Audio
              </button>
            </div>
          </div>

          <div className="p-4 border-t border-gray-700">
            <h3 className="text-sm font-medium text-gray-300 mb-4">Templates</h3>
            <div className="space-y-2">
              <button className="w-full text-left px-3 py-2 text-sm text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors">
                Logo Reveal
              </button>
              <button className="w-full text-left px-3 py-2 text-sm text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors">
                Text Animation
              </button>
              <button className="w-full text-left px-3 py-2 text-sm text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors">
                Product Showcase
              </button>
              <button className="w-full text-left px-3 py-2 text-sm text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors">
                Social Media
              </button>
            </div>
          </div>
        </div>

        {/* Main Editor Area */}
        <div className="flex-1 flex flex-col">
          {/* Preview Area */}
          <div className="flex-1 p-8">
            <div className="h-full flex items-center justify-center">
              <div className="video-preview">
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-center">
                    <svg
                      className="w-16 h-16 text-gray-600 mx-auto mb-4"
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
                    <p className="text-gray-400 mb-4">
                      Video preview will appear here
                    </p>
                    <p className="text-sm text-gray-500">
                      This is where we'll integrate React Video Editor
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Timeline Area */}
          <div className="border-t border-gray-800 bg-gray-800/50">
            <div className="p-4">
              <div className="video-timeline">
                <h3 className="text-sm font-medium text-gray-300 mb-3">Timeline</h3>
                <div className="space-y-2">
                  {/* Video Track */}
                  <div className="timeline-track">
                    <div className="absolute left-2 top-1/2 transform -translate-y-1/2 text-xs text-gray-400">
                      Video
                    </div>
                    <div className="timeline-clip left-12 w-32">
                      <span className="text-xs text-white px-2 py-1">Clip 1</span>
                    </div>
                  </div>

                  {/* Audio Track */}
                  <div className="timeline-track">
                    <div className="absolute left-2 top-1/2 transform -translate-y-1/2 text-xs text-gray-400">
                      Audio
                    </div>
                    <div className="timeline-clip left-8 w-48 bg-green-600 hover:bg-green-500">
                      <span className="text-xs text-white px-2 py-1">Audio 1</span>
                    </div>
                  </div>

                  {/* Text Track */}
                  <div className="timeline-track">
                    <div className="absolute left-2 top-1/2 transform -translate-y-1/2 text-xs text-gray-400">
                      Text
                    </div>
                    <div className="timeline-clip left-16 w-24 bg-purple-600 hover:bg-purple-500">
                      <span className="text-xs text-white px-2 py-1">Title</span>
                    </div>
                  </div>
                </div>

                {/* Timeline Controls */}
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-700">
                  <div className="flex items-center space-x-2">
                    <button className="text-gray-400 hover:text-white">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      </svg>
                    </button>
                    <button className="text-gray-400 hover:text-white">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </button>
                  </div>
                  <div className="text-sm text-gray-400">
                    00:00 / 00:30
                  </div>
                  <div className="flex items-center space-x-2">
                    <button className="text-gray-400 hover:text-white">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                      </svg>
                    </button>
                    <button className="text-gray-400 hover:text-white">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar - Properties */}
        <div className="w-64 border-l border-gray-800 bg-gray-800/50">
          <div className="p-4">
            <h3 className="text-sm font-medium text-gray-300 mb-4">Properties</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Duration</label>
                <input
                  type="text"
                  className="input text-sm"
                  defaultValue="00:30"
                  readOnly
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Resolution</label>
                <select className="input text-sm">
                  <option>1920x1080 (Full HD)</option>
                  <option>1280x720 (HD)</option>
                  <option>3840x2160 (4K)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Frame Rate</label>
                <select className="input text-sm">
                  <option>30 fps</option>
                  <option>60 fps</option>
                  <option>24 fps</option>
                </select>
              </div>
            </div>
          </div>

          <div className="p-4 border-t border-gray-700">
            <h3 className="text-sm font-medium text-gray-300 mb-4">Export Settings</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Format</label>
                <select className="input text-sm">
                  <option>MP4</option>
                  <option>MOV</option>
                  <option>WebM</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Quality</label>
                <select className="input text-sm">
                  <option>High</option>
                  <option>Medium</option>
                  <option>Low</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}