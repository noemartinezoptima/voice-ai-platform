import { queryParams, type RouteQueryOptions, type RouteDefinition } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Web\TranscriptSearchController::index
* @see app/Http/Controllers/Web/TranscriptSearchController.php:14
* @route '/transcripts'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/transcripts',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Web\TranscriptSearchController::index
* @see app/Http/Controllers/Web/TranscriptSearchController.php:14
* @route '/transcripts'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Web\TranscriptSearchController::index
* @see app/Http/Controllers/Web/TranscriptSearchController.php:14
* @route '/transcripts'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Web\TranscriptSearchController::index
* @see app/Http/Controllers/Web/TranscriptSearchController.php:14
* @route '/transcripts'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Web\TranscriptSearchController::exportMethod
* @see app/Http/Controllers/Web/TranscriptSearchController.php:56
* @route '/transcripts/export/csv'
*/
export const exportMethod = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: exportMethod.url(options),
    method: 'get',
})

exportMethod.definition = {
    methods: ["get","head"],
    url: '/transcripts/export/csv',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Web\TranscriptSearchController::exportMethod
* @see app/Http/Controllers/Web/TranscriptSearchController.php:56
* @route '/transcripts/export/csv'
*/
exportMethod.url = (options?: RouteQueryOptions) => {
    return exportMethod.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Web\TranscriptSearchController::exportMethod
* @see app/Http/Controllers/Web/TranscriptSearchController.php:56
* @route '/transcripts/export/csv'
*/
exportMethod.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: exportMethod.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Web\TranscriptSearchController::exportMethod
* @see app/Http/Controllers/Web/TranscriptSearchController.php:56
* @route '/transcripts/export/csv'
*/
exportMethod.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: exportMethod.url(options),
    method: 'head',
})

const TranscriptSearchController = { index, exportMethod, export: exportMethod }

export default TranscriptSearchController