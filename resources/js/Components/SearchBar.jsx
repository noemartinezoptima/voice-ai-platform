import { router } from '@inertiajs/react'
import { useEffect, useRef, useState } from 'react'
import { Search, Phone, GitBranch, MessageSquare, MessageSquareText, Loader2, X, FileText, ArrowRight } from 'lucide-react'

const TYPE_CONFIG = {
    call: { icon: Phone, label: 'Calls', color: 'text-blue-500', bg: 'bg-blue-50' },
    flow: { icon: GitBranch, label: 'Flows', color: 'text-emerald-500', bg: 'bg-emerald-50' },
    sms: { icon: MessageSquare, label: 'SMS', color: 'text-violet-500', bg: 'bg-violet-50' },
    transcript: { icon: MessageSquareText, label: 'Transcripts', color: 'text-amber-500', bg: 'bg-amber-50' },
}

export default function SearchBar() {
    const [query, setQuery] = useState('')
    const [results, setResults] = useState([])
    const [loading, setLoading] = useState(false)
    const [open, setOpen] = useState(false)
    const [selectedIndex, setSelectedIndex] = useState(-1)
    const [error, setError] = useState(null)
    const inputRef = useRef(null)
    const dropdownRef = useRef(null)
    const debounceRef = useRef(null)

    useEffect(() => {
        if (debounceRef.current) clearTimeout(debounceRef.current)
        setError(null)

        const trimmed = query.trim()
        if (trimmed.length < 2) {
            setResults([])
            setLoading(false)
            setOpen(false)
            return
        }

        setLoading(true)
        debounceRef.current = setTimeout(async () => {
            try {
                const resp = await fetch(`/search?q=${encodeURIComponent(trimmed)}`, {
                    headers: { 'X-Requested-With': 'XMLHttpRequest' },
                })

                if (!resp.ok) {
                    setError(`Error ${resp.status}`)
                    setResults([])
                    return
                }

                const data = await resp.json()
                setResults(data.data ?? [])
                setOpen(true)
                setSelectedIndex(-1)
            } catch {
                setError('Connection error')
                setResults([])
            } finally {
                setLoading(false)
            }
        }, 300)

        return () => {
            if (debounceRef.current) clearTimeout(debounceRef.current)
        }
    }, [query])

    function handleKeyDown(e) {
        if (!open || results.length === 0) return

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault()
                setSelectedIndex((prev) => (prev + 1) % results.length)
                break
            case 'ArrowUp':
                e.preventDefault()
                setSelectedIndex((prev) => (prev - 1 + results.length) % results.length)
                break
            case 'Enter':
                e.preventDefault()
                if (selectedIndex >= 0 && results[selectedIndex]) {
                    navigate(results[selectedIndex])
                }
                break
            case 'Escape':
                e.preventDefault()
                closeSearch()
                break
        }
    }

    function navigate(item) {
        setOpen(false)
        setQuery('')
        setResults([])
        setError(null)
        inputRef.current?.blur()
        router.visit(item.url)
    }

    function closeSearch() {
        setOpen(false)
        setSelectedIndex(-1)
        inputRef.current?.blur()
    }

    useEffect(() => {
        function handleClickOutside(e) {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(e.target) &&
                !inputRef.current?.contains(e.target)
            ) {
                setOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const grouped = results.reduce((acc, item, idx) => {
        if (!acc[item.type]) acc[item.type] = []
        acc[item.type].push({ ...item, _idx: idx })
        return acc
    }, {})

    const hasResults = Object.keys(grouped).length > 0
    const showDropdown = open && (hasResults || loading || error)

    return (
        <div className="relative w-full max-w-lg">
            <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400 dark:text-zinc-500" />
                <input
                    ref={inputRef}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onFocus={() => { if (results.length > 0) setOpen(true) }}
                    className="w-full rounded-lg border border-zinc-200 bg-white py-2 pl-10 pr-10 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-indigo-500 dark:focus:ring-indigo-900/50"
                    placeholder="Search calls, flows, transcripts..."
                    type="text"
                />
                {query.length > 0 && !loading && (
                    <button
                        onClick={() => { setQuery(''); setResults([]); setOpen(false) }}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-0.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
                    >
                        <X className="size-4" />
                    </button>
                )}
                {loading && (
                    <Loader2 className="absolute right-2.5 top-1/2 size-4 -translate-y-1/2 animate-spin text-indigo-500" />
                )}
            </div>

            {showDropdown && (
                <div
                    ref={dropdownRef}
                    className="absolute left-0 right-0 top-full z-50 mt-1.5 max-h-96 overflow-y-auto rounded-xl border border-zinc-200 bg-white shadow-lg ring-1 ring-black/5 dark:border-zinc-700 dark:bg-zinc-800 dark:ring-white/5"
                >
                    {loading && results.length === 0 && (
                        <div className="flex items-center gap-3 px-4 py-6 text-sm text-zinc-500 dark:text-zinc-400">
                            <Loader2 className="size-4 animate-spin text-indigo-500" />
                            Searching...
                        </div>
                    )}

                    {error && (
                        <div className="px-4 py-6 text-center text-sm text-red-500">
                            <p>Search failed ({error})</p>
                            <p className="mt-1 text-xs text-zinc-400">Try again or check connection</p>
                        </div>
                    )}

                    {!loading && !error && hasResults && (
                        <>
                            {Object.entries(grouped).map(([type, items]) => {
                                const config = TYPE_CONFIG[type] ?? { icon: Search, label: type, color: 'text-zinc-500', bg: 'bg-zinc-50' }
                                const Icon = config.icon
                                return (
                                    <div key={type}>
                                        <div className="flex items-center gap-2 px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                                            <Icon className={`size-3 ${config.color}`} />
                                            {config.label}
                                            <span className="ml-auto text-[10px] font-normal normal-case text-zinc-300 dark:text-zinc-600">
                                                {items.length} result{items.length !== 1 ? 's' : ''}
                                            </span>
                                        </div>
                                        {items.map((item) => (
                                            <button
                                                key={`${type}-${item.id}`}
                                                onClick={() => navigate(item)}
                                                onMouseEnter={() => setSelectedIndex(item._idx)}
                                                className={`flex w-full items-start gap-3 px-4 py-2.5 text-left transition-colors ${
                                                    item._idx === selectedIndex
                                                        ? 'bg-indigo-50 dark:bg-indigo-900/30'
                                                        : 'hover:bg-zinc-50 dark:hover:bg-zinc-700/50'
                                                }`}
                                            >
                                                <div className={`mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-md ${config.bg} dark:bg-zinc-700`}>
                                                    <Icon className={`size-3.5 ${config.color}`} />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <p className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-100">
                                                        {item.title}
                                                    </p>
                                                    <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">
                                                        {item.subtitle}
                                                    </p>
                                                </div>
                                                <div className="flex shrink-0 items-center gap-2">
                                                    {item.status && (
                                                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                                                            item.status === 'completed' || item.status === 'active'
                                                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400'
                                                                : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-700 dark:text-zinc-400'
                                                        }`}>
                                                            {item.status}
                                                        </span>
                                                    )}
                                                    {item._idx === selectedIndex && (
                                                        <ArrowRight className="size-3.5 shrink-0 text-indigo-400" />
                                                    )}
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )
                            })}

                            <div className="border-t border-zinc-100 px-4 py-2 text-center text-[10px] text-zinc-400 dark:border-zinc-700 dark:text-zinc-500">
                                <kbd className="rounded border border-zinc-200 px-1.5 py-0.5 text-[9px] font-mono dark:border-zinc-600">↑↓</kbd>
                                {' '}navigate{' '}
                                <kbd className="rounded border border-zinc-200 px-1.5 py-0.5 text-[9px] font-mono dark:border-zinc-600">↵</kbd>
                                {' '}select{' '}
                                <kbd className="rounded border border-zinc-200 px-1.5 py-0.5 text-[9px] font-mono dark:border-zinc-600">esc</kbd>
                                {' '}close
                            </div>
                        </>
                    )}

                    {!loading && !error && query.length >= 2 && !hasResults && (
                        <div className="flex flex-col items-center gap-2 px-4 py-8 text-center text-sm text-zinc-500 dark:text-zinc-400">
                            <FileText className="size-8 text-zinc-200 dark:text-zinc-600" />
                            <p>No results for "<span className="font-medium text-zinc-700 dark:text-zinc-300">{query}</span>"</p>
                            <p className="text-xs text-zinc-400 dark:text-zinc-500">Try different keywords</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
