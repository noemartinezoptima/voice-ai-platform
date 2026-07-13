import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout'
import { Head, useForm, router } from '@inertiajs/react'
import { useState } from 'react'
import { Heading, Subheading } from '@/Components/catalyst/heading'
import { Text } from '@/Components/catalyst/text'
import { Button } from '@/Components/catalyst/button'
import { Badge } from '@/Components/catalyst/badge'
import { Input } from '@/Components/catalyst/input'
import { Select } from '@/Components/catalyst/select'
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '@/Components/catalyst/table'
import { Alert, AlertDescription } from '@/Components/catalyst/alert'
import { Phone, PhoneOff, Search, Loader2, Check, X } from 'lucide-react'

const COUNTRIES = [
    { code: 'US', label: 'United States' },
    { code: 'MX', label: 'Mexico' },
    { code: 'GB', label: 'United Kingdom' },
    { code: 'CA', label: 'Canada' },
    { code: 'AU', label: 'Australia' },
]

function CapabilityIcon({ enabled }) {
    return enabled
        ? <Check className="size-4 text-emerald-500" />
        : <X className="size-4 text-zinc-300" />
}

export default function Index({ connected, numbers, flows, error }) {
    const [searchCountry, setSearchCountry] = useState('US')
    const [searchAreaCode, setSearchAreaCode] = useState('')
    const [searchContains, setSearchContains] = useState('')
    const [searchResults, setSearchResults] = useState([])
    const [searching, setSearching] = useState(false)
    const [searchError, setSearchError] = useState(null)

    const flowMap = {}
    flows.forEach((flow) => {
        if (flow.phone_number) {
            flowMap[flow.phone_number] = flow.name
        }
    })

    function handleSearch(e) {
        e.preventDefault()
        setSearching(true)
        setSearchError(null)

        const params = new URLSearchParams()
        params.set('country', searchCountry)
        if (searchAreaCode.trim()) params.set('area_code', searchAreaCode.trim())
        if (searchContains.trim()) params.set('contains', searchContains.trim())

        fetch(`/settings/phone-numbers/search?${params.toString()}`)
            .then((res) => res.json())
            .then((data) => {
                if (data.error) {
                    setSearchError(data.error)
                    setSearchResults([])
                } else {
                    setSearchResults(data.numbers || [])
                }
            })
            .catch(() => setSearchError('Search failed. Please try again.'))
            .finally(() => setSearching(false))
    }

    return (
        <AuthenticatedLayout>
            <Head title="Phone Numbers" />

            <div className="flex items-end justify-between">
                <div>
                    <Heading>Phone Numbers</Heading>
                    <Text className="mt-1">Manage your Twilio phone numbers and assign them to flows.</Text>
                </div>
            </div>

            {!connected && (
                <Alert className="mt-6">
                    <PhoneOff className="size-5" />
                    <AlertDescription>
                        Twilio credentials are not configured. Add your Account SID and Auth Token in{' '}
                        <a href="/settings/tenant" className="underline font-medium">Tenant Settings</a>.
                    </AlertDescription>
                </Alert>
            )}

            {error && connected && (
                <Alert className="mt-6">
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {connected && !error && (
                <>
                    <div className="mt-8 rounded-xl border border-zinc-950/5 bg-white p-8 dark:border-white/10 dark:bg-zinc-900">
                        <Subheading>Your Numbers</Subheading>
                        <Text className="mt-1">Numbers you own on your Twilio account.</Text>

                        <div className="mt-4">
                            {numbers.length === 0 ? (
                                <Text className="text-zinc-500">No phone numbers found on your Twilio account.</Text>
                            ) : (
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableHeader>Phone Number</TableHeader>
                                            <TableHeader>Friendly Name</TableHeader>
                                            <TableHeader>Capabilities</TableHeader>
                                            <TableHeader>Assigned Flow</TableHeader>
                                            <TableHeader className="text-right">Actions</TableHeader>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {numbers.map((number) => (
                                            <TableRow key={number.sid}>
                                                <TableCell className="font-mono">{number.phone_number}</TableCell>
                                                <TableCell>{number.friendly_name}</TableCell>
                                                <TableCell>
                                                    <div className="flex gap-2">
                                                        <span className="flex items-center gap-1 text-xs">
                                                            <CapabilityIcon enabled={number.capabilities?.voice} />
                                                            Voice
                                                        </span>
                                                        <span className="flex items-center gap-1 text-xs">
                                                            <CapabilityIcon enabled={number.capabilities?.sms} />
                                                            SMS
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    {flowMap[number.phone_number]
                                                        ? <Badge>{flowMap[number.phone_number]}</Badge>
                                                        : <Text className="text-zinc-400 text-sm">—</Text>
                                                    }
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Button
                                                        outline
                                                        onClick={() => {
                                                            if (confirm('Release this phone number? This cannot be undone.')) {
                                                                router.delete('/settings/phone-numbers/release', {
                                                                    data: { sid: number.sid, phone_number: number.phone_number },
                                                                    preserveScroll: true,
                                                                })
                                                            }
                                                        }}
                                                    >
                                                        Release
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                        </div>
                    </div>

                    <div className="mt-8 rounded-xl border border-zinc-950/5 bg-white p-8 dark:border-white/10 dark:bg-zinc-900">
                        <div className="flex items-center gap-2">
                            <Search className="size-5 text-zinc-500" />
                            <Subheading>Buy a Number</Subheading>
                        </div>
                        <Text className="mt-1">Search for available Twilio numbers to purchase.</Text>

                        <form onSubmit={handleSearch} className="mt-4 space-y-4">
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                                <div>
                                    <Select
                                        value={searchCountry}
                                        onChange={(e) => setSearchCountry(e.target.value)}
                                    >
                                        {COUNTRIES.map((c) => (
                                            <option key={c.code} value={c.code}>{c.label}</option>
                                        ))}
                                    </Select>
                                </div>
                                <div>
                                    <Input
                                        value={searchAreaCode}
                                        onChange={(e) => setSearchAreaCode(e.target.value)}
                                        placeholder="Area code (optional)"
                                    />
                                </div>
                                <div>
                                    <Input
                                        value={searchContains}
                                        onChange={(e) => setSearchContains(e.target.value)}
                                        placeholder="Number contains (optional)"
                                    />
                                </div>
                            </div>

                            <Button type="submit" disabled={searching}>
                                {searching && <Loader2 className="size-4 animate-spin" />}
                                {searching ? 'Searching...' : 'Search'}
                            </Button>
                        </form>

                        {searchError && (
                            <Alert className="mt-4">
                                <AlertDescription>{searchError}</AlertDescription>
                            </Alert>
                        )}

                        {searchResults.length > 0 && (
                            <div className="mt-4">
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableHeader>Phone Number</TableHeader>
                                            <TableHeader>Locality</TableHeader>
                                            <TableHeader>Region</TableHeader>
                                            <TableHeader className="text-right">Actions</TableHeader>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {searchResults.map((number) => (
                                            <TableRow key={number.phone_number}>
                                                <TableCell className="font-mono">{number.phone_number}</TableCell>
                                                <TableCell>{number.locality ?? '—'}</TableCell>
                                                <TableCell>{number.region ?? '—'}</TableCell>
                                                <TableCell className="text-right">
                                                    <Button
                                                        outline
                                                        onClick={() => {
                                                            if (confirm(`Buy ${number.phone_number}?`)) {
                                                                router.post('/settings/phone-numbers/buy', {
                                                                    phone_number: number.phone_number,
                                                                }, { preserveScroll: true })
                                                            }
                                                        }}
                                                    >
                                                        Buy
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </div>
                </>
            )}
        </AuthenticatedLayout>
    )
}
