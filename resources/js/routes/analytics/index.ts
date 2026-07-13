import { queryParams, type RouteQueryOptions, type RouteDefinition } from './../../wayfinder'
/**
* @see \App\Http\Controllers\Web\AnalyticsController::index
* @see app/Http/Controllers/Web/AnalyticsController.php:21
* @route '/analytics'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/analytics',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Web\AnalyticsController::index
* @see app/Http/Controllers/Web/AnalyticsController.php:21
* @route '/analytics'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Web\AnalyticsController::index
* @see app/Http/Controllers/Web/AnalyticsController.php:21
* @route '/analytics'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Web\AnalyticsController::index
* @see app/Http/Controllers/Web/AnalyticsController.php:21
* @route '/analytics'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Web\AnalyticsController::exportMethod
* @see app/Http/Controllers/Web/AnalyticsController.php:126
* @route '/analytics/export/csv'
*/
export const exportMethod = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: exportMethod.url(options),
    method: 'get',
})

exportMethod.definition = {
    methods: ["get","head"],
    url: '/analytics/export/csv',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Web\AnalyticsController::exportMethod
* @see app/Http/Controllers/Web/AnalyticsController.php:126
* @route '/analytics/export/csv'
*/
exportMethod.url = (options?: RouteQueryOptions) => {
    return exportMethod.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Web\AnalyticsController::exportMethod
* @see app/Http/Controllers/Web/AnalyticsController.php:126
* @route '/analytics/export/csv'
*/
exportMethod.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: exportMethod.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Web\AnalyticsController::exportMethod
* @see app/Http/Controllers/Web/AnalyticsController.php:126
* @route '/analytics/export/csv'
*/
exportMethod.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: exportMethod.url(options),
    method: 'head',
})

const analytics = {
    index: Object.assign(index, index),
    export: Object.assign(exportMethod, exportMethod),
}

export default analytics