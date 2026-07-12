import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../wayfinder'
/**
* @see \App\Http\Controllers\Web\MonitorController::index
* @see app/Http/Controllers/Web/MonitorController.php:15
* @route '/monitor'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/monitor',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Web\MonitorController::index
* @see app/Http/Controllers/Web/MonitorController.php:15
* @route '/monitor'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Web\MonitorController::index
* @see app/Http/Controllers/Web/MonitorController.php:15
* @route '/monitor'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Web\MonitorController::index
* @see app/Http/Controllers/Web/MonitorController.php:15
* @route '/monitor'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Web\MonitorController::active
* @see app/Http/Controllers/Web/MonitorController.php:23
* @route '/monitor/active'
*/
export const active = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: active.url(options),
    method: 'get',
})

active.definition = {
    methods: ["get","head"],
    url: '/monitor/active',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Web\MonitorController::active
* @see app/Http/Controllers/Web/MonitorController.php:23
* @route '/monitor/active'
*/
active.url = (options?: RouteQueryOptions) => {
    return active.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Web\MonitorController::active
* @see app/Http/Controllers/Web/MonitorController.php:23
* @route '/monitor/active'
*/
active.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: active.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Web\MonitorController::active
* @see app/Http/Controllers/Web/MonitorController.php:23
* @route '/monitor/active'
*/
active.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: active.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Web\MonitorController::transcript
* @see app/Http/Controllers/Web/MonitorController.php:44
* @route '/monitor/calls/{call}/transcript'
*/
export const transcript = (args: { call: string | number } | [call: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: transcript.url(args, options),
    method: 'get',
})

transcript.definition = {
    methods: ["get","head"],
    url: '/monitor/calls/{call}/transcript',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Web\MonitorController::transcript
* @see app/Http/Controllers/Web/MonitorController.php:44
* @route '/monitor/calls/{call}/transcript'
*/
transcript.url = (args: { call: string | number } | [call: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { call: args }
    }

    if (Array.isArray(args)) {
        args = {
            call: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        call: args.call,
    }

    return transcript.definition.url
            .replace('{call}', parsedArgs.call.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Web\MonitorController::transcript
* @see app/Http/Controllers/Web/MonitorController.php:44
* @route '/monitor/calls/{call}/transcript'
*/
transcript.get = (args: { call: string | number } | [call: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: transcript.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Web\MonitorController::transcript
* @see app/Http/Controllers/Web/MonitorController.php:44
* @route '/monitor/calls/{call}/transcript'
*/
transcript.head = (args: { call: string | number } | [call: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: transcript.url(args, options),
    method: 'head',
})

const monitor = {
    index: Object.assign(index, index),
    active: Object.assign(active, active),
    transcript: Object.assign(transcript, transcript),
}

export default monitor