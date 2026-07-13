import { queryParams, type RouteQueryOptions, type RouteDefinition } from './../../wayfinder'
/**
* @see \App\Http\Controllers\Web\BillingController::index
* @see app/Http/Controllers/Web/BillingController.php:16
* @route '/billing'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/billing',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Web\BillingController::index
* @see app/Http/Controllers/Web/BillingController.php:16
* @route '/billing'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Web\BillingController::index
* @see app/Http/Controllers/Web/BillingController.php:16
* @route '/billing'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Web\BillingController::index
* @see app/Http/Controllers/Web/BillingController.php:16
* @route '/billing'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Web\BillingController::update
* @see app/Http/Controllers/Web/BillingController.php:33
* @route '/billing/plan'
*/
export const update = (options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update.url(options),
    method: 'patch',
})

update.definition = {
    methods: ["patch"],
    url: '/billing/plan',
} satisfies RouteDefinition<["patch"]>

/**
* @see \App\Http\Controllers\Web\BillingController::update
* @see app/Http/Controllers/Web/BillingController.php:33
* @route '/billing/plan'
*/
update.url = (options?: RouteQueryOptions) => {
    return update.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Web\BillingController::update
* @see app/Http/Controllers/Web/BillingController.php:33
* @route '/billing/plan'
*/
update.patch = (options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update.url(options),
    method: 'patch',
})

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

const billing = {
    index: Object.assign(index, index),
    update: Object.assign(update, update),
    checkout: Object.assign(checkout, checkout),
    portal: Object.assign(portal, portal),
}

export default billing