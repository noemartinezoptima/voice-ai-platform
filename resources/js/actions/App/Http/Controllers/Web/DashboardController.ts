import { queryParams, type RouteQueryOptions, type RouteDefinition } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Web\DashboardController::index
* @see app/Http/Controllers/Web/DashboardController.php:20
* @route '/dashboard'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/dashboard',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Web\DashboardController::index
* @see app/Http/Controllers/Web/DashboardController.php:20
* @route '/dashboard'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Web\DashboardController::index
* @see app/Http/Controllers/Web/DashboardController.php:20
* @route '/dashboard'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Web\DashboardController::index
* @see app/Http/Controllers/Web/DashboardController.php:20
* @route '/dashboard'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Web\DashboardController::exportAnalytics
* @see app/Http/Controllers/Web/DashboardController.php:53
* @route '/dashboard/export/csv'
*/
export const exportAnalytics = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: exportAnalytics.url(options),
    method: 'get',
})

exportAnalytics.definition = {
    methods: ["get","head"],
    url: '/dashboard/export/csv',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Web\DashboardController::exportAnalytics
* @see app/Http/Controllers/Web/DashboardController.php:53
* @route '/dashboard/export/csv'
*/
exportAnalytics.url = (options?: RouteQueryOptions) => {
    return exportAnalytics.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Web\DashboardController::exportAnalytics
* @see app/Http/Controllers/Web/DashboardController.php:53
* @route '/dashboard/export/csv'
*/
exportAnalytics.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: exportAnalytics.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Web\DashboardController::exportAnalytics
* @see app/Http/Controllers/Web/DashboardController.php:53
* @route '/dashboard/export/csv'
*/
exportAnalytics.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: exportAnalytics.url(options),
    method: 'head',
})

const DashboardController = { index, exportAnalytics }

export default DashboardController