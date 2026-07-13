import { queryParams, type RouteQueryOptions, type RouteDefinition } from './../../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Api\V2\CallSearchController::index
* @see app/Http/Controllers/Api/V2/CallSearchController.php:12
* @route '/api/v2/calls/search'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/api/v2/calls/search',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\V2\CallSearchController::index
* @see app/Http/Controllers/Api/V2/CallSearchController.php:12
* @route '/api/v2/calls/search'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\V2\CallSearchController::index
* @see app/Http/Controllers/Api/V2/CallSearchController.php:12
* @route '/api/v2/calls/search'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\V2\CallSearchController::index
* @see app/Http/Controllers/Api/V2/CallSearchController.php:12
* @route '/api/v2/calls/search'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

const CallSearchController = { index }

export default CallSearchController