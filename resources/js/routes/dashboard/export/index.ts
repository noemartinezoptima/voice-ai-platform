import { queryParams, type RouteQueryOptions, type RouteDefinition } from './../../../wayfinder'
/**
* @see \App\Http\Controllers\Web\DashboardController::analytics
* @see app/Http/Controllers/Web/DashboardController.php:53
* @route '/dashboard/export/csv'
*/
export const analytics = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: analytics.url(options),
    method: 'get',
})

analytics.definition = {
    methods: ["get","head"],
    url: '/dashboard/export/csv',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Web\DashboardController::analytics
* @see app/Http/Controllers/Web/DashboardController.php:53
* @route '/dashboard/export/csv'
*/
analytics.url = (options?: RouteQueryOptions) => {
    return analytics.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Web\DashboardController::analytics
* @see app/Http/Controllers/Web/DashboardController.php:53
* @route '/dashboard/export/csv'
*/
analytics.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: analytics.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Web\DashboardController::analytics
* @see app/Http/Controllers/Web/DashboardController.php:53
* @route '/dashboard/export/csv'
*/
analytics.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: analytics.url(options),
    method: 'head',
})

const exportMethod = {
    analytics: Object.assign(analytics, analytics),
}

export default exportMethod