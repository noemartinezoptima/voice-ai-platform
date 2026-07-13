import { queryParams, type RouteQueryOptions, type RouteDefinition } from './../../../../../wayfinder'
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
* @see \App\Http\Controllers\Web\BillingController::updatePlan
* @see app/Http/Controllers/Web/BillingController.php:33
* @route '/billing/plan'
*/
export const updatePlan = (options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: updatePlan.url(options),
    method: 'patch',
})

updatePlan.definition = {
    methods: ["patch"],
    url: '/billing/plan',
} satisfies RouteDefinition<["patch"]>

/**
* @see \App\Http\Controllers\Web\BillingController::updatePlan
* @see app/Http/Controllers/Web/BillingController.php:33
* @route '/billing/plan'
*/
updatePlan.url = (options?: RouteQueryOptions) => {
    return updatePlan.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Web\BillingController::updatePlan
* @see app/Http/Controllers/Web/BillingController.php:33
* @route '/billing/plan'
*/
updatePlan.patch = (options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: updatePlan.url(options),
    method: 'patch',
})

const BillingController = { index, updatePlan }

export default BillingController