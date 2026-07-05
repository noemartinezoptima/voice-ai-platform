import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { Heading, Subheading } from '@/Components/catalyst/heading';
import { Text } from '@/Components/catalyst/text';
import { Button } from '@/Components/catalyst/button';
import { Field, Label, ErrorMessage } from '@/Components/catalyst/fieldset';
import { Input } from '@/Components/catalyst/input';
import { Select } from '@/Components/catalyst/select';
import { Volume2, Globe, Gauge, Mic } from 'lucide-react';

export default function Voice({ settings }) {
    const { data, setData, patch, processing, errors } = useForm({
        default_tts_provider: settings.default_tts_provider ?? 'elevenlabs',
        default_language: settings.default_language ?? 'en',
        elevenlabs_voice_id: settings.elevenlabs_voice_id ?? '',
        tts_speed: settings.tts_speed?.toString() ?? '1.0',
        voice_stability: settings.voice_stability?.toString() ?? '0.5',
        voice_similarity_boost: settings.voice_similarity_boost?.toString() ?? '0.75',
    });

    function submit(e) {
        e.preventDefault();
        patch('/settings/voice', {
            preserveScroll: true,
        });
    }

    return (
        <AuthenticatedLayout>
            <Head title="Voice & Language" />

            <div className="flex items-end justify-between">
                <div>
                    <Heading>Voice & Language</Heading>
                    <Text className="mt-1">Configure voice synthesis and language preferences.</Text>
                </div>
            </div>

            <div className="mt-8 max-w-2xl">
                <form onSubmit={submit} className="space-y-6">
                    <div className="rounded-xl border border-zinc-950/5 bg-white p-8 dark:border-white/10 dark:bg-zinc-900">
                        <div className="flex items-center gap-2">
                            <Volume2 className="size-5 text-zinc-500" />
                            <Subheading>TTS Provider</Subheading>
                        </div>
                        <Text className="mt-1">Choose the text-to-speech engine for voice calls.</Text>
                        <div className="mt-4">
                            <Field>
                                <Label>Provider</Label>
                                <Select
                                    value={data.default_tts_provider}
                                    onChange={(e) => setData('default_tts_provider', e.target.value)}
                                    invalid={errors.default_tts_provider ? true : undefined}
                                >
                                    <option value="elevenlabs">ElevenLabs</option>
                                    <option value="twilio">Twilio (Amazon Polly)</option>
                                </Select>
                                {errors.default_tts_provider && <ErrorMessage>{errors.default_tts_provider}</ErrorMessage>}
                            </Field>
                        </div>
                    </div>

                    <div className="rounded-xl border border-zinc-950/5 bg-white p-8 dark:border-white/10 dark:bg-zinc-900">
                        <div className="flex items-center gap-2">
                            <Globe className="size-5 text-zinc-500" />
                            <Subheading>Language</Subheading>
                        </div>
                        <Text className="mt-1">Default language for voice prompts and transcriptions.</Text>
                        <div className="mt-4 space-y-4">
                            <Field>
                                <Label>Default Language</Label>
                                <Select
                                    value={data.default_language}
                                    onChange={(e) => setData('default_language', e.target.value)}
                                    invalid={errors.default_language ? true : undefined}
                                >
                                    <option value="en">English</option>
                                    <option value="es">Spanish</option>
                                    <option value="fr">French</option>
                                    <option value="de">German</option>
                                    <option value="it">Italian</option>
                                    <option value="pt">Portuguese</option>
                                </Select>
                                {errors.default_language && <ErrorMessage>{errors.default_language}</ErrorMessage>}
                            </Field>
                        </div>
                    </div>

                    <div className="rounded-xl border border-zinc-950/5 bg-white p-8 dark:border-white/10 dark:bg-zinc-900">
                        <div className="flex items-center gap-2">
                            <Mic className="size-5 text-zinc-500" />
                            <Subheading>ElevenLabs Voice</Subheading>
                        </div>
                        <Text className="mt-1">Configure the voice identity for ElevenLabs synthesis.</Text>
                        <div className="mt-4 space-y-4">
                            <Field>
                                <Label>Voice ID</Label>
                                <Input
                                    value={data.elevenlabs_voice_id}
                                    onChange={(e) => setData('elevenlabs_voice_id', e.target.value)}
                                    placeholder="21m00Tcm4TlvDq8ikWAM"
                                    invalid={errors.elevenlabs_voice_id ? true : undefined}
                                />
                                {errors.elevenlabs_voice_id && <ErrorMessage>{errors.elevenlabs_voice_id}</ErrorMessage>}
                            </Field>
                        </div>
                    </div>

                    <div className="rounded-xl border border-zinc-950/5 bg-white p-8 dark:border-white/10 dark:bg-zinc-900">
                        <div className="flex items-center gap-2">
                            <Gauge className="size-5 text-zinc-500" />
                            <Subheading>Speech Settings</Subheading>
                        </div>
                        <Text className="mt-1">Adjust voice speed and stability parameters.</Text>
                        <div className="mt-4 space-y-5">
                            <Field>
                                <Label>Speed ({data.tts_speed}x)</Label>
                                <Input
                                    type="range"
                                    min="0.5"
                                    max="2.0"
                                    step="0.1"
                                    value={data.tts_speed}
                                    onChange={(e) => setData('tts_speed', e.target.value)}
                                />
                                <div className="flex justify-between text-xs text-zinc-400">
                                    <span>0.5x</span>
                                    <span>1.0x</span>
                                    <span>2.0x</span>
                                </div>
                                {errors.tts_speed && <ErrorMessage>{errors.tts_speed}</ErrorMessage>}
                            </Field>

                            <Field>
                                <Label>Stability ({data.voice_stability})</Label>
                                <Input
                                    type="range"
                                    min="0"
                                    max="1"
                                    step="0.05"
                                    value={data.voice_stability}
                                    onChange={(e) => setData('voice_stability', e.target.value)}
                                />
                                <div className="flex justify-between text-xs text-zinc-400">
                                    <span>Flexible</span>
                                    <span>Stable</span>
                                </div>
                                {errors.voice_stability && <ErrorMessage>{errors.voice_stability}</ErrorMessage>}
                            </Field>

                            <Field>
                                <Label>Similarity Boost ({data.voice_similarity_boost})</Label>
                                <Input
                                    type="range"
                                    min="0"
                                    max="1"
                                    step="0.05"
                                    value={data.voice_similarity_boost}
                                    onChange={(e) => setData('voice_similarity_boost', e.target.value)}
                                />
                                <div className="flex justify-between text-xs text-zinc-400">
                                    <span>Low</span>
                                    <span>High</span>
                                </div>
                                {errors.voice_similarity_boost && <ErrorMessage>{errors.voice_similarity_boost}</ErrorMessage>}
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
