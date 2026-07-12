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
* @see app/Http/Controllers/Web/BillingController.php:32
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
* @see app/Http/Controllers/Web/BillingController.php:32
* @route '/billing/plan'
*/
update.url = (options?: RouteQueryOptions) => {
    return update.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Web\BillingController::update
* @see app/Http/Controllers/Web/BillingController.php:32
* @route '/billing/plan'
*/
update.patch = (options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update.url(options),
    method: 'patch',
})

const billing = {
    index: Object.assign(index, index),
    update: Object.assign(update, update),
}

export default billing