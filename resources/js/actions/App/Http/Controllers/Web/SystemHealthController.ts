import { queryParams, type RouteQueryOptions, type RouteDefinition } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Web\SystemHealthController::index
* @see app/Http/Controllers/Web/SystemHealthController.php:15
* @route '/settings/system'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/settings/system',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Web\SystemHealthController::index
* @see app/Http/Controllers/Web/SystemHealthController.php:15
* @route '/settings/system'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Web\SystemHealthController::index
* @see app/Http/Controllers/Web/SystemHealthController.php:15
* @route '/settings/system'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Web\SystemHealthController::index
* @see app/Http/Controllers/Web/SystemHealthController.php:15
* @route '/settings/system'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

const SystemHealthController = { index }

export default SystemHealthController