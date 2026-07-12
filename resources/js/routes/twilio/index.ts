import { queryParams, type RouteQueryOptions, type RouteDefinition } from './../../wayfinder'
import oauth from './oauth'
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

const twilio = {
    consentCallback: Object.assign(consentCallback, consentCallback),
    oauth: Object.assign(oauth, oauth),
}

export default twilio