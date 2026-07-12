import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../../wayfinder'
/**
* @see \App\Http\Controllers\Web\VoiceController::index
* @see app/Http/Controllers/Web/VoiceController.php:21
* @route '/settings/voices'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/settings/voices',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Web\VoiceController::index
* @see app/Http/Controllers/Web/VoiceController.php:21
* @route '/settings/voices'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Web\VoiceController::index
* @see app/Http/Controllers/Web/VoiceController.php:21
* @route '/settings/voices'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Web\VoiceController::index
* @see app/Http/Controllers/Web/VoiceController.php:21
* @route '/settings/voices'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Web\VoiceController::store
* @see app/Http/Controllers/Web/VoiceController.php:30
* @route '/settings/voices'
*/
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/settings/voices',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Web\VoiceController::store
* @see app/Http/Controllers/Web/VoiceController.php:30
* @route '/settings/voices'
*/
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Web\VoiceController::store
* @see app/Http/Controllers/Web/VoiceController.php:30
* @route '/settings/voices'
*/
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Web\VoiceController::destroy
* @see app/Http/Controllers/Web/VoiceController.php:124
* @route '/settings/voices/{voice}'
*/
export const destroy = (args: { voice: string | number } | [voice: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/settings/voices/{voice}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Web\VoiceController::destroy
* @see app/Http/Controllers/Web/VoiceController.php:124
* @route '/settings/voices/{voice}'
*/
destroy.url = (args: { voice: string | number } | [voice: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { voice: args }
    }

    if (Array.isArray(args)) {
        args = {
            voice: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        voice: args.voice,
    }

    return destroy.definition.url
            .replace('{voice}', parsedArgs.voice.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Web\VoiceController::destroy
* @see app/Http/Controllers/Web/VoiceController.php:124
* @route '/settings/voices/{voice}'
*/
destroy.delete = (args: { voice: string | number } | [voice: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

const voices = {
    index: Object.assign(index, index),
    store: Object.assign(store, store),
    destroy: Object.assign(destroy, destroy),
}

export default voices