import { router } from '@inertiajs/react'
import { useEffect, useRef, useState } from 'react'
import { Search, Phone, GitBranch, MessageSquare, MessageSquareText, Loader2 } from 'lucide-react'

const TYPE_CONFIG = {
    call: { icon: Phone, label: 'Calls', color: 'text-blue-500' },
    flow: { icon: GitBranch, label: 'Flows', color: 'text-emerald-500' },
    sms: { icon: MessageSquare, label: 'SMS', color: 'text-violet-500' },
    transcript: { icon: MessageSquareText, label: 'Transcripts', color: 'text-amber-500' },
}

export default function SearchBar() {
    const [query, setQuery] = useState('')
    const [results, setResults] = useState([])
    const [loading, setLoading] = useState(false)
    const [open, setOpen] = useState(false)
    const [selectedIndex, setSelectedIndex] = useState(-1)
    const inputRef = useRef(null)
    const dropdownRef = useRef(null)
    const debounceRef = useRef(null)

    useEffect(() => {
        if (debounceRef.current) clearTimeout(debounceRef.current)

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
                const resp = await fetch(`/search?q=${encodeURIComponent(trimmed)}`)
                const data = await resp.json()
                setResults(data.data ?? [])
                setOpen(true)
                setSelectedIndex(-1)
            } catch {
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

    return (
        <div className="relative w-full max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
            <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                onFocus={() => { if (results.length > 0) setOpen(true) }}
                className="w-full rounded-lg border-none bg-zinc-100 py-2 pl-10 pr-10 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Search operations, agents, or flows..."
                type="text"
            />
            {loading && (
                <Loader2 className="absolute right-3 top-1/2 size-4 -translate-y-1/2 animate-spin text-zinc-400" />
            )}

            {open && hasResults && (
                <div
                    ref={dropdownRef}
                    className="absolute left-0 right-0 top-full z-50 mt-1 max-h-96 overflow-y-auto rounded-xl border border-zinc-200 bg-white shadow-lg"
                >
                    {Object.entries(grouped).map(([type, items]) => {
                        const config = TYPE_CONFIG[type] ?? { icon: Search, label: type, color: 'text-zinc-500' }
                        const Icon = config.icon
                        return (
                            <div key={type}>
                                <div className="flex items-center gap-2 px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                                    <Icon className={`size-3 ${config.color}`} />
                                    {config.label}
                                </div>
                                {items.map((item) => (
                                    <button
                                        key={`${type}-${item.id}`}
                                        onClick={() => navigate(item)}
                                        onMouseEnter={() => setSelectedIndex(item._idx)}
                                        className={`flex w-full items-start gap-3 px-4 py-2.5 text-left transition-colors ${
                                            item._idx === selectedIndex
                                                ? 'bg-indigo-50'
                                                : 'hover:bg-zinc-50'
                                        }`}
                                    >
                                        <div className={`mt-0.5 shrink-0 ${config.color}`}>
                                            <Icon className="size-4" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-sm font-medium text-zinc-900">{item.title}</p>
                                            <p className="truncate text-xs text-zinc-500">{item.subtitle}</p>
                                        </div>
                                        {item.status && (
                                            <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${
                                                item.status === 'completed' || item.status === 'active'
                                                    ? 'bg-emerald-100 text-emerald-700'
                                                    : 'bg-zinc-100 text-zinc-600'
                                            }`}>
                                                {item.status}
                                            </span>
                                        )}
                                    </button>
                                ))}
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
