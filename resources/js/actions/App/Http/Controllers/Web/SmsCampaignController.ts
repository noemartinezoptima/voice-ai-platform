import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Web\SmsCampaignController::index
* @see app/Http/Controllers/Web/SmsCampaignController.php:20
* @route '/sms/campaigns'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/sms/campaigns',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Web\SmsCampaignController::index
* @see app/Http/Controllers/Web/SmsCampaignController.php:20
* @route '/sms/campaigns'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Web\SmsCampaignController::index
* @see app/Http/Controllers/Web/SmsCampaignController.php:20
* @route '/sms/campaigns'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Web\SmsCampaignController::index
* @see app/Http/Controllers/Web/SmsCampaignController.php:20
* @route '/sms/campaigns'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Web\SmsCampaignController::store
* @see app/Http/Controllers/Web/SmsCampaignController.php:31
* @route '/sms/campaigns'
*/
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/sms/campaigns',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Web\SmsCampaignController::store
* @see app/Http/Controllers/Web/SmsCampaignController.php:31
* @route '/sms/campaigns'
*/
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Web\SmsCampaignController::store
* @see app/Http/Controllers/Web/SmsCampaignController.php:31
* @route '/sms/campaigns'
*/
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Web\SmsCampaignController::send
* @see app/Http/Controllers/Web/SmsCampaignController.php:59
* @route '/sms/campaigns/{sms_campaign}/send'
*/
export const send = (args: { sms_campaign: string | { id: string } } | [sms_campaign: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: send.url(args, options),
    method: 'post',
})

send.definition = {
    methods: ["post"],
    url: '/sms/campaigns/{sms_campaign}/send',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Web\SmsCampaignController::send
* @see app/Http/Controllers/Web/SmsCampaignController.php:59
* @route '/sms/campaigns/{sms_campaign}/send'
*/
send.url = (args: { sms_campaign: string | { id: string } } | [sms_campaign: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { sms_campaign: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { sms_campaign: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            sms_campaign: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        sms_campaign: typeof args.sms_campaign === 'object'
        ? args.sms_campaign.id
        : args.sms_campaign,
    }

    return send.definition.url
            .replace('{sms_campaign}', parsedArgs.sms_campaign.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Web\SmsCampaignController::send
* @see app/Http/Controllers/Web/SmsCampaignController.php:59
* @route '/sms/campaigns/{sms_campaign}/send'
*/
send.post = (args: { sms_campaign: string | { id: string } } | [sms_campaign: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: send.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Web\SmsCampaignController::destroy
* @see app/Http/Controllers/Web/SmsCampaignController.php:88
* @route '/sms/campaigns/{sms_campaign}'
*/
export const destroy = (args: { sms_campaign: string | { id: string } } | [sms_campaign: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/sms/campaigns/{sms_campaign}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Web\SmsCampaignController::destroy
* @see app/Http/Controllers/Web/SmsCampaignController.php:88
* @route '/sms/campaigns/{sms_campaign}'
*/
destroy.url = (args: { sms_campaign: string | { id: string } } | [sms_campaign: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { sms_campaign: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { sms_campaign: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            sms_campaign: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        sms_campaign: typeof args.sms_campaign === 'object'
        ? args.sms_campaign.id
        : args.sms_campaign,
    }

    return destroy.definition.url
            .replace('{sms_campaign}', parsedArgs.sms_campaign.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Web\SmsCampaignController::destroy
* @see app/Http/Controllers/Web/SmsCampaignController.php:88
* @route '/sms/campaigns/{sms_campaign}'
*/
destroy.delete = (args: { sms_campaign: string | { id: string } } | [sms_campaign: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

const SmsCampaignController = { index, store, send, destroy }

export default SmsCampaignController