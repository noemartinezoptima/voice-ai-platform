import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../../wayfinder'
/**
* @see \App\Http\Controllers\Web\DocumentsController::index
* @see app/Http/Controllers/Web/DocumentsController.php:29
* @route '/settings/documents'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/settings/documents',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Web\DocumentsController::index
* @see app/Http/Controllers/Web/DocumentsController.php:29
* @route '/settings/documents'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Web\DocumentsController::index
* @see app/Http/Controllers/Web/DocumentsController.php:29
* @route '/settings/documents'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Web\DocumentsController::index
* @see app/Http/Controllers/Web/DocumentsController.php:29
* @route '/settings/documents'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Web\DocumentsController::create
* @see app/Http/Controllers/Web/DocumentsController.php:40
* @route '/settings/documents/create'
*/
export const create = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: create.url(options),
    method: 'get',
})

create.definition = {
    methods: ["get","head"],
    url: '/settings/documents/create',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Web\DocumentsController::create
* @see app/Http/Controllers/Web/DocumentsController.php:40
* @route '/settings/documents/create'
*/
create.url = (options?: RouteQueryOptions) => {
    return create.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Web\DocumentsController::create
* @see app/Http/Controllers/Web/DocumentsController.php:40
* @route '/settings/documents/create'
*/
create.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: create.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Web\DocumentsController::create
* @see app/Http/Controllers/Web/DocumentsController.php:40
* @route '/settings/documents/create'
*/
create.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: create.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Web\DocumentsController::store
* @see app/Http/Controllers/Web/DocumentsController.php:52
* @route '/settings/documents'
*/
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/settings/documents',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Web\DocumentsController::store
* @see app/Http/Controllers/Web/DocumentsController.php:52
* @route '/settings/documents'
*/
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Web\DocumentsController::store
* @see app/Http/Controllers/Web/DocumentsController.php:52
* @route '/settings/documents'
*/
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Web\DocumentsController::show
* @see app/Http/Controllers/Web/DocumentsController.php:77
* @route '/settings/documents/{document}'
*/
export const show = (args: { document: string | number } | [document: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/settings/documents/{document}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Web\DocumentsController::show
* @see app/Http/Controllers/Web/DocumentsController.php:77
* @route '/settings/documents/{document}'
*/
show.url = (args: { document: string | number } | [document: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { document: args }
    }

    if (Array.isArray(args)) {
        args = {
            document: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        document: args.document,
    }

    return show.definition.url
            .replace('{document}', parsedArgs.document.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Web\DocumentsController::show
* @see app/Http/Controllers/Web/DocumentsController.php:77
* @route '/settings/documents/{document}'
*/
show.get = (args: { document: string | number } | [document: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Web\DocumentsController::show
* @see app/Http/Controllers/Web/DocumentsController.php:77
* @route '/settings/documents/{document}'
*/
show.head = (args: { document: string | number } | [document: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Web\DocumentsController::destroy
* @see app/Http/Controllers/Web/DocumentsController.php:96
* @route '/settings/documents/{document}'
*/
export const destroy = (args: { document: string | number } | [document: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/settings/documents/{document}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Web\DocumentsController::destroy
* @see app/Http/Controllers/Web/DocumentsController.php:96
* @route '/settings/documents/{document}'
*/
destroy.url = (args: { document: string | number } | [document: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { document: args }
    }

    if (Array.isArray(args)) {
        args = {
            document: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        document: args.document,
    }

    return destroy.definition.url
            .replace('{document}', parsedArgs.document.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Web\DocumentsController::destroy
* @see app/Http/Controllers/Web/DocumentsController.php:96
* @route '/settings/documents/{document}'
*/
destroy.delete = (args: { document: string | number } | [document: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\Web\DocumentsController::reprocess
* @see app/Http/Controllers/Web/DocumentsController.php:110
* @route '/settings/documents/{document}/reprocess'
*/
export const reprocess = (args: { document: string | number } | [document: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: reprocess.url(args, options),
    method: 'post',
})

reprocess.definition = {
    methods: ["post"],
    url: '/settings/documents/{document}/reprocess',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Web\DocumentsController::reprocess
* @see app/Http/Controllers/Web/DocumentsController.php:110
* @route '/settings/documents/{document}/reprocess'
*/
reprocess.url = (args: { document: string | number } | [document: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { document: args }
    }

    if (Array.isArray(args)) {
        args = {
            document: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        document: args.document,
    }

    return reprocess.definition.url
            .replace('{document}', parsedArgs.document.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Web\DocumentsController::reprocess
* @see app/Http/Controllers/Web/DocumentsController.php:110
* @route '/settings/documents/{document}/reprocess'
*/
reprocess.post = (args: { document: string | number } | [document: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: reprocess.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Web\DocumentsController::upload
* @see app/Http/Controllers/Web/DocumentsController.php:123
* @route '/settings/documents/upload'
*/
export const upload = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: upload.url(options),
    method: 'post',
})

upload.definition = {
    methods: ["post"],
    url: '/settings/documents/upload',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Web\DocumentsController::upload
* @see app/Http/Controllers/Web/DocumentsController.php:123
* @route '/settings/documents/upload'
*/
upload.url = (options?: RouteQueryOptions) => {
    return upload.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Web\DocumentsController::upload
* @see app/Http/Controllers/Web/DocumentsController.php:123
* @route '/settings/documents/upload'
*/
upload.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: upload.url(options),
    method: 'post',
})

const documents = {
    index: Object.assign(index, index),
    create: Object.assign(create, create),
    store: Object.assign(store, store),
    show: Object.assign(show, show),
    destroy: Object.assign(destroy, destroy),
    reprocess: Object.assign(reprocess, reprocess),
    upload: Object.assign(upload, upload),
}

export default documents