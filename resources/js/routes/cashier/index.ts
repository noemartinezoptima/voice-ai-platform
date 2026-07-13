import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../wayfinder'
/**
* @see \Laravel\Cashier\Http\Controllers\PaymentController::payment
* @see vendor/laravel/cashier/src/Http/Controllers/PaymentController.php:30
* @route '/stripe/payment/{id}'
*/
export const payment = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: payment.url(args, options),
    method: 'get',
})

payment.definition = {
    methods: ["get","head"],
    url: '/stripe/payment/{id}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \Laravel\Cashier\Http\Controllers\PaymentController::payment
* @see vendor/laravel/cashier/src/Http/Controllers/PaymentController.php:30
* @route '/stripe/payment/{id}'
*/
payment.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { id: args }
    }

    if (Array.isArray(args)) {
        args = {
            id: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        id: args.id,
    }

    return payment.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \Laravel\Cashier\Http\Controllers\PaymentController::payment
* @see vendor/laravel/cashier/src/Http/Controllers/PaymentController.php:30
* @route '/stripe/payment/{id}'
*/
payment.get = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: payment.url(args, options),
    method: 'get',
})

/**
* @see \Laravel\Cashier\Http\Controllers\PaymentController::payment
* @see vendor/laravel/cashier/src/Http/Controllers/PaymentController.php:30
* @route '/stripe/payment/{id}'
*/
payment.head = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: payment.url(args, options),
    method: 'head',
})

const cashier = {
    payment: Object.assign(payment, payment),
}

export default cashier