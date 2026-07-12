import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../wayfinder'
/**
* @see \App\Http\Controllers\Web\RecordingController::play
* @see app/Http/Controllers/Web/RecordingController.php:14
* @route '/recordings/{call}/play'
*/
export const play = (args: { call: string | { id: string } } | [call: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: play.url(args, options),
    method: 'get',
})

play.definition = {
    methods: ["get","head"],
    url: '/recordings/{call}/play',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Web\RecordingController::play
* @see app/Http/Controllers/Web/RecordingController.php:14
* @route '/recordings/{call}/play'
*/
play.url = (args: { call: string | { id: string } } | [call: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { call: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { call: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            call: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        call: typeof args.call === 'object'
        ? args.call.id
        : args.call,
    }

    return play.definition.url
            .replace('{call}', parsedArgs.call.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Web\RecordingController::play
* @see app/Http/Controllers/Web/RecordingController.php:14
* @route '/recordings/{call}/play'
*/
play.get = (args: { call: string | { id: string } } | [call: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: play.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Web\RecordingController::play
* @see app/Http/Controllers/Web/RecordingController.php:14
* @route '/recordings/{call}/play'
*/
play.head = (args: { call: string | { id: string } } | [call: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: play.url(args, options),
    method: 'head',
})

const recordings = {
    play: Object.assign(play, play),
}

export default recordings