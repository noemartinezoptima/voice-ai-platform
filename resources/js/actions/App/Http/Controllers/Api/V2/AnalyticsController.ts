import { queryParams, type RouteQueryOptions, type RouteDefinition } from './../../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Api\V2\AnalyticsController::summary
* @see app/Http/Controllers/Api/V2/AnalyticsController.php:15
* @route '/api/v2/analytics/summary'
*/
export const summary = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: summary.url(options),
    method: 'get',
})

summary.definition = {
    methods: ["get","head"],
    url: '/api/v2/analytics/summary',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\V2\AnalyticsController::summary
* @see app/Http/Controllers/Api/V2/AnalyticsController.php:15
* @route '/api/v2/analytics/summary'
*/
summary.url = (options?: RouteQueryOptions) => {
    return summary.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\V2\AnalyticsController::summary
* @see app/Http/Controllers/Api/V2/AnalyticsController.php:15
* @route '/api/v2/analytics/summary'
*/
summary.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: summary.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\V2\AnalyticsController::summary
* @see app/Http/Controllers/Api/V2/AnalyticsController.php:15
* @route '/api/v2/analytics/summary'
*/
summary.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: summary.url(options),
    method: 'head',
})

const AnalyticsController = { summary }

export default AnalyticsController