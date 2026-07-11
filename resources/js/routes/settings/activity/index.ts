import { queryParams, type RouteQueryOptions, type RouteDefinition } from './../../../wayfinder'
/**
* @see \App\Http\Controllers\Web\ActivityLogController::index
* @see app/Http/Controllers/Web/ActivityLogController.php:15
* @route '/settings/activity'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/settings/activity',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Web\ActivityLogController::index
* @see app/Http/Controllers/Web/ActivityLogController.php:15
* @route '/settings/activity'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Web\ActivityLogController::index
* @see app/Http/Controllers/Web/ActivityLogController.php:15
* @route '/settings/activity'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Web\ActivityLogController::index
* @see app/Http/Controllers/Web/ActivityLogController.php:15
* @route '/settings/activity'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

const activity = {
    index: Object.assign(index, index),
}

export default activity