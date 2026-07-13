import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Web\ScheduledCallController::index
* @see app/Http/Controllers/Web/ScheduledCallController.php:16
* @route '/calls/scheduled'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/calls/scheduled',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Web\ScheduledCallController::index
* @see app/Http/Controllers/Web/ScheduledCallController.php:16
* @route '/calls/scheduled'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Web\ScheduledCallController::index
* @see app/Http/Controllers/Web/ScheduledCallController.php:16
* @route '/calls/scheduled'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Web\ScheduledCallController::index
* @see app/Http/Controllers/Web/ScheduledCallController.php:16
* @route '/calls/scheduled'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Web\ScheduledCallController::store
* @see app/Http/Controllers/Web/ScheduledCallController.php:40
* @route '/calls/scheduled'
*/
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/calls/scheduled',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Web\ScheduledCallController::store
* @see app/Http/Controllers/Web/ScheduledCallController.php:40
* @route '/calls/scheduled'
*/
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Web\ScheduledCallController::store
* @see app/Http/Controllers/Web/ScheduledCallController.php:40
* @route '/calls/scheduled'
*/
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Web\ScheduledCallController::cancel
* @see app/Http/Controllers/Web/ScheduledCallController.php:69
* @route '/calls/scheduled/{scheduled_call}/cancel'
*/
export const cancel = (args: { scheduled_call: string | { id: string } } | [scheduled_call: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: cancel.url(args, options),
    method: 'patch',
})

cancel.definition = {
    methods: ["patch"],
    url: '/calls/scheduled/{scheduled_call}/cancel',
} satisfies RouteDefinition<["patch"]>

/**
* @see \App\Http\Controllers\Web\ScheduledCallController::cancel
* @see app/Http/Controllers/Web/ScheduledCallController.php:69
* @route '/calls/scheduled/{scheduled_call}/cancel'
*/
cancel.url = (args: { scheduled_call: string | { id: string } } | [scheduled_call: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { scheduled_call: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { scheduled_call: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            scheduled_call: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        scheduled_call: typeof args.scheduled_call === 'object'
        ? args.scheduled_call.id
        : args.scheduled_call,
    }

    return cancel.definition.url
            .replace('{scheduled_call}', parsedArgs.scheduled_call.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Web\ScheduledCallController::cancel
* @see app/Http/Controllers/Web/ScheduledCallController.php:69
* @route '/calls/scheduled/{scheduled_call}/cancel'
*/
cancel.patch = (args: { scheduled_call: string | { id: string } } | [scheduled_call: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: cancel.url(args, options),
    method: 'patch',
})

/**
* @see \App\Http\Controllers\Web\ScheduledCallController::destroy
* @see app/Http/Controllers/Web/ScheduledCallController.php:84
* @route '/calls/scheduled/{scheduled_call}'
*/
export const destroy = (args: { scheduled_call: string | { id: string } } | [scheduled_call: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/calls/scheduled/{scheduled_call}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Web\ScheduledCallController::destroy
* @see app/Http/Controllers/Web/ScheduledCallController.php:84
* @route '/calls/scheduled/{scheduled_call}'
*/
destroy.url = (args: { scheduled_call: string | { id: string } } | [scheduled_call: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { scheduled_call: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { scheduled_call: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            scheduled_call: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        scheduled_call: typeof args.scheduled_call === 'object'
        ? args.scheduled_call.id
        : args.scheduled_call,
    }

    return destroy.definition.url
            .replace('{scheduled_call}', parsedArgs.scheduled_call.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Web\ScheduledCallController::destroy
* @see app/Http/Controllers/Web/ScheduledCallController.php:84
* @route '/calls/scheduled/{scheduled_call}'
*/
destroy.delete = (args: { scheduled_call: string | { id: string } } | [scheduled_call: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

const ScheduledCallController = { index, store, cancel, destroy }

export default ScheduledCallController