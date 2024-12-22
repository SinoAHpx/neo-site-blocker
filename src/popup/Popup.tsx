import { useState } from 'react'
import type { BlockedSite } from './types'

export const Popup = () => {
  const [sites, setSites] = useState<BlockedSite[]>([])
  const [newUrl, setNewUrl] = useState('')

  const handleAddSite = () => {
    if (!newUrl) return

    const newSite: BlockedSite = {
      id: crypto.randomUUID(),
      url: newUrl,
      isBlocked: true,
    }

    setSites([...sites, newSite])
    setNewUrl('')
  }

  const handleToggleBlock = (id: string) => {
    setSites(sites.map((site) => (site.id === id ? { ...site, isBlocked: !site.isBlocked } : site)))
  }

  const handleDeleteSite = (id: string) => {
    setSites(sites.filter((site) => site.id !== id))
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddSite()
    }
  }

  return (
    <div className="w-[400px] p-4 bg-white">
      <header className="flex items-center gap-2 mb-6">
        <img src="/icons/logo.svg" alt="Website Blocker Logo" className="w-8 h-8" />
        <h1 className="text-xl font-semibold text-gray-800">awd Blocker</h1>
      </header>

      <div className="flex gap-2 mb-6">
        <input
          type="text"
          value={newUrl}
          onChange={(e) => setNewUrl(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Enter website URL..."
          className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Website URL input"
        />
        <button
          onClick={handleAddSite}
          className="px-4 py-2 text-white bg-blue-500 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          aria-label="Add website"
        >
          Add
        </button>
      </div>

      <div className="space-y-3">
        {sites.map((site) => (
          <div
            key={site.id}
            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
          >
            <span className="text-gray-700">{site.url}</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleToggleBlock(site.id)}
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  site.isBlocked ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
                }`}
                aria-label={`${site.isBlocked ? 'Unblock' : 'Block'} ${site.url}`}
              >
                {site.isBlocked ? 'Blocked' : 'Allowed'}
              </button>
              <button
                onClick={() => handleDeleteSite(site.id)}
                className="p-1 text-gray-400 hover:text-gray-600"
                aria-label={`Delete ${site.url}`}
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        ))}
        {sites.length === 0 && (
          <p className="text-center text-gray-500 py-4">
            No websites blocked yet. Add a website to get started.
          </p>
        )}
      </div>
    </div>
  )
}
