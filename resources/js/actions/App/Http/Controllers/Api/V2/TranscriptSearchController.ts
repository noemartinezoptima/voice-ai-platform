import { queryParams, type RouteQueryOptions, type RouteDefinition } from './../../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Api\V2\TranscriptSearchController::index
* @see app/Http/Controllers/Api/V2/TranscriptSearchController.php:12
* @route '/api/v2/transcripts/search'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/api/v2/transcripts/search',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\V2\TranscriptSearchController::index
* @see app/Http/Controllers/Api/V2/TranscriptSearchController.php:12
* @route '/api/v2/transcripts/search'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\V2\TranscriptSearchController::index
* @see app/Http/Controllers/Api/V2/TranscriptSearchController.php:12
* @route '/api/v2/transcripts/search'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\V2\TranscriptSearchController::index
* @see app/Http/Controllers/Api/V2/TranscriptSearchController.php:12
* @route '/api/v2/transcripts/search'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

const TranscriptSearchController = { index }

export default TranscriptSearchController