import { Dialog, DialogTitle, DialogBody, DialogActions } from '@/Components/catalyst/dialog';
import { Button } from '@/Components/catalyst/button';
import { Field, Label, ErrorMessage } from '@/Components/catalyst/fieldset';
import { Input } from '@/Components/catalyst/input';
import { Text } from '@/Components/catalyst/text';
import { useState } from 'react';
import { Eye, EyeOff, Loader2 } from 'lucide-react';

export default function ElevenLabsConnectModal({ open, onClose, onConnected, reconnect = false }) {
    const [apiKey, setApiKey] = useState('');
    const [showKey, setShowKey] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    async function handleConnect() {
        setLoading(true);
        setError('');
        try {
            const res = await fetch('/settings/elevenlabs/connect', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content,
                    'X-Requested-With': 'XMLHttpRequest',
                },
                body: JSON.stringify({ api_key: apiKey }),
            });
            const data = await res.json();
            if (data.success) {
                onConnected(data.account);
                onClose();
                setApiKey('');
            } else {
                setError(data.error || 'Connection failed.');
            }
        } catch {
            setError('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>{reconnect ? 'Update ElevenLabs API Key' : 'Connect ElevenLabs'}</DialogTitle>
            <DialogBody>
                <Text>Enter your ElevenLabs API key to connect your account.</Text>
                <Field className="mt-4">
                    <Label>API Key</Label>
                    <div className="relative">
                        <Input
                            type={showKey ? 'text' : 'password'}
                            value={apiKey}
                            onChange={(e) => setApiKey(e.target.value)}
                            placeholder="Enter your API key"
                        />
                        <button
                            type="button"
                            onClick={() => setShowKey(!showKey)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400"
                        >
                            {showKey ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                        </button>
                    </div>
                    {error && <ErrorMessage>{error}</ErrorMessage>}
                </Field>
            </DialogBody>
            <DialogActions>
                <Button outline onClick={onClose}>Cancel</Button>
                <Button onClick={handleConnect} disabled={loading || apiKey.length < 20}>
                    {loading ? <Loader2 className="size-4 animate-spin" /> : 'Test & Connect'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
