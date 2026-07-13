import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, useForm } from '@inertiajs/react';
import { useState, useRef } from 'react';
import { Heading } from '@/Components/catalyst/heading';
import { Text } from '@/Components/catalyst/text';
import { Button } from '@/Components/catalyst/button';
import { Badge } from '@/Components/catalyst/badge';
import { Input } from '@/Components/catalyst/input';
import { Textarea } from '@/Components/catalyst/textarea';
import { Switch } from '@/Components/catalyst/switch';
import { Table, TableHead, TableHeader, TableBody, TableRow, TableCell } from '@/Components/catalyst/table';
import { Dialog, DialogTitle, DialogDescription, DialogBody, DialogActions } from '@/Components/catalyst/dialog';
import { Field, Label, ErrorMessage } from '@/Components/catalyst/fieldset';
import { Mic, Upload, Play, Trash2, Star } from 'lucide-react';
import { store, destroy, setDefault } from '@/actions/App/Http/Controllers/Web/VoiceController';

export default function Index({ voices }) {
    const [cloneOpen, setCloneOpen] = useState(false);
    const [deleteVoice, setDeleteVoice] = useState(null);
    const [detailVoice, setDetailVoice] = useState(null);
    const [dragOver, setDragOver] = useState(false);
    const fileInputRef = useRef(null);

    const { data, setData, processing, errors, reset } = useForm({
        name: '',
        files: [],
        description: '',
        remove_background_noise: false,
    });

    function openClone() {
        reset();
        setCloneOpen(true);
    }

    function handleFiles(e) {
        const selected = Array.from(e.target.files);
        setData('files', [...data.files, ...selected].slice(0, 3));
    }

    function removeFile(index) {
        setData('files', data.files.filter((_, i) => i !== index));
    }

    function handleDrop(e) {
        e.preventDefault();
        setDragOver(false);
        const dropped = Array.from(e.dataTransfer.files).filter(
            (f) => f.type.startsWith('audio/')
        );
        if (dropped.length) {
            setData('files', [...data.files, ...dropped].slice(0, 3));
        }
    }

    function handleClone(e) {
        e.preventDefault();
        router.post(store().url, data, {
            forceFormData: true,
            onSuccess: () => { setCloneOpen(false); reset(); },
        });
    }

    function handleDelete() {
        if (!deleteVoice) return;
        router.delete(destroy({voice: deleteVoice.id}).url, {
            onSuccess: () => setDeleteVoice(null),
        });
    }

    function handleSetDefault(voice) {
        router.patch(setDefault({voice: voice.id}).url, { preserveScroll: true });
    }

    return (
        <AuthenticatedLayout>
            <Head title="Custom Voices" />

            <div className="flex items-end justify-between">
                <div>
                    <Heading>Custom Voices</Heading>
                    <Text className="mt-1">Clone and manage custom voices from your own audio samples.</Text>
                </div>
                <Button onClick={openClone}>Clone Voice</Button>
            </div>

            {voices.length === 0 ? (
                <div className="mt-6 flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-950/10 py-16 dark:border-white/10">
                    <Mic className="size-10 text-zinc-400" />
                    <p className="mt-4 text-base font-semibold text-zinc-950 dark:text-white">No custom voices</p>
                    <Text className="mt-2">Clone your voice from audio samples to get started.</Text>
                    <Button onClick={openClone} className="mt-4">Clone Your First Voice</Button>
                </div>
            ) : (
                <div className="mt-6">
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableHeader>Name</TableHeader>
                                <TableHeader>Samples</TableHeader>
                                <TableHeader>Status</TableHeader>
                                <TableHeader className="text-right" />
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {voices.map((voice) => (
                                <TableRow key={voice.id}>
                                    <TableCell className="font-medium">
                                        <button
                                            type="button"
                                            onClick={() => setDetailVoice(voice)}
                                            className="text-left hover:text-indigo-600"
                                        >
                                            {voice.name} {voice.is_default && <Star className="inline size-3 text-indigo-500" />}
                                        </button>
                                    </TableCell>
                                    <TableCell>{voice.sample_count}</TableCell>
                                    <TableCell>
                                        <div className="flex gap-1.5">
                                            {voice.is_default && <Badge color="indigo">Default</Badge>}
                                            {voice.requires_verification && <Badge color="amber">Pending</Badge>}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            {voice.preview_url && (
                                                <Button outline onClick={() => new Audio(voice.preview_url).play()} title="Preview" aria-label={`Preview ${voice.name}`}>
                                                    <Play className="size-4" />
                                                </Button>
                                            )}
                                            {!voice.is_default && (
                                                <Button outline onClick={() => handleSetDefault(voice)} title="Set as default" aria-label={`Set ${voice.name} as default`}>
                                                    <Star className="size-4" />
                                                </Button>
                                            )}
                                            <Button outline onClick={() => setDeleteVoice(voice)} aria-label={`Delete ${voice.name}`}>
                                                <Trash2 className="size-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}

            <Dialog open={cloneOpen} onClose={() => setCloneOpen(false)} size="xl">
                <DialogTitle>Clone Voice</DialogTitle>
                <DialogDescription>
                    Upload up to 3 audio samples to clone a voice. Short, clean samples with no background noise work best.
                </DialogDescription>
                <form onSubmit={handleClone}>
                    <DialogBody className="space-y-5">
                        <Field>
                            <Label>Name</Label>
                            <Input value={data.name} onChange={(e) => setData('name', e.target.value)} required placeholder="My Custom Voice" invalid={errors.name ? true : undefined} />
                            {errors.name && <ErrorMessage>{errors.name}</ErrorMessage>}
                        </Field>

                        <Field>
                            <Label>Audio Samples ({data.files.length}/3)</Label>
                            <div
                                className={`mt-1 flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 transition-colors ${
                                    dragOver ? 'border-indigo-400 bg-indigo-50 dark:border-indigo-500 dark:bg-indigo-950' : 'border-zinc-950/15 dark:border-white/15'
                                }`}
                                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                                onDragLeave={() => setDragOver(false)}
                                onDrop={handleDrop}
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <Upload className="size-8 text-zinc-400" />
                                <Text className="mt-2 text-center">Drop audio files here or click to browse</Text>
                                <Text className="text-xs text-zinc-400">MP3, WAV, FLAC, M4A — up to 25MB each</Text>
                                <input ref={fileInputRef} type="file" accept=".mp3,.wav,.flac,.m4a,audio/mpeg,audio/wav,audio/flac,audio/mp4" multiple className="hidden" onChange={handleFiles} />
                            </div>
                            {errors.files && <ErrorMessage>{errors.files}</ErrorMessage>}
                            {errors['files.0'] && <ErrorMessage>{errors['files.0']}</ErrorMessage>}
                            {data.files.length > 0 && (
                                <div className="mt-3 space-y-2">
                                    {data.files.map((file, i) => (
                                        <div key={`${file.name}-${i}`} className="flex items-center justify-between rounded-md border border-zinc-950/10 px-3 py-2 dark:border-white/10">
                                            <span className="truncate text-sm">{file.name}</span>
                                            <Button plain onClick={() => removeFile(i)}><Trash2 className="size-4 text-red-500" /></Button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </Field>

                        <Field>
                            <Label>Description</Label>
                            <Textarea value={data.description} onChange={(e) => setData('description', e.target.value)} rows={3} placeholder="Optional description for this voice..." invalid={errors.description ? true : undefined} />
                            {errors.description && <ErrorMessage>{errors.description}</ErrorMessage>}
                        </Field>

                        <Field>
                            <div className="flex items-center justify-between">
                                <div>
                                    <Label>Remove Background Noise</Label>
                                    <Text className="text-xs">Clean up audio samples before cloning</Text>
                                </div>
                                <Switch checked={data.remove_background_noise} onChange={(v) => setData('remove_background_noise', v)} />
                            </div>
                        </Field>
                    </DialogBody>
                    <DialogActions>
                        <Button plain onClick={() => setCloneOpen(false)}>Cancel</Button>
                        <Button type="submit" disabled={processing || data.files.length === 0}>
                            {processing ? 'Cloning...' : 'Clone Voice'}
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>

            <Dialog open={detailVoice !== null} onClose={() => setDetailVoice(null)} size="lg">
                {detailVoice && (
                    <>
                        <DialogTitle>{detailVoice.name}</DialogTitle>
                        <DialogDescription>Voice details and metadata</DialogDescription>
                        <DialogBody className="space-y-4">
                            {detailVoice.requires_verification && (
                                <div className="rounded-md border border-amber-200 bg-amber-50 p-3 dark:border-amber-800/50 dark:bg-amber-900/20">
                                    <p className="text-sm font-medium text-amber-700 dark:text-amber-300">Verification pending — this voice requires ElevenLabs verification before use.</p>
                                </div>
                            )}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Text className="text-xs text-zinc-500">ElevenLabs ID</Text>
                                    <p className="font-mono text-sm">{detailVoice.elevenlabs_voice_id}</p>
                                </div>
                                <div>
                                    <Text className="text-xs text-zinc-500">Samples</Text>
                                    <p className="text-sm">{detailVoice.sample_count}</p>
                                </div>
                                <div>
                                    <Text className="text-xs text-zinc-500">Status</Text>
                                    <div className="flex gap-1.5 mt-0.5">
                                        {detailVoice.is_default && <Badge color="indigo">Default</Badge>}
                                        {detailVoice.requires_verification ? <Badge color="amber">Pending Verification</Badge> : <Badge color="emerald">Ready</Badge>}
                                    </div>
                                </div>
                                <div>
                                    <Text className="text-xs text-zinc-500">Labels</Text>
                                    <p className="text-sm">{detailVoice.labels ? JSON.stringify(detailVoice.labels) : 'None'}</p>
                                </div>
                            </div>
                            {detailVoice.description && (
                                <div>
                                    <Text className="text-xs text-zinc-500">Description</Text>
                                    <p className="text-sm">{detailVoice.description}</p>
                                </div>
                            )}
                            {detailVoice.preview_url && (
                                <div>
                                    <Text className="text-xs text-zinc-500">Preview</Text>
                                    <audio controls className="mt-1 w-full">
                                        <source src={detailVoice.preview_url} type="audio/mpeg" />
                                    </audio>
                                </div>
                            )}
                        </DialogBody>
                        <DialogActions>
                            <Button plain onClick={() => setDetailVoice(null)}>Close</Button>
                        </DialogActions>
                    </>
                )}
            </Dialog>

            <Dialog open={deleteVoice !== null} onClose={() => setDeleteVoice(null)}>
                <DialogTitle>Delete Voice</DialogTitle>
                <DialogDescription>
                    Delete &ldquo;{deleteVoice?.name}&rdquo;? This will remove the voice from ElevenLabs and all flows using it.
                </DialogDescription>
                <DialogActions>
                    <Button plain onClick={() => setDeleteVoice(null)}>Cancel</Button>
                    <Button color="red" onClick={handleDelete} disabled={processing}>
                        {processing ? 'Deleting...' : 'Delete Voice'}
                    </Button>
                </DialogActions>
            </Dialog>
        </AuthenticatedLayout>
    );
}
