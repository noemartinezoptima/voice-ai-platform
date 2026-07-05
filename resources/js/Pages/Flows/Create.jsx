import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { Heading } from '@/Components/catalyst/heading';
import { Text } from '@/Components/catalyst/text';
import { Button } from '@/Components/catalyst/button';
import { Field, Label, ErrorMessage } from '@/Components/catalyst/fieldset';
import { Input } from '@/Components/catalyst/input';
import { Textarea } from '@/Components/catalyst/textarea';
import { Checkbox, CheckboxField } from '@/Components/catalyst/checkbox';
import { TextLink } from '@/Components/catalyst/text';
import { store, index } from '@/actions/App/Http/Controllers/Web/FlowController';

export default function Create() {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        description: '',
        phone_number: '',
        is_active: true,
    });

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
                    <Text className="mt-1">Configure a new voice AI conversation flow.</Text>
                </div>
                <TextLink href={index().url}>&larr; Back to Flows</TextLink>
            </div>

            <form onSubmit={submit} className="mt-8 max-w-2xl space-y-6">
                <Field>
                    <Label>Name</Label>
                    <Input
                        id="name"
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        placeholder="e.g. Customer Support v3"
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
        </AuthenticatedLayout>
    );
}
