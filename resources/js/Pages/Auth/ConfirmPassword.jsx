import { Head, Link, useForm } from '@inertiajs/react';
import { login } from '@/routes';
import { confirm } from '@/routes/password';
import AuthLayout from '@/Layouts/AuthLayout';
import { Field, Label, ErrorMessage } from '@/Components/catalyst/fieldset';
import { Input } from '@/Components/catalyst/input';
import { Button } from '@/Components/catalyst/button';
import { TextLink } from '@/Components/catalyst/text';

export default function ConfirmPassword() {
    const { data, setData, post, processing, errors, reset } = useForm({
        password: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(confirm().url, {
            onFinish: () => reset('password'),
        });
    };

    return (
        <AuthLayout
            title="Confirm your password"
            subtitle="This is a secure area. Please confirm your password before continuing."
        >
            <Head title="Confirm Password" />

            <form onSubmit={submit} className="space-y-6">
                <Field>
                    <Label>Password</Label>
                    <Input
                        id="password"
                        type="password"
                        value={data.password}
                        onChange={(e) => setData('password', e.target.value)}
                        placeholder="Enter your password"
                        invalid={errors.password ? true : undefined}
                    />
                    {errors.password && <ErrorMessage>{errors.password}</ErrorMessage>}
                </Field>

                <Button type="submit" disabled={processing} className="w-full">
                    {processing ? 'Confirming...' : 'Confirm'}
                </Button>

                <p className="text-center text-sm text-zinc-500 dark:text-zinc-400">
                    <TextLink href={login().url}>Back to sign in</TextLink>
                </p>
            </form>
        </AuthLayout>
    );
}
