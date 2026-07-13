import { useState, useRef } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { Heading } from '@/Components/catalyst/heading';
import { Text } from '@/Components/catalyst/text';
import { Button } from '@/Components/catalyst/button';
import { Field, Label, ErrorMessage } from '@/Components/catalyst/fieldset';
import { Input } from '@/Components/catalyst/input';
import { Select } from '@/Components/catalyst/select';
import { TextLink } from '@/Components/catalyst/text';
import { store, index } from '@/actions/App/Http/Controllers/Web/DocumentsController';

const ACCEPTED_FILE_TYPES = '.pdf,.txt,.csv,.png,.jpg,.jpeg,.gif,.bmp,.webp';

export default function Create({ resourceTypes }) {
    const { data, setData, post, processing, errors, progress } = useForm({
        resource_type: 'pdf',
        name: '',
        file: null,
    });

    const [fileName, setFileName] = useState('');
    const [dragActive, setDragActive] = useState(false);

    function submit(e) {
        e.preventDefault();
        post(store().url, {
            forceFormData: true,
        });
    }

    function handleFile(file) {
        setData('file', file);
        setFileName(file?.name ?? '');
    }

    function handleDrag(e) {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    }

    function handleDrop(e) {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0]);
        }
    }

    return (
        <AuthenticatedLayout>
            <Head title="Upload Document" />

            <div className="flex items-end justify-between">
                <div>
                    <Heading>Upload Document</Heading>
                    <Text className="mt-1">Add a document to your knowledge base.</Text>
                </div>
                <TextLink href={index().url}>&larr; Back to Documents</TextLink>
            </div>

            <form onSubmit={submit} className="mt-8 max-w-2xl space-y-6">
                <Field>
                    <Label>Document Type</Label>
                    <Select
                        value={data.resource_type}
                        onChange={(e) => setData('resource_type', e.target.value)}
                    >
                        {resourceTypes.map((rt) => (
                            <option key={rt.value} value={rt.value}>{rt.label}</option>
                        ))}
                    </Select>
                </Field>

                <Field>
                    <Label>Name (optional)</Label>
                    <Input
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        placeholder="Defaults to filename"
                        invalid={errors.name ? true : undefined}
                    />
                    {errors.name && <ErrorMessage>{errors.name}</ErrorMessage>}
                </Field>

                <Field>
                    <Label>File</Label>
                    <Text className="mb-2">Accepted: PDF, TXT, CSV, Images (PNG, JPG, GIF, BMP, WebP). Max 100 MB.</Text>
                    <div
                        className={`mt-1 flex flex-col items-center justify-center rounded-lg border-2 border-dashed px-6 py-10 text-center transition-colors ${
                            dragActive
                                ? 'border-blue-500 bg-blue-50 dark:border-blue-400 dark:bg-blue-950/30'
                                : 'border-zinc-950/20 hover:border-zinc-950/40 dark:border-white/10 dark:hover:border-white/30'
                        }`}
                        onDragEnter={handleDrag}
                        onDragOver={handleDrag}
                        onDragLeave={handleDrag}
                        onDrop={handleDrop}
                    >
                        <input
                            type="file"
                            className="hidden"
                            id="file-input"
                            accept={ACCEPTED_FILE_TYPES}
                            onChange={(e) => handleFile(e.target.files[0])}
                        />
                        {fileName ? (
                            <div className="space-y-1">
                                <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{fileName}</p>
                                <p className="text-xs text-zinc-500">
                                    {(data.file.size / 1024).toFixed(1)} KB
                                </p>
                                <button
                                    type="button"
                                    onClick={() => handleFile(null)}
                                    className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                                >
                                    Remove
                                </button>
                            </div>
                        ) : (
                            <>
                                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                                    Drag and drop your file here, or
                                </p>
                                <label
                                    htmlFor="file-input"
                                    className="mt-2 cursor-pointer text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                                >
                                    click to browse
                                </label>
                            </>
                        )}
                    </div>
                    {errors.file && <ErrorMessage>{errors.file}</ErrorMessage>}
                </Field>

                {progress && (
                    <div className="space-y-1">
                        <div className="flex justify-between text-xs text-zinc-500">
                            <span>Uploading...</span>
                            <span>{progress.percentage}%</span>
                        </div>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-700">
                            <div
                                className="h-full rounded-full bg-blue-600 transition-all duration-300 dark:bg-blue-400"
                                style={{ width: `${progress.percentage}%` }}
                            />
                        </div>
                    </div>
                )}

                <div className="flex items-center gap-3">
                    <Button type="submit" disabled={processing || !data.file}>
                        {processing ? 'Uploading...' : 'Upload & Process'}
                    </Button>
                    <Button plain href={index().url}>Cancel</Button>
                </div>
            </form>
        </AuthenticatedLayout>
    );
}
