import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import ConnectTwilioButton from '@/Components/ConnectTwilioButton';
import ElevenLabsConnectModal from '@/Components/ElevenLabsConnectModal';
import { Head, useForm, router } from '@inertiajs/react';
import { useState } from 'react';
import { Heading, Subheading } from '@/Components/catalyst/heading';
import { Text } from '@/Components/catalyst/text';
import { Button } from '@/Components/catalyst/button';
import { Badge } from '@/Components/catalyst/badge';
import { Field, Label, ErrorMessage } from '@/Components/catalyst/fieldset';
import { Input } from '@/Components/catalyst/input';
import { Select } from '@/Components/catalyst/select';
import { Eye, EyeOff, Phone, Key } from 'lucide-react';
import { update } from '@/actions/App/Http/Controllers/Web/TenantSettingsController';
import { disconnect } from '@/actions/App/Http/Controllers/Web/TwilioOAuthController';

export default function Tenant({ tenant }) {
    const { data, setData, patch, processing, errors } = useForm({
        name: tenant.name ?? '',
        slug: tenant.slug ?? '',
        timezone: tenant.timezone ?? 'UTC',
        locale: tenant.locale ?? 'en',
        status: tenant.status ?? 'active',
        twilio_account_sid: tenant.twilio_account_sid ?? '',
        twilio_auth_token: tenant.twilio_auth_token ?? '',
        twilio_phone_number: tenant.twilio_phone_number ?? '',
        elevenlabs_default_voice_id: tenant.elevenlabs_default_voice_id ?? '',
    });

    const [showTwilioToken, setShowTwilioToken] = useState(false);
    const [showElevenLabsModal, setShowElevenLabsModal] = useState(false);

    function submit(e) {
        e.preventDefault();
        patch(update().url, {
            preserveScroll: true,
        });
    }

    return (
        <AuthenticatedLayout>
            <Head title="Tenant Settings" />

            <div className="flex items-end justify-between">
                <div>
                    <Heading>Tenant Settings</Heading>
                    <Text className="mt-1">Configure your workspace settings and integrations.</Text>
                </div>
            </div>

            <div className="mt-8 max-w-2xl">
                <form onSubmit={submit} className="space-y-6">
                    <div className="rounded-xl border border-zinc-950/5 bg-white p-8 dark:border-white/10 dark:bg-zinc-900">
                        <Subheading>General</Subheading>
                        <div className="mt-4 space-y-4">
                            <Field>
                                <Label>Tenant Name</Label>
                                <Input
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    invalid={errors.name ? true : undefined}
                                />
                                {errors.name && <ErrorMessage>{errors.name}</ErrorMessage>}
                            </Field>

                            <Field>
                                <Label>Slug</Label>
                                <Input
                                    value={data.slug}
                                    onChange={(e) => setData('slug', e.target.value)}
                                    invalid={errors.slug ? true : undefined}
                                />
                                {errors.slug && <ErrorMessage>{errors.slug}</ErrorMessage>}
                            </Field>
                        </div>
                    </div>

                    <div className="rounded-xl border border-zinc-950/5 bg-white p-8 dark:border-white/10 dark:bg-zinc-900">
                        <Subheading>Localization</Subheading>
                        <div className="mt-4 space-y-4">
                            <Field>
                                <Label>Timezone</Label>
                                <Select
                                    value={data.timezone}
                                    onChange={(e) => setData('timezone', e.target.value)}
                                    invalid={errors.timezone ? true : undefined}
                                >
                                    <option value="UTC">UTC</option>
                                    <option value="America/New_York">Eastern (US)</option>
                                    <option value="America/Chicago">Central (US)</option>
                                    <option value="America/Denver">Mountain (US)</option>
                                    <option value="America/Los_Angeles">Pacific (US)</option>
                                    <option value="America/Anchorage">Alaska (US)</option>
                                    <option value="Pacific/Honolulu">Hawaii (US)</option>
                                    <option value="Europe/London">London (UK)</option>
                                    <option value="Europe/Madrid">Madrid (EU)</option>
                                </Select>
                                {errors.timezone && <ErrorMessage>{errors.timezone}</ErrorMessage>}
                            </Field>

                            <Field>
                                <Label>Locale</Label>
                                <Select
                                    value={data.locale}
                                    onChange={(e) => setData('locale', e.target.value)}
                                    invalid={errors.locale ? true : undefined}
                                >
                                    <option value="en">English</option>
                                    <option value="es">Spanish</option>
                                    <option value="fr">French</option>
                                </Select>
                                {errors.locale && <ErrorMessage>{errors.locale}</ErrorMessage>}
                            </Field>
                        </div>
                    </div>

                    <div className="rounded-xl border border-zinc-950/5 bg-white p-8 dark:border-white/10 dark:bg-zinc-900">
                        <Subheading>Status</Subheading>
                        <div className="mt-4 space-y-4">
                            <Field>
                                <Label>Workspace Status</Label>
                                <Select
                                    value={data.status}
                                    onChange={(e) => setData('status', e.target.value)}
                                    invalid={errors.status ? true : undefined}
                                >
                                    <option value="active">Active</option>
                                    <option value="suspended">Suspended</option>
                                </Select>
                                {errors.status && <ErrorMessage>{errors.status}</ErrorMessage>}
                            </Field>
                        </div>
                    </div>

                    <div className="rounded-xl border border-zinc-950/5 bg-white p-8 dark:border-white/10 dark:bg-zinc-900">
                        <div className="flex items-center gap-2">
                            <Phone className="size-5 text-zinc-500" />
                            <Subheading>Twilio</Subheading>
                        </div>
                        <Text className="mt-1">Configure your Twilio account for phone call handling.</Text>

                        {tenant.twilio_oauth_enabled ? (
                            <div className="mt-4 space-y-4">
                                <div className="flex items-center gap-3 rounded-lg bg-emerald-50 p-4 dark:bg-emerald-900/20">
                                    <Badge color="emerald">Connected</Badge>
                                    <Text>Account {tenant.twilio_account_sid_oauth ?? 'connected'} — {tenant.twilio_connected_at ? new Date(tenant.twilio_connected_at).toLocaleDateString() : ''}</Text>
                                </div>
                                <Button outline onClick={() => router.post(disconnect().url)}>
                                    Disconnect
                                </Button>
                            </div>
                        ) : (
                            <div className="mt-4 space-y-4">
                                <ConnectTwilioButton href={tenant.connectUrl} />
                                <Field>
                                    <Label>Account SID</Label>
                                    <Input
                                        value={data.twilio_account_sid}
                                        onChange={(e) => setData('twilio_account_sid', e.target.value)}
                                        placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                                        invalid={errors.twilio_account_sid ? true : undefined}
                                    />
                                    {errors.twilio_account_sid && <ErrorMessage>{errors.twilio_account_sid}</ErrorMessage>}
                                </Field>

                                <Field>
                                    <Label>Auth Token</Label>
                                    <div className="relative">
                                        <Input
                                            type={showTwilioToken ? 'text' : 'password'}
                                            value={data.twilio_auth_token}
                                            onChange={(e) => setData('twilio_auth_token', e.target.value)}
                                            placeholder={tenant.twilio_auth_token ? '********' : 'Enter auth token'}
                                            invalid={errors.twilio_auth_token ? true : undefined}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowTwilioToken(!showTwilioToken)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                                            tabIndex={-1}
                                        >
                                            {showTwilioToken ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                                        </button>
                                    </div>
                                    {errors.twilio_auth_token && <ErrorMessage>{errors.twilio_auth_token}</ErrorMessage>}
                                </Field>

                                <Field>
                                    <Label>Default Phone Number</Label>
                                    <Input
                                        value={data.twilio_phone_number}
                                        onChange={(e) => setData('twilio_phone_number', e.target.value)}
                                        placeholder="+12345678900"
                                        invalid={errors.twilio_phone_number ? true : undefined}
                                    />
                                    {errors.twilio_phone_number && <ErrorMessage>{errors.twilio_phone_number}</ErrorMessage>}
                                </Field>
                            </div>
                        )}
                    </div>

                    <div className="rounded-xl border border-zinc-950/5 bg-white p-8 dark:border-white/10 dark:bg-zinc-900">
                        <div className="flex items-center gap-2">
                            <Key className="size-5 text-zinc-500" />
                            <Subheading>ElevenLabs</Subheading>
                        </div>
                        <Text className="mt-1">Configure your ElevenLabs voice synthesis settings.</Text>

                        {tenant.elevenlabs_connected_at ? (
                            <div className="mt-4 space-y-4">
                                <div className="flex items-center gap-3 rounded-lg bg-emerald-50 p-4 dark:bg-emerald-900/20">
                                    <Badge color="emerald">Connected</Badge>
                                    <Text>Tier: {tenant.elevenlabs_subscription_tier ?? 'unknown'}</Text>
                                </div>
                                <div className="w-full bg-zinc-200 rounded-full h-2 dark:bg-zinc-700">
                                    <div
                                        className="bg-indigo-500 h-2 rounded-full"
                                        style={{ width: `${Math.min(100, ((tenant.elevenlabs_character_count ?? 0) / (tenant.elevenlabs_character_limit ?? 1)) * 100)}%` }}
                                    />
                                </div>
                                <Text>{tenant.elevenlabs_character_count ?? 0} / {tenant.elevenlabs_character_limit ?? 0} characters used</Text>
                                <Button outline onClick={() => setShowElevenLabsModal(true)}>Reconnect</Button>
                            </div>
                        ) : (
                            <Button outline className="mt-4" onClick={() => setShowElevenLabsModal(true)}>Connect ElevenLabs</Button>
                        )}
                    </div>

                    <div className="flex justify-end gap-3">
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Saving...' : 'Save Settings'}
                        </Button>
                    </div>
                </form>
            </div>

            <ElevenLabsConnectModal
                open={showElevenLabsModal}
                onClose={() => setShowElevenLabsModal(false)}
                onConnected={() => router.reload()}
                reconnect={!!tenant.elevenlabs_connected_at}
            />
        </AuthenticatedLayout>
    );
}
