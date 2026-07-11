import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { Heading, Subheading } from '@/Components/catalyst/heading';
import { Text } from '@/Components/catalyst/text';
import { Button } from '@/Components/catalyst/button';
import { Switch } from '@/Components/catalyst/switch';
import { Select } from '@/Components/catalyst/select';
import { Textarea } from '@/Components/catalyst/textarea';

export default function Index({ dataProtection }) {
    const { data, setData, patch, processing, errors } = useForm({
        consent_required: dataProtection.consent_required ?? false,
        retention_days: dataProtection.retention_days ?? 90,
        consent_message: dataProtection.consent_message ?? '',
        consent_recordings: dataProtection.consent_recordings ?? true,
        consent_transcripts: dataProtection.consent_transcripts ?? true,
    });

    function submit(e) {
        e.preventDefault();
        patch('/settings/data-protection', { preserveScroll: true });
    }

    return (
        <AuthenticatedLayout>
            <Head title="Data Protection" />

            <div className="flex items-end justify-between">
                <div>
                    <Heading>Data Protection</Heading>
                    <Text className="mt-1">Manage consent and data retention settings.</Text>
                </div>
            </div>

            <div className="mt-8 max-w-2xl">
                <form onSubmit={submit} className="space-y-6">
                    <div className="rounded-xl border border-zinc-950/5 bg-white p-8 dark:border-white/10 dark:bg-zinc-900">
                        <Subheading>Call Recording Consent</Subheading>

                        <div className="mt-4 flex items-center justify-between">
                            <div>
                                <Text className="font-medium">Require caller consent</Text>
                                <Text className="text-sm text-zinc-500">
                                    Play a disclosure message and require DTMF acceptance before recording.
                                </Text>
                            </div>
                            <Switch
                                checked={data.consent_required}
                                onChange={(checked) => setData('consent_required', checked)}
                            />
                        </div>

                        {data.consent_required && (
                            <>
                                <div className="mt-4">
                                    <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                                        Disclosure message
                                    </label>
                                    <Textarea
                                        value={data.consent_message}
                                        onChange={(e) => setData('consent_message', e.target.value)}
                                        rows={3}
                                    />
                                    {errors.consent_message && (
                                        <p className="mt-1 text-xs text-red-600">{errors.consent_message}</p>
                                    )}
                                </div>

                                <div className="mt-4 flex items-center justify-between">
                                    <div>
                                        <Text className="font-medium">Apply consent to recordings</Text>
                                    </div>
                                    <Switch
                                        checked={data.consent_recordings}
                                        onChange={(checked) => setData('consent_recordings', checked)}
                                    />
                                </div>

                                <div className="mt-4 flex items-center justify-between">
                                    <div>
                                        <Text className="font-medium">Apply consent to transcripts</Text>
                                    </div>
                                    <Switch
                                        checked={data.consent_transcripts}
                                        onChange={(checked) => setData('consent_transcripts', checked)}
                                    />
                                </div>
                            </>
                        )}
                    </div>

                    <div className="rounded-xl border border-zinc-950/5 bg-white p-8 dark:border-white/10 dark:bg-zinc-900">
                        <Subheading>Data Retention</Subheading>

                        <div className="mt-4">
                            <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                                Retention period
                            </label>
                            <Select
                                value={data.retention_days}
                                onChange={(e) => setData('retention_days', parseInt(e.target.value))}
                            >
                                <option value={30}>30 days</option>
                                <option value={60}>60 days</option>
                                <option value={90}>90 days</option>
                                <option value={180}>180 days</option>
                                <option value={365}>365 days</option>
                            </Select>
                            {errors.retention_days && (
                                <p className="mt-1 text-xs text-red-600">{errors.retention_days}</p>
                            )}
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <Button type="submit" disabled={processing}>
                            Save Settings
                        </Button>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
