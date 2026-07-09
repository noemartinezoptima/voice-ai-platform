import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { Heading } from '@/Components/catalyst/heading';
import { Text } from '@/Components/catalyst/text';
import { Button } from '@/Components/catalyst/button';
import { Badge } from '@/Components/catalyst/badge';
import { index, updatePlan } from '@/actions/App/Http/Controllers/Web/BillingController';

export default function Index({ tenant, currentPlan, plans }) {
    function switchPlan(planId) {
        if (planId === tenant.plan) return;
        router.patch(updatePlan().url, { plan: planId });
    }

    function isCurrent(planId) {
        return tenant.plan === planId;
    }

    return (
        <AuthenticatedLayout>
            <Head title="Billing" />

            <div>
                <Heading>Billing &amp; Plans</Heading>
                <Text className="mt-1">
                    You are currently on the <strong>{currentPlan.name}</strong> plan.
                </Text>
            </div>

            <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
                {plans.map((plan) => (
                    <div
                        key={plan.id}
                        className={`relative flex flex-col rounded-xl border p-6 transition-shadow ${
                            isCurrent(plan.id)
                                ? 'border-indigo-500 shadow-lg ring-1 ring-indigo-500 dark:border-indigo-400'
                                : 'border-zinc-950/10 dark:border-white/10'
                        }`}
                    >
                        {isCurrent(plan.id) && (
                            <Badge color="indigo" className="absolute -top-2.5 right-4">
                                Current
                            </Badge>
                        )}

                        <div>
                            <h3 className="text-lg font-semibold text-zinc-950 dark:text-white">{plan.name}</h3>
                            <p className="mt-2 text-3xl font-bold text-zinc-950 dark:text-white">
                                {plan.price}
                                <span className="text-sm font-normal text-zinc-500">/month</span>
                            </p>
                        </div>

                        <ul className="mt-6 flex-1 space-y-3">
                            <li className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                                <svg className="h-4 w-4 shrink-0 text-emerald-500" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg>
                                {plan.calls}
                            </li>
                            <li className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                                <svg className="h-4 w-4 shrink-0 text-emerald-500" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg>
                                {plan.flows}
                            </li>
                            <li className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                                <svg className="h-4 w-4 shrink-0 text-emerald-500" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg>
                                {plan.team}
                            </li>
                            {plan.features.map((f) => (
                                <li key={f} className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                                    <svg className="h-4 w-4 shrink-0 text-emerald-500" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg>
                                    {f}
                                </li>
                            ))}
                        </ul>

                        <div className="mt-6">
                            <Button
                                className="w-full"
                                color={isCurrent(plan.id) ? 'zinc' : 'indigo'}
                                disabled={isCurrent(plan.id)}
                                onClick={() => switchPlan(plan.id)}
                            >
                                {isCurrent(plan.id) ? 'Current Plan' : plan.price === '$0' ? 'Downgrade' : 'Upgrade'}
                            </Button>
                        </div>
                    </div>
                ))}
            </div>
        </AuthenticatedLayout>
    );
}
