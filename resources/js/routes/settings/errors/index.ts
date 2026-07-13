import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../../wayfinder'
/**
* @see \App\Http\Controllers\Web\ErrorMonitoringController::index
* @see app/Http/Controllers/Web/ErrorMonitoringController.php:15
* @route '/settings/errors'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/settings/errors',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Web\ErrorMonitoringController::index
* @see app/Http/Controllers/Web/ErrorMonitoringController.php:15
* @route '/settings/errors'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Web\ErrorMonitoringController::index
* @see app/Http/Controllers/Web/ErrorMonitoringController.php:15
* @route '/settings/errors'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Web\ErrorMonitoringController::index
* @see app/Http/Controllers/Web/ErrorMonitoringController.php:15
* @route '/settings/errors'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Web\ErrorMonitoringController::show
* @see app/Http/Controllers/Web/ErrorMonitoringController.php:43
* @route '/settings/errors/{hash}'
*/
export const show = (args: { hash: string | number } | [hash: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/settings/errors/{hash}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Web\ErrorMonitoringController::show
* @see app/Http/Controllers/Web/ErrorMonitoringController.php:43
* @route '/settings/errors/{hash}'
*/
show.url = (args: { hash: string | number } | [hash: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { hash: args }
    }

    if (Array.isArray(args)) {
        args = {
            hash: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        hash: args.hash,
    }

    return show.definition.url
            .replace('{hash}', parsedArgs.hash.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Web\ErrorMonitoringController::show
* @see app/Http/Controllers/Web/ErrorMonitoringController.php:43
* @route '/settings/errors/{hash}'
*/
show.get = (args: { hash: string | number } | [hash: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Web\ErrorMonitoringController::show
* @see app/Http/Controllers/Web/ErrorMonitoringController.php:43
* @route '/settings/errors/{hash}'
*/
show.head = (args: { hash: string | number } | [hash: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Web\ErrorMonitoringController::resolve
* @see app/Http/Controllers/Web/ErrorMonitoringController.php:54
* @route '/settings/errors/{hash}/resolve'
*/
export const resolve = (args: { hash: string | number } | [hash: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: resolve.url(args, options),
    method: 'patch',
})

resolve.definition = {
    methods: ["patch"],
    url: '/settings/errors/{hash}/resolve',
} satisfies RouteDefinition<["patch"]>

/**
* @see \App\Http\Controllers\Web\ErrorMonitoringController::resolve
* @see app/Http/Controllers/Web/ErrorMonitoringController.php:54
* @route '/settings/errors/{hash}/resolve'
*/
resolve.url = (args: { hash: string | number } | [hash: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { hash: args }
    }

    if (Array.isArray(args)) {
        args = {
            hash: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        hash: args.hash,
    }

    return resolve.definition.url
            .replace('{hash}', parsedArgs.hash.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Web\ErrorMonitoringController::resolve
* @see app/Http/Controllers/Web/ErrorMonitoringController.php:54
* @route '/settings/errors/{hash}/resolve'
*/
resolve.patch = (args: { hash: string | number } | [hash: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: resolve.url(args, options),
    method: 'patch',
})

const errors = {
    index: Object.assign(index, index),
    show: Object.assign(show, show),
    resolve: Object.assign(resolve, resolve),
}

export default errors