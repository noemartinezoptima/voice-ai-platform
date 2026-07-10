import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../wayfinder'
/**
* @see \App\Http\Controllers\Web\TeamMemberController::index
* @see app/Http/Controllers/Web/TeamMemberController.php:17
* @route '/team'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/team',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Web\TeamMemberController::index
* @see app/Http/Controllers/Web/TeamMemberController.php:17
* @route '/team'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Web\TeamMemberController::index
* @see app/Http/Controllers/Web/TeamMemberController.php:17
* @route '/team'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Web\TeamMemberController::index
* @see app/Http/Controllers/Web/TeamMemberController.php:17
* @route '/team'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Web\TeamMemberController::invite
* @see app/Http/Controllers/Web/TeamMemberController.php:53
* @route '/team/invite'
*/
export const invite = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: invite.url(options),
    method: 'post',
})

invite.definition = {
    methods: ["post"],
    url: '/team/invite',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Web\TeamMemberController::invite
* @see app/Http/Controllers/Web/TeamMemberController.php:53
* @route '/team/invite'
*/
invite.url = (options?: RouteQueryOptions) => {
    return invite.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Web\TeamMemberController::invite
* @see app/Http/Controllers/Web/TeamMemberController.php:53
* @route '/team/invite'
*/
invite.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: invite.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Web\TeamMemberController::update
* @see app/Http/Controllers/Web/TeamMemberController.php:90
* @route '/team/{user}/role'
*/
export const update = (args: { user: number | { id: number } } | [user: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update.url(args, options),
    method: 'patch',
})

update.definition = {
    methods: ["patch"],
    url: '/team/{user}/role',
} satisfies RouteDefinition<["patch"]>

/**
* @see \App\Http\Controllers\Web\TeamMemberController::update
* @see app/Http/Controllers/Web/TeamMemberController.php:90
* @route '/team/{user}/role'
*/
update.url = (args: { user: number | { id: number } } | [user: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { user: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { user: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            user: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        user: typeof args.user === 'object'
        ? args.user.id
        : args.user,
    }

    return update.definition.url
            .replace('{user}', parsedArgs.user.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Web\TeamMemberController::update
* @see app/Http/Controllers/Web/TeamMemberController.php:90
* @route '/team/{user}/role'
*/
update.patch = (args: { user: number | { id: number } } | [user: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update.url(args, options),
    method: 'patch',
})

/**
* @see \App\Http\Controllers\Web\TeamMemberController::destroy
* @see app/Http/Controllers/Web/TeamMemberController.php:112
* @route '/team/{user}'
*/
export const destroy = (args: { user: number | { id: number } } | [user: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/team/{user}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Web\TeamMemberController::destroy
* @see app/Http/Controllers/Web/TeamMemberController.php:112
* @route '/team/{user}'
*/
destroy.url = (args: { user: number | { id: number } } | [user: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { user: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { user: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            user: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        user: typeof args.user === 'object'
        ? args.user.id
        : args.user,
    }

    return destroy.definition.url
            .replace('{user}', parsedArgs.user.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Web\TeamMemberController::destroy
* @see app/Http/Controllers/Web/TeamMemberController.php:112
* @route '/team/{user}'
*/
destroy.delete = (args: { user: number | { id: number } } | [user: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

const team = {
    index: Object.assign(index, index),
    invite: Object.assign(invite, invite),
    update: Object.assign(update, update),
    destroy: Object.assign(destroy, destroy),
}

export default team