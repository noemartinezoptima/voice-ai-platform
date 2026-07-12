import { queryParams, type RouteQueryOptions, type RouteDefinition } from './../../../wayfinder'
/**
* @see \App\Http\Controllers\Web\TwilioOAuthController::callback
* @see app/Http/Controllers/Web/TwilioOAuthController.php:15
* @route '/twilio/oauth/callback'
*/
export const callback = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: callback.url(options),
    method: 'get',
})

callback.definition = {
    methods: ["get","head"],
    url: '/twilio/oauth/callback',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Web\TwilioOAuthController::callback
* @see app/Http/Controllers/Web/TwilioOAuthController.php:15
* @route '/twilio/oauth/callback'
*/
callback.url = (options?: RouteQueryOptions) => {
    return callback.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Web\TwilioOAuthController::callback
* @see app/Http/Controllers/Web/TwilioOAuthController.php:15
* @route '/twilio/oauth/callback'
*/
callback.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: callback.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Web\TwilioOAuthController::callback
* @see app/Http/Controllers/Web/TwilioOAuthController.php:15
* @route '/twilio/oauth/callback'
*/
callback.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: callback.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Web\TwilioOAuthController::disconnect
* @see app/Http/Controllers/Web/TwilioOAuthController.php:87
* @route '/twilio/oauth/disconnect'
*/
export const disconnect = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: disconnect.url(options),
    method: 'post',
})

disconnect.definition = {
    methods: ["post"],
    url: '/twilio/oauth/disconnect',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Web\TwilioOAuthController::disconnect
* @see app/Http/Controllers/Web/TwilioOAuthController.php:87
* @route '/twilio/oauth/disconnect'
*/
disconnect.url = (options?: RouteQueryOptions) => {
    return disconnect.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Web\TwilioOAuthController::disconnect
* @see app/Http/Controllers/Web/TwilioOAuthController.php:87
* @route '/twilio/oauth/disconnect'
*/
disconnect.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: disconnect.url(options),
    method: 'post',
})

const oauth = {
    callback: Object.assign(callback, callback),
    disconnect: Object.assign(disconnect, disconnect),
}

export default oauth