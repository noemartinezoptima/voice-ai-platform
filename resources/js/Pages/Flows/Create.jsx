import { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { Heading, Subheading } from '@/Components/catalyst/heading';
import { Text } from '@/Components/catalyst/text';
import { Button } from '@/Components/catalyst/button';
import { Field, Label, ErrorMessage } from '@/Components/catalyst/fieldset';
import { Input } from '@/Components/catalyst/input';
import { Textarea } from '@/Components/catalyst/textarea';
import { Checkbox, CheckboxField } from '@/Components/catalyst/checkbox';
import { TextLink } from '@/Components/catalyst/text';
import { Badge } from '@/Components/catalyst/badge';
import { store, index } from '@/actions/App/Http/Controllers/Web/FlowController';
import { Headset, Calendar, ClipboardList, Menu, Bot } from 'lucide-react';

const templateIcons = { Headset, Calendar, ClipboardList, Menu, Bot };

export default function Create({ templates }) {
    const [selectedTemplate, setSelectedTemplate] = useState(null);
    const [showForm, setShowForm] = useState(false);

    const { data, setData, post, processing, errors } = useForm({
        name: '',
        description: '',
        phone_number: '',
        is_active: true,
        template_id: null,
    });

    function selectTemplate(t) {
        setSelectedTemplate(t);
        setData('name', t.name);
        setData('description', t.description);
        setData('template_id', t.id);
        setShowForm(true);
    }

    function startBlank() {
        setSelectedTemplate(null);
        setData('name', '');
        setData('description', '');
        setData('template_id', null);
        setShowForm(true);
    }

    function submit(e) {
        e.preventDefault();
        post(store().url);
    }

    return (
        <AuthenticatedLayout>
            <Head title="Create Flow" />

            <div className="flex items-end justify-between">
                <div>
                    <Heading>Create Flow</Heading>
                    <Text className="mt-1">Start from a template or build from scratch.</Text>
                </div>
                <TextLink href={index().url}>&larr; Back to Flows</TextLink>
            </div>

            {!showForm ? (
                <div className="mt-8">
                    <Subheading>Choose a template</Subheading>
                    <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {templates.map((t) => {
                            const Icon = templateIcons[t.icon] || Bot;
                            return (
                                <button
                                    key={t.id}
                                    type="button"
                                    onClick={() => selectTemplate(t)}
                                    className="group rounded-xl border border-zinc-950/5 bg-white p-5 text-left transition hover:border-indigo-300 hover:shadow-md dark:border-white/10 dark:bg-zinc-900 dark:hover:border-indigo-700"
                                >
                                    <div className="flex size-10 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
                                        <Icon className="size-5" />
                                    </div>
                                    <p className="mt-3 font-semibold text-zinc-950 dark:text-white">{t.name}</p>
                                    <Text className="mt-1 line-clamp-2">{t.description}</Text>
                                    <div className="mt-2 flex flex-wrap gap-1">
                                        {Object.keys(t.config.steps).length > 0 && (
                                            <Badge color="zinc">{Object.keys(t.config.steps).length} steps</Badge>
                                        )}
                                    </div>
                                </button>
                            );
                        })}
                    </div>

                    <div className="mt-6 text-center">
                        <Text className="mb-3">or</Text>
                        <Button plain onClick={startBlank}>Start from scratch</Button>
                    </div>
                </div>
            ) : (
                <form onSubmit={submit} className="mt-8 max-w-2xl space-y-6">
                    {selectedTemplate && (
                        <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-4 dark:border-indigo-800 dark:bg-indigo-950/30">
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-indigo-800 dark:text-indigo-200">
                                    Template: {selectedTemplate.name}
                                </span>
                                <button
                                    type="button"
                                    onClick={() => { setShowForm(false); setSelectedTemplate(null); }}
                                    className="ml-auto text-xs text-indigo-600 underline dark:text-indigo-400"
                                >
                                    Change
                                </button>
                            </div>
                            <Text className="mt-1">{selectedTemplate.description}</Text>
                        </div>
                    )}

                    <Field>
                        <Label>Name</Label>
                        <Input
                            id="name"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            placeholder="e.g. Customer Support v3"
                            required
                            invalid={errors.name ? true : undefined}
                        />
                        {errors.name && <ErrorMessage>{errors.name}</ErrorMessage>}
                    </Field>

                    <Field>
                        <Label>Description (optional)</Label>
                        <Textarea
                            id="description"
                            rows={3}
                            value={data.description}
                            onChange={(e) => setData('description', e.target.value)}
                            placeholder="What does this flow do?"
                            invalid={errors.description ? true : undefined}
                        />
                        {errors.description && <ErrorMessage>{errors.description}</ErrorMessage>}
                    </Field>

                    <Field>
                        <Label>Phone Number (optional)</Label>
                        <Input
                            id="phone_number"
                            value={data.phone_number}
                            onChange={(e) => setData('phone_number', e.target.value)}
                            placeholder="+1 (555) 123-4567"
                            invalid={errors.phone_number ? true : undefined}
                        />
                        {errors.phone_number && <ErrorMessage>{errors.phone_number}</ErrorMessage>}
                    </Field>

                    <CheckboxField>
                        <Checkbox
                            name="is_active"
                            checked={data.is_active}
                            onChange={(e) => setData('is_active', e)}
                        />
                        <Label>Active</Label>
                    </CheckboxField>

                    <div className="flex items-center gap-3">
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Creating...' : 'Create Flow'}
                        </Button>
                        <Button plain href={index().url}>Cancel</Button>
                    </div>
                </form>
            )}
        </AuthenticatedLayout>
    );
}
