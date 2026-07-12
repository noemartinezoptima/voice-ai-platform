import { queryParams, type RouteQueryOptions, type RouteDefinition } from './../../wayfinder'
/**
* @see vendor/knuckleswtf/scribe/routes/laravel.php:14
* @route '/docs.postman'
*/
export const postman = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: postman.url(options),
    method: 'get',
})

postman.definition = {
    methods: ["get","head"],
    url: '/docs.postman',
} satisfies RouteDefinition<["get","head"]>

/**
* @see vendor/knuckleswtf/scribe/routes/laravel.php:14
* @route '/docs.postman'
*/
postman.url = (options?: RouteQueryOptions) => {
    return postman.definition.url + queryParams(options)
}

/**
* @see vendor/knuckleswtf/scribe/routes/laravel.php:14
* @route '/docs.postman'
*/
postman.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: postman.url(options),
    method: 'get',
})

/**
* @see vendor/knuckleswtf/scribe/routes/laravel.php:14
* @route '/docs.postman'
*/
postman.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: postman.url(options),
    method: 'head',
})

/**
* @see vendor/knuckleswtf/scribe/routes/laravel.php:18
* @route '/docs.openapi'
*/
export const openapi = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: openapi.url(options),
    method: 'get',
})

openapi.definition = {
    methods: ["get","head"],
    url: '/docs.openapi',
} satisfies RouteDefinition<["get","head"]>

/**
* @see vendor/knuckleswtf/scribe/routes/laravel.php:18
* @route '/docs.openapi'
*/
openapi.url = (options?: RouteQueryOptions) => {
    return openapi.definition.url + queryParams(options)
}

/**
* @see vendor/knuckleswtf/scribe/routes/laravel.php:18
* @route '/docs.openapi'
*/
openapi.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: openapi.url(options),
    method: 'get',
})

/**
* @see vendor/knuckleswtf/scribe/routes/laravel.php:18
* @route '/docs.openapi'
*/
openapi.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: openapi.url(options),
    method: 'head',
})

const scribe = {
    postman: Object.assign(postman, postman),
    openapi: Object.assign(openapi, openapi),
}

export default scribe