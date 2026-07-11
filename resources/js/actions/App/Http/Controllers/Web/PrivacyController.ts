import { queryParams, type RouteQueryOptions, type RouteDefinition } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Web\PrivacyController::index
* @see app/Http/Controllers/Web/PrivacyController.php:14
* @route '/settings/privacy'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/settings/privacy',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Web\PrivacyController::index
* @see app/Http/Controllers/Web/PrivacyController.php:14
* @route '/settings/privacy'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Web\PrivacyController::index
* @see app/Http/Controllers/Web/PrivacyController.php:14
* @route '/settings/privacy'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Web\PrivacyController::index
* @see app/Http/Controllers/Web/PrivacyController.php:14
* @route '/settings/privacy'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

const PrivacyController = { index }

export default PrivacyController