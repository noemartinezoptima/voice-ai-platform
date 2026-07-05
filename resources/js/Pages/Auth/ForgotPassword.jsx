import { Head, Link, useForm } from '@inertiajs/react';
import { login } from '@/routes';
import { email } from '@/routes/password';
import AuthLayout from '@/Layouts/AuthLayout';
import { Field, Label, ErrorMessage } from '@/Components/catalyst/fieldset';
import { Input } from '@/Components/catalyst/input';
import { Button } from '@/Components/catalyst/button';
import { TextLink } from '@/Components/catalyst/text';

export default function ForgotPassword({ status }) {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(email().url);
    };

    return (
        <AuthLayout
            title="Reset your password"
            subtitle="Enter your email and we'll send you a reset link."
        >
            <Head title="Forgot Password" />

            {status && (
                <div className="mb-6 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700 dark:border-green-800/50 dark:bg-green-950/30 dark:text-green-400">
                    {status}
                </div>
            )}

            <form onSubmit={submit} className="space-y-6">
                <Field>
                    <Label>Email address</Label>
                    <Input
                        id="email"
                        type="email"
                        value={data.email}
                        onChange={(e) => setData('email', e.target.value)}
                        placeholder="you@company.com"
                        invalid={errors.email ? true : undefined}
                    />
                    {errors.email && <ErrorMessage>{errors.email}</ErrorMessage>}
                </Field>

                <Button type="submit" disabled={processing} className="w-full">
                    {processing ? 'Sending...' : 'Send reset link'}
                </Button>

                <p className="text-center text-sm text-zinc-500 dark:text-zinc-400">
                    Remember your password?{' '}
                    <TextLink href={login().url}>Sign in</TextLink>
                </p>
            </form>
        </AuthLayout>
    );
}
