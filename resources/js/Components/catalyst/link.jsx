import { Link as InertiaLink } from '@inertiajs/react'
import { DataInteractive as HeadlessDataInteractive } from '@headlessui/react'
import { forwardRef } from 'react'

export const Link = forwardRef(function Link(props, ref) {
    return (
        <HeadlessDataInteractive>
            <InertiaLink {...props} ref={ref} />
        </HeadlessDataInteractive>
    )
})
