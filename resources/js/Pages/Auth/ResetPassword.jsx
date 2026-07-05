import { Head, Link, useForm } from '@inertiajs/react';
import { login } from '@/routes';
import { store } from '@/routes/password';
import AuthLayout from '@/Layouts/AuthLayout';
import { Field, Label, ErrorMessage } from '@/Components/catalyst/fieldset';
import { Input } from '@/Components/catalyst/input';
import { Button } from '@/Components/catalyst/button';
import { TextLink } from '@/Components/catalyst/text';

export default function ResetPassword({ token, email }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        token: token,
        email: email,
        password: '',
        password_confirmation: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(store().url, {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <AuthLayout
            title="Set new password"
            subtitle="Choose a strong password for your account."
        >
            <Head title="Reset Password" />

            <form onSubmit={submit} className="space-y-6">
                <Field>
                    <Label>Email address</Label>
                    <Input
                        id="email"
                        type="email"
                        value={data.email}
                        onChange={(e) => setData('email', e.target.value)}
                        autoComplete="email"
                        invalid={errors.email ? true : undefined}
                    />
                    {errors.email && <ErrorMessage>{errors.email}</ErrorMessage>}
                </Field>

                <Field>
                    <Label>New password</Label>
                    <Input
                        id="password"
                        type="password"
                        value={data.password}
                        onChange={(e) => setData('password', e.target.value)}
                        autoComplete="new-password"
                        placeholder="Min. 8 characters"
                        invalid={errors.password ? true : undefined}
                    />
                    {errors.password && <ErrorMessage>{errors.password}</ErrorMessage>}
                </Field>

                <Field>
                    <Label>Confirm password</Label>
                    <Input
                        id="password_confirmation"
                        type="password"
                        value={data.password_confirmation}
                        onChange={(e) => setData('password_confirmation', e.target.value)}
                        autoComplete="new-password"
                        placeholder="Repeat your password"
                        invalid={errors.password_confirmation ? true : undefined}
                    />
                    {errors.password_confirmation && <ErrorMessage>{errors.password_confirmation}</ErrorMessage>}
                </Field>

                <Button type="submit" disabled={processing} className="w-full">
                    {processing ? 'Resetting...' : 'Reset password'}
                </Button>

                <p className="text-center text-sm text-zinc-500 dark:text-zinc-400">
                    <TextLink href={login().url}>Back to sign in</TextLink>
                </p>
            </form>
        </AuthLayout>
    );
}
