import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Api\V2\CallQualityController::show
* @see app/Http/Controllers/Api/V2/CallQualityController.php:12
* @route '/api/v2/calls/{call}/quality'
*/
export const show = (args: { call: string | number } | [call: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/api/v2/calls/{call}/quality',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\V2\CallQualityController::show
* @see app/Http/Controllers/Api/V2/CallQualityController.php:12
* @route '/api/v2/calls/{call}/quality'
*/
show.url = (args: { call: string | number } | [call: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { call: args }
    }

    if (Array.isArray(args)) {
        args = {
            call: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        call: args.call,
    }

    return show.definition.url
            .replace('{call}', parsedArgs.call.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\V2\CallQualityController::show
* @see app/Http/Controllers/Api/V2/CallQualityController.php:12
* @route '/api/v2/calls/{call}/quality'
*/
show.get = (args: { call: string | number } | [call: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\V2\CallQualityController::show
* @see app/Http/Controllers/Api/V2/CallQualityController.php:12
* @route '/api/v2/calls/{call}/quality'
*/
show.head = (args: { call: string | number } | [call: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(args, options),
    method: 'head',
})

const CallQualityController = { show }

export default CallQualityController