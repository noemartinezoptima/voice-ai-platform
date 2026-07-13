import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Web\FlowTestController::simulate
* @see app/Http/Controllers/Web/FlowTestController.php:14
* @route '/flows/{flow}/simulate'
*/
export const simulate = (args: { flow: string | number } | [flow: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: simulate.url(args, options),
    method: 'get',
})

simulate.definition = {
    methods: ["get","head"],
    url: '/flows/{flow}/simulate',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Web\FlowTestController::simulate
* @see app/Http/Controllers/Web/FlowTestController.php:14
* @route '/flows/{flow}/simulate'
*/
simulate.url = (args: { flow: string | number } | [flow: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { flow: args }
    }

    if (Array.isArray(args)) {
        args = {
            flow: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        flow: args.flow,
    }

    return simulate.definition.url
            .replace('{flow}', parsedArgs.flow.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Web\FlowTestController::simulate
* @see app/Http/Controllers/Web/FlowTestController.php:14
* @route '/flows/{flow}/simulate'
*/
simulate.get = (args: { flow: string | number } | [flow: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: simulate.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Web\FlowTestController::simulate
* @see app/Http/Controllers/Web/FlowTestController.php:14
* @route '/flows/{flow}/simulate'
*/
simulate.head = (args: { flow: string | number } | [flow: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: simulate.url(args, options),
    method: 'head',
})

const FlowTestController = { simulate }

export default FlowTestController