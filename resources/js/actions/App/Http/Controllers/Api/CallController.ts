import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Api\CallController::index
* @see app/Http/Controllers/Api/CallController.php:17
* @route '/api/v1/calls'
*/
const indexf28bc44ce7499a18eee2d671fb796913 = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: indexf28bc44ce7499a18eee2d671fb796913.url(options),
    method: 'get',
})

indexf28bc44ce7499a18eee2d671fb796913.definition = {
    methods: ["get","head"],
    url: '/api/v1/calls',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\CallController::index
* @see app/Http/Controllers/Api/CallController.php:17
* @route '/api/v1/calls'
*/
indexf28bc44ce7499a18eee2d671fb796913.url = (options?: RouteQueryOptions) => {
    return indexf28bc44ce7499a18eee2d671fb796913.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\CallController::index
* @see app/Http/Controllers/Api/CallController.php:17
* @route '/api/v1/calls'
*/
indexf28bc44ce7499a18eee2d671fb796913.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: indexf28bc44ce7499a18eee2d671fb796913.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\CallController::index
* @see app/Http/Controllers/Api/CallController.php:17
* @route '/api/v1/calls'
*/
indexf28bc44ce7499a18eee2d671fb796913.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: indexf28bc44ce7499a18eee2d671fb796913.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Api\CallController::index
* @see app/Http/Controllers/Api/CallController.php:17
* @route '/api/v2/calls'
*/
const index728b59fe7764ca9b7e32e9e7bdf950a1 = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index728b59fe7764ca9b7e32e9e7bdf950a1.url(options),
    method: 'get',
})

index728b59fe7764ca9b7e32e9e7bdf950a1.definition = {
    methods: ["get","head"],
    url: '/api/v2/calls',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\CallController::index
* @see app/Http/Controllers/Api/CallController.php:17
* @route '/api/v2/calls'
*/
index728b59fe7764ca9b7e32e9e7bdf950a1.url = (options?: RouteQueryOptions) => {
    return index728b59fe7764ca9b7e32e9e7bdf950a1.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\CallController::index
* @see app/Http/Controllers/Api/CallController.php:17
* @route '/api/v2/calls'
*/
index728b59fe7764ca9b7e32e9e7bdf950a1.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index728b59fe7764ca9b7e32e9e7bdf950a1.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\CallController::index
* @see app/Http/Controllers/Api/CallController.php:17
* @route '/api/v2/calls'
*/
index728b59fe7764ca9b7e32e9e7bdf950a1.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index728b59fe7764ca9b7e32e9e7bdf950a1.url(options),
    method: 'head',
})

/**
* Multiple routes resolve to \App\Http\Controllers\Api\CallController::index, so this export is a
* dictionary keyed by URI rather than a callable. Call a specific route with `index['<uri>'](...)`,
* or import the route by name from your generated `routes/` directory.
*/
export const index = {
    '/api/v1/calls': indexf28bc44ce7499a18eee2d671fb796913,
    '/api/v2/calls': index728b59fe7764ca9b7e32e9e7bdf950a1,
}

/**
* @see \App\Http\Controllers\Api\CallController::show
* @see app/Http/Controllers/Api/CallController.php:25
* @route '/api/v1/calls/{call}'
*/
const showefcebf90b14fdcc2bbfc141e818fac78 = (args: { call: string | number } | [call: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: showefcebf90b14fdcc2bbfc141e818fac78.url(args, options),
    method: 'get',
})

showefcebf90b14fdcc2bbfc141e818fac78.definition = {
    methods: ["get","head"],
    url: '/api/v1/calls/{call}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\CallController::show
* @see app/Http/Controllers/Api/CallController.php:25
* @route '/api/v1/calls/{call}'
*/
showefcebf90b14fdcc2bbfc141e818fac78.url = (args: { call: string | number } | [call: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return showefcebf90b14fdcc2bbfc141e818fac78.definition.url
            .replace('{call}', parsedArgs.call.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\CallController::show
* @see app/Http/Controllers/Api/CallController.php:25
* @route '/api/v1/calls/{call}'
*/
showefcebf90b14fdcc2bbfc141e818fac78.get = (args: { call: string | number } | [call: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: showefcebf90b14fdcc2bbfc141e818fac78.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\CallController::show
* @see app/Http/Controllers/Api/CallController.php:25
* @route '/api/v1/calls/{call}'
*/
showefcebf90b14fdcc2bbfc141e818fac78.head = (args: { call: string | number } | [call: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: showefcebf90b14fdcc2bbfc141e818fac78.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Api\CallController::show
* @see app/Http/Controllers/Api/CallController.php:25
* @route '/api/v2/calls/{call}'
*/
const show57f7ac770a3dda42b5dddf37f784cfa1 = (args: { call: string | number } | [call: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show57f7ac770a3dda42b5dddf37f784cfa1.url(args, options),
    method: 'get',
})

show57f7ac770a3dda42b5dddf37f784cfa1.definition = {
    methods: ["get","head"],
    url: '/api/v2/calls/{call}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\CallController::show
* @see app/Http/Controllers/Api/CallController.php:25
* @route '/api/v2/calls/{call}'
*/
show57f7ac770a3dda42b5dddf37f784cfa1.url = (args: { call: string | number } | [call: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return show57f7ac770a3dda42b5dddf37f784cfa1.definition.url
            .replace('{call}', parsedArgs.call.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\CallController::show
* @see app/Http/Controllers/Api/CallController.php:25
* @route '/api/v2/calls/{call}'
*/
show57f7ac770a3dda42b5dddf37f784cfa1.get = (args: { call: string | number } | [call: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show57f7ac770a3dda42b5dddf37f784cfa1.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\CallController::show
* @see app/Http/Controllers/Api/CallController.php:25
* @route '/api/v2/calls/{call}'
*/
show57f7ac770a3dda42b5dddf37f784cfa1.head = (args: { call: string | number } | [call: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show57f7ac770a3dda42b5dddf37f784cfa1.url(args, options),
    method: 'head',
})

/**
* Multiple routes resolve to \App\Http\Controllers\Api\CallController::show, so this export is a
* dictionary keyed by URI rather than a callable. Call a specific route with `show['<uri>'](...)`,
* or import the route by name from your generated `routes/` directory.
*/
export const show = {
    '/api/v1/calls/{call}': showefcebf90b14fdcc2bbfc141e818fac78,
    '/api/v2/calls/{call}': show57f7ac770a3dda42b5dddf37f784cfa1,
}

/**
* @see \App\Http\Controllers\Api\CallController::transcript
* @see app/Http/Controllers/Api/CallController.php:36
* @route '/api/v1/calls/{call}/transcript'
*/
const transcriptea3e72b4e470c30a3279c2c2e3083a30 = (args: { call: string | number } | [call: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: transcriptea3e72b4e470c30a3279c2c2e3083a30.url(args, options),
    method: 'get',
})

transcriptea3e72b4e470c30a3279c2c2e3083a30.definition = {
    methods: ["get","head"],
    url: '/api/v1/calls/{call}/transcript',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\CallController::transcript
* @see app/Http/Controllers/Api/CallController.php:36
* @route '/api/v1/calls/{call}/transcript'
*/
transcriptea3e72b4e470c30a3279c2c2e3083a30.url = (args: { call: string | number } | [call: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return transcriptea3e72b4e470c30a3279c2c2e3083a30.definition.url
            .replace('{call}', parsedArgs.call.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\CallController::transcript
* @see app/Http/Controllers/Api/CallController.php:36
* @route '/api/v1/calls/{call}/transcript'
*/
transcriptea3e72b4e470c30a3279c2c2e3083a30.get = (args: { call: string | number } | [call: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: transcriptea3e72b4e470c30a3279c2c2e3083a30.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\CallController::transcript
* @see app/Http/Controllers/Api/CallController.php:36
* @route '/api/v1/calls/{call}/transcript'
*/
transcriptea3e72b4e470c30a3279c2c2e3083a30.head = (args: { call: string | number } | [call: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: transcriptea3e72b4e470c30a3279c2c2e3083a30.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Api\CallController::transcript
* @see app/Http/Controllers/Api/CallController.php:36
* @route '/api/v2/calls/{call}/transcript'
*/
const transcript31743b37c0b576e3af4f1fc5b26e1f94 = (args: { call: string | number } | [call: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: transcript31743b37c0b576e3af4f1fc5b26e1f94.url(args, options),
    method: 'get',
})

transcript31743b37c0b576e3af4f1fc5b26e1f94.definition = {
    methods: ["get","head"],
    url: '/api/v2/calls/{call}/transcript',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\CallController::transcript
* @see app/Http/Controllers/Api/CallController.php:36
* @route '/api/v2/calls/{call}/transcript'
*/
transcript31743b37c0b576e3af4f1fc5b26e1f94.url = (args: { call: string | number } | [call: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return transcript31743b37c0b576e3af4f1fc5b26e1f94.definition.url
            .replace('{call}', parsedArgs.call.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\CallController::transcript
* @see app/Http/Controllers/Api/CallController.php:36
* @route '/api/v2/calls/{call}/transcript'
*/
transcript31743b37c0b576e3af4f1fc5b26e1f94.get = (args: { call: string | number } | [call: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: transcript31743b37c0b576e3af4f1fc5b26e1f94.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\CallController::transcript
* @see app/Http/Controllers/Api/CallController.php:36
* @route '/api/v2/calls/{call}/transcript'
*/
transcript31743b37c0b576e3af4f1fc5b26e1f94.head = (args: { call: string | number } | [call: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: transcript31743b37c0b576e3af4f1fc5b26e1f94.url(args, options),
    method: 'head',
})

/**
* Multiple routes resolve to \App\Http\Controllers\Api\CallController::transcript, so this export is a
* dictionary keyed by URI rather than a callable. Call a specific route with `transcript['<uri>'](...)`,
* or import the route by name from your generated `routes/` directory.
*/
export const transcript = {
    '/api/v1/calls/{call}/transcript': transcriptea3e72b4e470c30a3279c2c2e3083a30,
    '/api/v2/calls/{call}/transcript': transcript31743b37c0b576e3af4f1fc5b26e1f94,
}

const CallController = { index, show, transcript }

export default CallController