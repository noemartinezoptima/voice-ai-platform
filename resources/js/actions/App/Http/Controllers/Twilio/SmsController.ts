import { queryParams, type RouteQueryOptions, type RouteDefinition } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Twilio\SmsController::inbound
* @see app/Http/Controllers/Twilio/SmsController.php:13
* @route '/twilio/sms/inbound'
*/
export const inbound = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: inbound.url(options),
    method: 'post',
})

inbound.definition = {
    methods: ["post"],
    url: '/twilio/sms/inbound',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Twilio\SmsController::inbound
* @see app/Http/Controllers/Twilio/SmsController.php:13
* @route '/twilio/sms/inbound'
*/
inbound.url = (options?: RouteQueryOptions) => {
    return inbound.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Twilio\SmsController::inbound
* @see app/Http/Controllers/Twilio/SmsController.php:13
* @route '/twilio/sms/inbound'
*/
inbound.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: inbound.url(options),
    method: 'post',
})

const SmsController = { inbound }

export default SmsController