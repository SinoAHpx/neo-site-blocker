import { useState, useEffect } from 'react'
import type { BlockedSite } from './types'

const Logo = () => (
  <div className="flex items-center gap-2">
    <img src="/icons/logo.svg" alt="Website Blocker Logo" className="w-8 h-8" />
    <h1 className="text-xl font-semibold text-gray-800 dark:text-white">Site Blocker</h1>
  </div>
)

const DarkModeToggle = ({ isDark, onToggle }: { isDark: boolean; onToggle: () => void }) => (
  <button
    onClick={onToggle}
    className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
    aria-label="Toggle dark mode"
  >
    {isDark ? (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
        />
      </svg>
    ) : (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
        />
      </svg>
    )}
  </button>
)

const Input = ({
  value,
  onChange,
  onKeyDown,
}: {
  value: string
  onChange: (value: string) => void
  onKeyDown: (e: React.KeyboardEvent) => void
}) => (
  <div className="relative">
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={onKeyDown}
      placeholder="Enter website URL... (e.g., example.com)"
      className="input pr-20"
      aria-label="Website URL input"
    />
  </div>
)

const AddButton = ({ onClick }: { onClick: () => void }) => (
  <button onClick={onClick} className="btn-primary absolute right-1 top-1 py-1" aria-label="Add website">
    Add
  </button>
)

const ErrorMessage = ({ message }: { message: string }) => (
  <p className="text-sm text-red-500 dark:text-red-400">{message}</p>
)

const SiteItem = ({
  site,
  onToggle,
  onDelete,
}: {
  site: BlockedSite
  onToggle: (id: string) => void
  onDelete: (id: string) => void
}) => (
  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg animate-fade-in">
    <span className="text-gray-700 dark:text-gray-200 truncate max-w-[200px]" title={site.url}>
      {site.url}
    </span>
    <div className="flex items-center gap-2">
      <button
        onClick={() => onToggle(site.id)}
        className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
          site.isBlocked
            ? 'bg-red-100 text-red-600 dark:bg-red-900/50 dark:text-red-400'
            : 'bg-green-100 text-green-600 dark:bg-green-900/50 dark:text-green-400'
        }`}
        aria-label={`${site.isBlocked ? 'Unblock' : 'Block'} ${site.url}`}
      >
        {site.isBlocked ? 'Blocked' : 'Allowed'}
      </button>
      <button
        onClick={() => onDelete(site.id)}
        className="p-1 text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400 transition-colors"
        aria-label={`Delete ${site.url}`}
      >
        <svg className="w-5 h-5" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
          <path d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  </div>
)

const EmptyListMessage = () => (
  <div className="text-center py-8">
    <p className="text-gray-500 dark:text-gray-400">No websites blocked yet.</p>
    <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Add a website to get started.</p>
  </div>
)

export const Popup = () => {
  const [sites, setSites] = useState<BlockedSite[]>([])
  const [newUrl, setNewUrl] = useState('')
  const [error, setError] = useState('')
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    // Load blocked sites from chrome storage on component mount
    chrome.storage.sync.get({ blockedSites: [] }, (data) => {
      setSites(data.blockedSites)
    })

    // Set initial dark mode based on system preference
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setIsDark(true)
      document.documentElement.classList.add('dark')
    }
  }, [])

  useEffect(() => {
    // Save blocked sites to chrome storage whenever the sites state changes
    if (sites.length > 0) {
      chrome.storage.sync.set({ blockedSites: sites })
    }
  }, [sites])

  const handleToggleDarkMode = () => {
    setIsDark(!isDark)
    document.documentElement.classList.toggle('dark')
  }

  const validateUrl = (url: string) => {
    try {
      new URL(url.startsWith('http') ? url : `https://${url}`)
      return true
    } catch {
      return false
    }
  }

  const handleAddSite = () => {
    setError('')
    if (!newUrl) {
      setError('Please enter a URL')
      return
    }

    if (!validateUrl(newUrl)) {
      setError('Please enter a valid URL')
      return
    }

    const formattedUrl = newUrl.startsWith('http') ? newUrl : `https://${newUrl}`
    const newSite: BlockedSite = {
      id: crypto.randomUUID(),
      url: formattedUrl,
      isBlocked: true,
    }

    setSites([...sites, newSite])
    setNewUrl('')
  }

  const handleToggleBlock = (id: string) => {
    setSites(
      sites.map((site) => (site.id === id ? { ...site, isBlocked: !site.isBlocked } : site)),
    )
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
    <div className="w-[400px] min-h-[300px] p-4 bg-white dark:bg-gray-800 animate-fade-in">
      <header className="flex items-center justify-between mb-6">
        <Logo />
        <DarkModeToggle isDark={isDark} onToggle={handleToggleDarkMode} />
      </header>
      <div className="space-y-4">
        <div className="relative">
          <Input value={newUrl} onChange={setNewUrl} onKeyDown={handleKeyDown} />
          <AddButton onClick={handleAddSite} />
        </div>
        {error && <ErrorMessage message={error} />}

        <div className="space-y-3">
          {sites.map((site) => (
            <SiteItem key={site.id} site={site} onToggle={handleToggleBlock} onDelete={handleDeleteSite} />
          ))}
          {sites.length === 0 && <EmptyListMessage />}
        </div>
      </div>
    </div>
  )
}