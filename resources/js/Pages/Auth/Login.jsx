import { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { login, register } from '@/routes';
import { request } from '@/routes/password';
import AuthLayout from '@/Layouts/AuthLayout';
import { Field, Label, ErrorMessage } from '@/Components/catalyst/fieldset';
import { Input } from '@/Components/catalyst/input';
import { Button } from '@/Components/catalyst/button';
import { Checkbox, CheckboxField } from '@/Components/catalyst/checkbox';
import { TextLink } from '@/Components/catalyst/text';

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const [visible, setVisible] = useState(false);

    const submit = (e) => {
        e.preventDefault();
        post(login().url, {
            onFinish: () => reset('password'),
        });
    };

    return (
        <AuthLayout
            title="Sign in"
            subtitle="Welcome back. Enter your credentials to continue."
        >
            <Head title="Sign in" />

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
                        autoComplete="email"
                        placeholder="you@company.com"
                        invalid={errors.email ? true : undefined}
                    />
                    {errors.email && <ErrorMessage>{errors.email}</ErrorMessage>}
                </Field>

                <Field>
                    <Label>Password</Label>
                    <div className="relative">
                        <Input
                            id="password"
                            type={visible ? 'text' : 'password'}
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            autoComplete="current-password"
                            placeholder="Enter your password"
                            invalid={errors.password ? true : undefined}
                        />
                        <button
                            type="button"
                            onClick={() => setVisible(!visible)}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-1 text-zinc-400 transition-colors hover:text-zinc-600 focus:outline-none dark:hover:text-zinc-300"
                            tabIndex={-1}
                            aria-label={visible ? 'Hide password' : 'Show password'}
                        >
                            {visible ? (
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                            ) : (
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                                </svg>
                            )}
                        </button>
                    </div>
                    {errors.password && <ErrorMessage>{errors.password}</ErrorMessage>}
                </Field>

                <div className="flex items-center justify-between">
                    <CheckboxField>
                        <Checkbox
                            name="remember"
                            checked={data.remember}
                            onChange={(e) => setData('remember', e)}
                        />
                        <Label>Remember me</Label>
                    </CheckboxField>

                    {canResetPassword && (
                        <Link
                            href={request().url}
                            className="text-sm font-medium text-zinc-950 underline decoration-zinc-950/50 transition-colors hover:decoration-zinc-950 dark:text-white dark:decoration-white/50 dark:hover:decoration-white"
                        >
                            Forgot password?
                        </Link>
                    )}
                </div>

                <Button type="submit" disabled={processing} className="w-full">
                    {processing ? 'Signing in...' : 'Sign in'}
                </Button>

                <p className="text-center text-sm text-zinc-500 dark:text-zinc-400">
                    Don't have an account?{' '}
                    <TextLink href={register().url}>Create one</TextLink>
                </p>
            </form>
        </AuthLayout>
    );
}
