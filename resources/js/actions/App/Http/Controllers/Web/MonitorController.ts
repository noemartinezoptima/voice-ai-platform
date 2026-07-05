import { queryParams, type RouteQueryOptions, type RouteDefinition } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Web\MonitorController::index
* @see app/Http/Controllers/Web/MonitorController.php:14
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
* @see app/Http/Controllers/Web/MonitorController.php:14
* @route '/monitor'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Web\MonitorController::index
* @see app/Http/Controllers/Web/MonitorController.php:14
* @route '/monitor'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Web\MonitorController::index
* @see app/Http/Controllers/Web/MonitorController.php:14
* @route '/monitor'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Web\MonitorController::active
* @see app/Http/Controllers/Web/MonitorController.php:21
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
* @see app/Http/Controllers/Web/MonitorController.php:21
* @route '/monitor/active'
*/
active.url = (options?: RouteQueryOptions) => {
    return active.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Web\MonitorController::active
* @see app/Http/Controllers/Web/MonitorController.php:21
* @route '/monitor/active'
*/
active.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: active.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Web\MonitorController::active
* @see app/Http/Controllers/Web/MonitorController.php:21
* @route '/monitor/active'
*/
active.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: active.url(options),
    method: 'head',
})

const MonitorController = { index, active }

export default MonitorController