import { queryParams, type RouteQueryOptions, type RouteDefinition } from './../../wayfinder'
/**
* @see \App\Http\Controllers\Web\SmsController::index
* @see app/Http/Controllers/Web/SmsController.php:13
* @route '/sms'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/sms',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Web\SmsController::index
* @see app/Http/Controllers/Web/SmsController.php:13
* @route '/sms'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Web\SmsController::index
* @see app/Http/Controllers/Web/SmsController.php:13
* @route '/sms'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Web\SmsController::index
* @see app/Http/Controllers/Web/SmsController.php:13
* @route '/sms'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

const sms = {
    index: Object.assign(index, index),
}

export default sms