import { Head, Link, useForm } from '@inertiajs/react';
import { logout } from '@/routes';
import { send } from '@/routes/verification';
import AuthLayout from '@/Layouts/AuthLayout';
import { Text } from '@/Components/catalyst/text';
import { Button } from '@/Components/catalyst/button';

export default function VerifyEmail({ status }) {
    const { post, processing } = useForm({});

    const submit = (e) => {
        e.preventDefault();
        post(send().url);
    };

    return (
        <AuthLayout
            title="Verify your email"
            subtitle="Thanks for signing up! Verify your email to get started."
        >
            <Head title="Email Verification" />

            {status === 'verification-link-sent' && (
                <div className="mb-6 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700 dark:border-green-800/50 dark:bg-green-950/30 dark:text-green-400">
                    A new verification link has been sent to your email.
                </div>
            )}

            <Text className="mb-6">
                Before getting started, could you verify your email address by clicking
                the link we just sent you? If you didn't receive it, we'll send another.
            </Text>

            <form onSubmit={submit} className="space-y-4">
                <Button type="submit" disabled={processing} className="w-full">
                    {processing ? 'Sending...' : 'Resend verification email'}
                </Button>

                <Link
                    href={logout().url}
                    method="post"
                    as="button"
                    className="flex w-full items-center justify-center rounded-lg border border-zinc-950/10 px-4 py-2.5 text-sm font-semibold text-zinc-950 transition hover:bg-zinc-950/2.5 focus:outline-none dark:border-white/10 dark:text-white dark:hover:bg-white/5"
                >
                    Log out
                </Link>
            </form>
        </AuthLayout>
    );
}
