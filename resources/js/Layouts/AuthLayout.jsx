import { Link } from '@inertiajs/react'

import { Heading, Subheading } from '@/Components/catalyst/heading'
import { Text } from '@/Components/catalyst/text'

export default function AuthLayout({ children, title, subtitle }) {
    return (
        <div className="flex min-h-dvh flex-col bg-zinc-100 dark:bg-zinc-950">
            <div className="flex grow items-center justify-center p-6 lg:rounded-lg lg:bg-white lg:p-10 lg:shadow-xs lg:ring-1 lg:ring-zinc-950/5 dark:lg:bg-zinc-900 dark:lg:ring-white/10">
                <div className="w-full max-w-sm">
                    <div className="mb-10">
                        <Link href="/" className="text-base/7 font-semibold text-zinc-950 dark:text-white">
                            ZeroVoice
                        </Link>
                    </div>

                    {title && <Heading>{title}</Heading>}
                    {subtitle && <Text className="mt-2">{subtitle}</Text>}

                    <div className="mt-8">{children}</div>
                </div>
            </div>
        </div>
    )
}
