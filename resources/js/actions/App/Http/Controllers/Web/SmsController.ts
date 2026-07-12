import { queryParams, type RouteQueryOptions, type RouteDefinition } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Web\SmsController::index
* @see app/Http/Controllers/Web/SmsController.php:21
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
* @see app/Http/Controllers/Web/SmsController.php:21
* @route '/sms'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Web\SmsController::index
* @see app/Http/Controllers/Web/SmsController.php:21
* @route '/sms'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Web\SmsController::index
* @see app/Http/Controllers/Web/SmsController.php:21
* @route '/sms'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Web\SmsController::send
* @see app/Http/Controllers/Web/SmsController.php:36
* @route '/sms/send'
*/
export const send = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: send.url(options),
    method: 'post',
})

send.definition = {
    methods: ["post"],
    url: '/sms/send',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Web\SmsController::send
* @see app/Http/Controllers/Web/SmsController.php:36
* @route '/sms/send'
*/
send.url = (options?: RouteQueryOptions) => {
    return send.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Web\SmsController::send
* @see app/Http/Controllers/Web/SmsController.php:36
* @route '/sms/send'
*/
send.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: send.url(options),
    method: 'post',
})

const SmsController = { index, send }

export default SmsController