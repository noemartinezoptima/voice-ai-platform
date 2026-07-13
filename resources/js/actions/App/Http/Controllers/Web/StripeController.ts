import { queryParams, type RouteQueryOptions, type RouteDefinition } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Web\StripeController::checkout
* @see app/Http/Controllers/Web/StripeController.php:15
* @route '/billing/checkout'
*/
export const checkout = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: checkout.url(options),
    method: 'post',
})

checkout.definition = {
    methods: ["post"],
    url: '/billing/checkout',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Web\StripeController::checkout
* @see app/Http/Controllers/Web/StripeController.php:15
* @route '/billing/checkout'
*/
checkout.url = (options?: RouteQueryOptions) => {
    return checkout.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Web\StripeController::checkout
* @see app/Http/Controllers/Web/StripeController.php:15
* @route '/billing/checkout'
*/
checkout.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: checkout.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Web\StripeController::portal
* @see app/Http/Controllers/Web/StripeController.php:41
* @route '/billing/portal'
*/
export const portal = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: portal.url(options),
    method: 'post',
})

portal.definition = {
    methods: ["post"],
    url: '/billing/portal',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Web\StripeController::portal
* @see app/Http/Controllers/Web/StripeController.php:41
* @route '/billing/portal'
*/
portal.url = (options?: RouteQueryOptions) => {
    return portal.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Web\StripeController::portal
* @see app/Http/Controllers/Web/StripeController.php:41
* @route '/billing/portal'
*/
portal.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: portal.url(options),
    method: 'post',
})

const StripeController = { checkout, portal }

export default StripeController