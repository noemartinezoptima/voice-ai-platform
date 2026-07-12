import { queryParams, type RouteQueryOptions, type RouteDefinition } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Twilio\WebhookController::inbound
* @see app/Http/Controllers/Twilio/WebhookController.php:31
* @route '/twilio/inbound'
*/
export const inbound = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: inbound.url(options),
    method: 'post',
})

inbound.definition = {
    methods: ["post"],
    url: '/twilio/inbound',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Twilio\WebhookController::inbound
* @see app/Http/Controllers/Twilio/WebhookController.php:31
* @route '/twilio/inbound'
*/
inbound.url = (options?: RouteQueryOptions) => {
    return inbound.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Twilio\WebhookController::inbound
* @see app/Http/Controllers/Twilio/WebhookController.php:31
* @route '/twilio/inbound'
*/
inbound.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: inbound.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Twilio\WebhookController::step
* @see app/Http/Controllers/Twilio/WebhookController.php:77
* @route '/twilio/step'
*/
export const step = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: step.url(options),
    method: 'post',
})

step.definition = {
    methods: ["post"],
    url: '/twilio/step',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Twilio\WebhookController::step
* @see app/Http/Controllers/Twilio/WebhookController.php:77
* @route '/twilio/step'
*/
step.url = (options?: RouteQueryOptions) => {
    return step.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Twilio\WebhookController::step
* @see app/Http/Controllers/Twilio/WebhookController.php:77
* @route '/twilio/step'
*/
step.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: step.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Twilio\WebhookController::status
* @see app/Http/Controllers/Twilio/WebhookController.php:143
* @route '/twilio/status'
*/
export const status = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: status.url(options),
    method: 'post',
})

status.definition = {
    methods: ["post"],
    url: '/twilio/status',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Twilio\WebhookController::status
* @see app/Http/Controllers/Twilio/WebhookController.php:143
* @route '/twilio/status'
*/
status.url = (options?: RouteQueryOptions) => {
    return status.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Twilio\WebhookController::status
* @see app/Http/Controllers/Twilio/WebhookController.php:143
* @route '/twilio/status'
*/
status.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: status.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Twilio\WebhookController::gather
* @see app/Http/Controllers/Twilio/WebhookController.php:221
* @route '/twilio/gather'
*/
export const gather = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: gather.url(options),
    method: 'post',
})

gather.definition = {
    methods: ["post"],
    url: '/twilio/gather',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Twilio\WebhookController::gather
* @see app/Http/Controllers/Twilio/WebhookController.php:221
* @route '/twilio/gather'
*/
gather.url = (options?: RouteQueryOptions) => {
    return gather.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Twilio\WebhookController::gather
* @see app/Http/Controllers/Twilio/WebhookController.php:221
* @route '/twilio/gather'
*/
gather.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: gather.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Twilio\WebhookController::recording
* @see app/Http/Controllers/Twilio/WebhookController.php:192
* @route '/twilio/recording'
*/
export const recording = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: recording.url(options),
    method: 'post',
})

recording.definition = {
    methods: ["post"],
    url: '/twilio/recording',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Twilio\WebhookController::recording
* @see app/Http/Controllers/Twilio/WebhookController.php:192
* @route '/twilio/recording'
*/
recording.url = (options?: RouteQueryOptions) => {
    return recording.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Twilio\WebhookController::recording
* @see app/Http/Controllers/Twilio/WebhookController.php:192
* @route '/twilio/recording'
*/
recording.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: recording.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Twilio\WebhookController::consentCallback
* @see app/Http/Controllers/Twilio/WebhookController.php:226
* @route '/twilio/consent-callback'
*/
export const consentCallback = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: consentCallback.url(options),
    method: 'post',
})

consentCallback.definition = {
    methods: ["post"],
    url: '/twilio/consent-callback',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Twilio\WebhookController::consentCallback
* @see app/Http/Controllers/Twilio/WebhookController.php:226
* @route '/twilio/consent-callback'
*/
consentCallback.url = (options?: RouteQueryOptions) => {
    return consentCallback.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Twilio\WebhookController::consentCallback
* @see app/Http/Controllers/Twilio/WebhookController.php:226
* @route '/twilio/consent-callback'
*/
consentCallback.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: consentCallback.url(options),
    method: 'post',
})

const WebhookController = { inbound, step, status, gather, recording, consentCallback }

export default WebhookController