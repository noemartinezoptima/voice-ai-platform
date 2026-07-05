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
import { update, index } from '@/actions/App/Http/Controllers/Web/FlowController';

export default function Edit({ flow }) {
    const { data, setData, patch, processing, errors } = useForm({
        name: flow.name,
        description: flow.description ?? '',
        phone_number: flow.phone_number ?? '',
        is_active: flow.is_active,
    });

    function submit(e) {
        e.preventDefault();
        patch(update({flow: flow.id}).url);
    }

    return (
        <AuthenticatedLayout>
            <Head title={`Edit ${flow.name}`} />

            <div className="flex items-end justify-between">
                <div>
                    <Heading>Edit Flow</Heading>
                    <Text className="mt-1">Update your voice AI conversation flow.</Text>
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
                        {processing ? 'Saving...' : 'Save Changes'}
                    </Button>
                    <Button plain href={index().url}>Cancel</Button>
                </div>
            </form>
        </AuthenticatedLayout>
    );
}
