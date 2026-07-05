import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { Heading, Subheading } from '@/Components/catalyst/heading';
import { Text } from '@/Components/catalyst/text';
import { Button } from '@/Components/catalyst/button';
import { Field, Label, ErrorMessage } from '@/Components/catalyst/fieldset';
import { Input } from '@/Components/catalyst/input';
import { Select } from '@/Components/catalyst/select';
import { Eye, EyeOff, Phone, Key } from 'lucide-react';

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
        elevenlabs_api_key: tenant.elevenlabs_api_key ?? '',
        elevenlabs_default_voice_id: tenant.elevenlabs_default_voice_id ?? '',
    });

    const [showTwilioToken, setShowTwilioToken] = useState(false);
    const [showElevenlabsKey, setShowElevenlabsKey] = useState(false);

    function submit(e) {
        e.preventDefault();
        patch('/settings/tenant', {
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
                        <div className="mt-4 space-y-4">
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
                    </div>

                    <div className="rounded-xl border border-zinc-950/5 bg-white p-8 dark:border-white/10 dark:bg-zinc-900">
                        <div className="flex items-center gap-2">
                            <Key className="size-5 text-zinc-500" />
                            <Subheading>ElevenLabs</Subheading>
                        </div>
                        <Text className="mt-1">Configure your ElevenLabs voice synthesis settings.</Text>
                        <div className="mt-4 space-y-4">
                            <Field>
                                <Label>API Key</Label>
                                <div className="relative">
                                    <Input
                                        type={showElevenlabsKey ? 'text' : 'password'}
                                        value={data.elevenlabs_api_key}
                                        onChange={(e) => setData('elevenlabs_api_key', e.target.value)}
                                        placeholder={tenant.elevenlabs_api_key ? '********' : 'Enter API key'}
                                        invalid={errors.elevenlabs_api_key ? true : undefined}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowElevenlabsKey(!showElevenlabsKey)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                                        tabIndex={-1}
                                    >
                                        {showElevenlabsKey ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                                    </button>
                                </div>
                                {errors.elevenlabs_api_key && <ErrorMessage>{errors.elevenlabs_api_key}</ErrorMessage>}
                            </Field>

                            <Field>
                                <Label>Default Voice ID</Label>
                                <Input
                                    value={data.elevenlabs_default_voice_id}
                                    onChange={(e) => setData('elevenlabs_default_voice_id', e.target.value)}
                                    placeholder="21m00Tcm4TlvDq8ikWAM"
                                    invalid={errors.elevenlabs_default_voice_id ? true : undefined}
                                />
                                {errors.elevenlabs_default_voice_id && <ErrorMessage>{errors.elevenlabs_default_voice_id}</ErrorMessage>}
                            </Field>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3">
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Saving...' : 'Save Settings'}
                        </Button>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
