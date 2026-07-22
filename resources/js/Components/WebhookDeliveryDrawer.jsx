import { useEffect, useRef } from 'react'
import { router } from '@inertiajs/react'
import { X, RotateCcw } from 'lucide-react'
import { Badge } from '@/Components/catalyst/badge'
import { Button } from '@/Components/catalyst/button'
import { Text } from '@/Components/catalyst/text'

const statusColors = { success: 'emerald', failed: 'red', pending: 'amber', dead: 'zinc' }

function timeAgo(date) {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000)
    if (seconds < 60) return 'just now'
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h ago`
    const days = Math.floor(hours / 24)
    if (days < 30) return `${days}d ago`
    return new Date(date).toLocaleDateString()
}

export default function WebhookDeliveryDrawer({ delivery, onClose }) {
    const panelRef = useRef(null)

    useEffect(() => {
        const handler = (e) => {
            if (e.key === 'Escape') onClose()
        }
        document.addEventListener('keydown', handler)
        return () => document.removeEventListener('keydown', handler)
    }, [onClose])

    useEffect(() => {
        panelRef.current?.focus()
    }, [delivery])

    function handleRetry() {
        router.post(`/settings/webhooks/deliveries/${delivery.id}/retry`, {}, {
            preserveScroll: true,
            onSuccess: () => onClose(),
        })
    }

    return (
        <div className="fixed inset-0 z-50 flex justify-end" data-testid="delivery-drawer">
            <div className="absolute inset-0 bg-black/20" onClick={onClose} />
            <div
                ref={panelRef}
                tabIndex={-1}
                className="relative flex w-full max-w-lg flex-col bg-white shadow-xl"
                data-testid="delivery-drawer-panel"
            >
                <div className="flex items-center justify-between border-b border-zinc-200 px-6 py-4">
                    <div>
                        <h2 className="text-base font-semibold text-zinc-900">Delivery Details</h2>
                        <Text className="text-xs">{timeAgo(delivery.created_at)}</Text>
                    </div>
                    <button onClick={onClose} className="rounded-md p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600">
                        <X className="size-5" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto">
                    <div className="space-y-6 px-6 py-5">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Text className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Event</Text>
                                <p className="mt-0.5 font-mono text-sm">{delivery.event}</p>
                            </div>
                            <div>
                                <Text className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Status</Text>
                                <div className="mt-0.5">
                                    <Badge color={statusColors[delivery.status] || 'zinc'}>{delivery.status}</Badge>
                                </div>
                            </div>
                            <div>
                                <Text className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Attempt</Text>
                                <p className="mt-0.5 text-sm">{delivery.attempt}</p>
                            </div>
                            <div>
                                <Text className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Response Code</Text>
                                <p className="mt-0.5 font-mono text-sm">{delivery.response_code ?? '—'}</p>
                            </div>
                        </div>

                        <div>
                            <Text className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Destination URL</Text>
                            <p className="mt-0.5 break-all text-sm">{delivery.webhook_destination?.url}</p>
                        </div>

                        {delivery.next_attempt_at && (
                            <div>
                                <Text className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Next Attempt</Text>
                                <p className="mt-0.5 text-sm">{new Date(delivery.next_attempt_at).toLocaleString()}</p>
                            </div>
                        )}

                        {delivery.status === 'failed' && (
                            <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <Text className="text-xs font-semibold text-red-700">Delivery Failed</Text>
                                        <p className="mt-0.5 text-xs text-red-600">
                                            Attempt {delivery.attempt} returned {delivery.response_code ?? 'no response'}
                                        </p>
                                    </div>
                                    <Button onClick={handleRetry} data-testid="drawer-retry-btn">
                                        <RotateCcw className="size-4" />
                                        Retry Now
                                    </Button>
                                </div>
                            </div>
                        )}

                        <div>
                            <Text className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Payload</Text>
                            <pre className="mt-1 max-h-48 overflow-auto rounded-lg bg-zinc-50 p-3 text-xs text-zinc-700">
                                {JSON.stringify(delivery.payload, null, 2)}
                            </pre>
                        </div>

                        {delivery.response_body && (
                            <div>
                                <Text className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Response Body</Text>
                                <pre className="mt-1 max-h-48 overflow-auto rounded-lg bg-zinc-50 p-3 text-xs text-zinc-700" data-testid="delivery-response-body">
                                    {delivery.response_body}
                                </pre>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
