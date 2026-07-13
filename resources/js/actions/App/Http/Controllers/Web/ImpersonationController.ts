import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Web\ImpersonationController::start
* @see app/Http/Controllers/Web/ImpersonationController.php:13
* @route '/admin/impersonate/{user}'
*/
export const start = (args: { user: number | { id: number } } | [user: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: start.url(args, options),
    method: 'post',
})

start.definition = {
    methods: ["post"],
    url: '/admin/impersonate/{user}',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Web\ImpersonationController::start
* @see app/Http/Controllers/Web/ImpersonationController.php:13
* @route '/admin/impersonate/{user}'
*/
start.url = (args: { user: number | { id: number } } | [user: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { user: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { user: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            user: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        user: typeof args.user === 'object'
        ? args.user.id
        : args.user,
    }

    return start.definition.url
            .replace('{user}', parsedArgs.user.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Web\ImpersonationController::start
* @see app/Http/Controllers/Web/ImpersonationController.php:13
* @route '/admin/impersonate/{user}'
*/
start.post = (args: { user: number | { id: number } } | [user: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: start.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Web\ImpersonationController::stop
* @see app/Http/Controllers/Web/ImpersonationController.php:30
* @route '/admin/stop-impersonating'
*/
export const stop = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: stop.url(options),
    method: 'post',
})

stop.definition = {
    methods: ["post"],
    url: '/admin/stop-impersonating',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Web\ImpersonationController::stop
* @see app/Http/Controllers/Web/ImpersonationController.php:30
* @route '/admin/stop-impersonating'
*/
stop.url = (options?: RouteQueryOptions) => {
    return stop.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Web\ImpersonationController::stop
* @see app/Http/Controllers/Web/ImpersonationController.php:30
* @route '/admin/stop-impersonating'
*/
stop.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: stop.url(options),
    method: 'post',
})

const ImpersonationController = { start, stop }

export default ImpersonationController