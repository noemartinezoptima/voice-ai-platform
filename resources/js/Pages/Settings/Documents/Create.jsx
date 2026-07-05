import { useState } from 'react';
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

export default function Create({ resourceTypes }) {
    const { data, setData, post, processing, errors } = useForm({
        resource_type: 'pdf',
        name: '',
        file: null,
    });

    const [fileName, setFileName] = useState('');

    function submit(e) {
        e.preventDefault();
        post(store().url, {
            forceFormData: true,
        });
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
                    <div className="mt-1 flex items-center gap-4">
                        <label className="cursor-pointer rounded-lg border border-dashed border-zinc-950/20 px-4 py-6 text-center text-sm text-zinc-500 hover:border-zinc-950/40 dark:border-white/10 dark:hover:border-white/30">
                            <input
                                type="file"
                                className="hidden"
                                onChange={(e) => {
                                    setData('file', e.target.files[0]);
                                    setFileName(e.target.files[0]?.name ?? '');
                                }}
                            />
                            {fileName || 'Click to choose file...'}
                        </label>
                    </div>
                    {data.file && (
                        <Text className="mt-2">Selected: {data.file.name} ({(data.file.size / 1024).toFixed(1)} KB)</Text>
                    )}
                    {errors.file && <ErrorMessage>{errors.file}</ErrorMessage>}
                </Field>

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
