import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../../wayfinder'
/**
* @see \App\Http\Controllers\Web\SmsAutoReplyController::index
* @see app/Http/Controllers/Web/SmsAutoReplyController.php:14
* @route '/sms/auto-replies'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/sms/auto-replies',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Web\SmsAutoReplyController::index
* @see app/Http/Controllers/Web/SmsAutoReplyController.php:14
* @route '/sms/auto-replies'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Web\SmsAutoReplyController::index
* @see app/Http/Controllers/Web/SmsAutoReplyController.php:14
* @route '/sms/auto-replies'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Web\SmsAutoReplyController::index
* @see app/Http/Controllers/Web/SmsAutoReplyController.php:14
* @route '/sms/auto-replies'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Web\SmsAutoReplyController::store
* @see app/Http/Controllers/Web/SmsAutoReplyController.php:25
* @route '/sms/auto-replies'
*/
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/sms/auto-replies',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Web\SmsAutoReplyController::store
* @see app/Http/Controllers/Web/SmsAutoReplyController.php:25
* @route '/sms/auto-replies'
*/
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Web\SmsAutoReplyController::store
* @see app/Http/Controllers/Web/SmsAutoReplyController.php:25
* @route '/sms/auto-replies'
*/
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Web\SmsAutoReplyController::update
* @see app/Http/Controllers/Web/SmsAutoReplyController.php:44
* @route '/sms/auto-replies/{sms_auto_reply}'
*/
export const update = (args: { sms_auto_reply: string | { id: string } } | [sms_auto_reply: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update.url(args, options),
    method: 'patch',
})

update.definition = {
    methods: ["patch"],
    url: '/sms/auto-replies/{sms_auto_reply}',
} satisfies RouteDefinition<["patch"]>

/**
* @see \App\Http\Controllers\Web\SmsAutoReplyController::update
* @see app/Http/Controllers/Web/SmsAutoReplyController.php:44
* @route '/sms/auto-replies/{sms_auto_reply}'
*/
update.url = (args: { sms_auto_reply: string | { id: string } } | [sms_auto_reply: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { sms_auto_reply: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { sms_auto_reply: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            sms_auto_reply: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        sms_auto_reply: typeof args.sms_auto_reply === 'object'
        ? args.sms_auto_reply.id
        : args.sms_auto_reply,
    }

    return update.definition.url
            .replace('{sms_auto_reply}', parsedArgs.sms_auto_reply.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Web\SmsAutoReplyController::update
* @see app/Http/Controllers/Web/SmsAutoReplyController.php:44
* @route '/sms/auto-replies/{sms_auto_reply}'
*/
update.patch = (args: { sms_auto_reply: string | { id: string } } | [sms_auto_reply: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update.url(args, options),
    method: 'patch',
})

/**
* @see \App\Http\Controllers\Web\SmsAutoReplyController::destroy
* @see app/Http/Controllers/Web/SmsAutoReplyController.php:63
* @route '/sms/auto-replies/{sms_auto_reply}'
*/
export const destroy = (args: { sms_auto_reply: string | { id: string } } | [sms_auto_reply: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/sms/auto-replies/{sms_auto_reply}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Web\SmsAutoReplyController::destroy
* @see app/Http/Controllers/Web/SmsAutoReplyController.php:63
* @route '/sms/auto-replies/{sms_auto_reply}'
*/
destroy.url = (args: { sms_auto_reply: string | { id: string } } | [sms_auto_reply: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { sms_auto_reply: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { sms_auto_reply: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            sms_auto_reply: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        sms_auto_reply: typeof args.sms_auto_reply === 'object'
        ? args.sms_auto_reply.id
        : args.sms_auto_reply,
    }

    return destroy.definition.url
            .replace('{sms_auto_reply}', parsedArgs.sms_auto_reply.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Web\SmsAutoReplyController::destroy
* @see app/Http/Controllers/Web/SmsAutoReplyController.php:63
* @route '/sms/auto-replies/{sms_auto_reply}'
*/
destroy.delete = (args: { sms_auto_reply: string | { id: string } } | [sms_auto_reply: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

const autoReplies = {
    index: Object.assign(index, index),
    store: Object.assign(store, store),
    update: Object.assign(update, update),
    destroy: Object.assign(destroy, destroy),
}

export default autoReplies