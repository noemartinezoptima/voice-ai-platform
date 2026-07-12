import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import { Button } from '@/Components/catalyst/button';
import { Heading } from '@/Components/catalyst/heading';
import { Text } from '@/Components/catalyst/text';
import { complete } from '@/actions/App/Http/Controllers/Web/GettingStartedController';

const STEPS = [
    { key: 'twilio', title: 'Connect Twilio', description: 'Link your Twilio account to handle phone calls and SMS.', link: '/settings/tenant' },
    { key: 'elevenlabs', title: 'Connect ElevenLabs', description: 'Connect your ElevenLabs account for AI voice synthesis.', link: '/settings/tenant' },
    { key: 'flow', title: 'Create Your First Flow', description: 'Design a voice assistant flow with our visual builder.', link: '/flows' },
    { key: 'test', title: 'Make a Test Call', description: 'Call your assigned Twilio number to test your voice AI.', link: '/monitor' },
];

export default function Index({ twilioConnected, elevenlabsConnected }) {
    const [currentStep, setCurrentStep] = useState(0);
    const stepStatus = [twilioConnected, elevenlabsConnected, false, false];
    const allDone = stepStatus[0] && stepStatus[1];

    function handleFinish() {
        router.post(complete().url);
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-zinc-50 p-4 dark:bg-zinc-950">
            <Head title="Getting Started" />

            <div className="w-full max-w-lg">
                <div className="mb-8 text-center">
                    <Heading className="text-2xl">Getting Started</Heading>
                    <Text className="mt-2">Follow these steps to configure your voice AI platform.</Text>
                </div>

                <div className="mb-8 flex justify-center gap-2">
                    {STEPS.map((step, i) => (
                        <button
                            key={step.key}
                            type="button"
                            onClick={() => setCurrentStep(i)}
                            className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold transition-colors ${
                                i === currentStep
                                    ? 'bg-indigo-600 text-white'
                                    : stepStatus[i]
                                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                                      : 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400'
                            }`}
                        >
                            {stepStatus[i] ? '\u2713' : i + 1}
                        </button>
                    ))}
                </div>

                <div className="rounded-xl border border-zinc-950/10 bg-white p-6 dark:border-white/10 dark:bg-zinc-900">
                    <div className="mb-2 text-sm font-medium text-zinc-500">
                        Step {currentStep + 1} of {STEPS.length}
                    </div>
                    <Heading>{STEPS[currentStep].title}</Heading>
                    <Text className="mt-2">{STEPS[currentStep].description}</Text>

                    {stepStatus[currentStep] && (
                        <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 p-3 dark:border-emerald-800/50 dark:bg-emerald-900/20">
                            <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
                                Connected! Move to the next step.
                            </p>
                        </div>
                    )}

                    <div className="mt-6 flex justify-between">
                        <Button
                            plain
                            disabled={currentStep === 0}
                            onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                        >
                            Previous
                        </Button>
                        <div className="flex gap-2">
                            {currentStep < STEPS.length - 1 ? (
                                <>
                                    <Button plain href={STEPS[currentStep].link}>
                                        Configure
                                    </Button>
                                    <Button
                                        onClick={() => setCurrentStep(Math.min(STEPS.length - 1, currentStep + 1))}
                                    >
                                        Next
                                    </Button>
                                </>
                            ) : (
                                <Button onClick={handleFinish}>
                                    {allDone ? 'Finish Setup' : 'Skip & Finish'}
                                </Button>
                            )}
                        </div>
                    </div>

                    <div className="mt-4 text-center">
                        <button
                            type="button"
                            onClick={handleFinish}
                            className="text-sm text-zinc-400 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300"
                        >
                            Skip setup, go to dashboard
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
