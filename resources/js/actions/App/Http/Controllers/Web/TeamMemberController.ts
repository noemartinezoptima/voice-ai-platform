import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Web\TeamMemberController::index
* @see app/Http/Controllers/Web/TeamMemberController.php:21
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
* @see app/Http/Controllers/Web/TeamMemberController.php:21
* @route '/team'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Web\TeamMemberController::index
* @see app/Http/Controllers/Web/TeamMemberController.php:21
* @route '/team'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Web\TeamMemberController::index
* @see app/Http/Controllers/Web/TeamMemberController.php:21
* @route '/team'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Web\TeamMemberController::invite
* @see app/Http/Controllers/Web/TeamMemberController.php:59
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
* @see app/Http/Controllers/Web/TeamMemberController.php:59
* @route '/team/invite'
*/
invite.url = (options?: RouteQueryOptions) => {
    return invite.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Web\TeamMemberController::invite
* @see app/Http/Controllers/Web/TeamMemberController.php:59
* @route '/team/invite'
*/
invite.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: invite.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Web\TeamMemberController::update
* @see app/Http/Controllers/Web/TeamMemberController.php:96
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
* @see app/Http/Controllers/Web/TeamMemberController.php:96
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
* @see app/Http/Controllers/Web/TeamMemberController.php:96
* @route '/team/{user}/role'
*/
update.patch = (args: { user: number | { id: number } } | [user: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update.url(args, options),
    method: 'patch',
})

/**
* @see \App\Http\Controllers\Web\TeamMemberController::destroy
* @see app/Http/Controllers/Web/TeamMemberController.php:119
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
* @see app/Http/Controllers/Web/TeamMemberController.php:119
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
* @see app/Http/Controllers/Web/TeamMemberController.php:119
* @route '/team/{user}'
*/
destroy.delete = (args: { user: number | { id: number } } | [user: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\Web\TeamMemberController::permissions
* @see app/Http/Controllers/Web/TeamMemberController.php:140
* @route '/team/{user}/permissions'
*/
export const permissions = (args: { user: number | { id: number } } | [user: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: permissions.url(args, options),
    method: 'get',
})

permissions.definition = {
    methods: ["get","head"],
    url: '/team/{user}/permissions',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Web\TeamMemberController::permissions
* @see app/Http/Controllers/Web/TeamMemberController.php:140
* @route '/team/{user}/permissions'
*/
permissions.url = (args: { user: number | { id: number } } | [user: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
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

    return permissions.definition.url
            .replace('{user}', parsedArgs.user.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Web\TeamMemberController::permissions
* @see app/Http/Controllers/Web/TeamMemberController.php:140
* @route '/team/{user}/permissions'
*/
permissions.get = (args: { user: number | { id: number } } | [user: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: permissions.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Web\TeamMemberController::permissions
* @see app/Http/Controllers/Web/TeamMemberController.php:140
* @route '/team/{user}/permissions'
*/
permissions.head = (args: { user: number | { id: number } } | [user: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: permissions.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Web\TeamMemberController::updatePermissions
* @see app/Http/Controllers/Web/TeamMemberController.php:155
* @route '/team/{user}/permissions'
*/
export const updatePermissions = (args: { user: number | { id: number } } | [user: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: updatePermissions.url(args, options),
    method: 'patch',
})

updatePermissions.definition = {
    methods: ["patch"],
    url: '/team/{user}/permissions',
} satisfies RouteDefinition<["patch"]>

/**
* @see \App\Http\Controllers\Web\TeamMemberController::updatePermissions
* @see app/Http/Controllers/Web/TeamMemberController.php:155
* @route '/team/{user}/permissions'
*/
updatePermissions.url = (args: { user: number | { id: number } } | [user: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
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

    return updatePermissions.definition.url
            .replace('{user}', parsedArgs.user.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Web\TeamMemberController::updatePermissions
* @see app/Http/Controllers/Web/TeamMemberController.php:155
* @route '/team/{user}/permissions'
*/
updatePermissions.patch = (args: { user: number | { id: number } } | [user: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: updatePermissions.url(args, options),
    method: 'patch',
})

const TeamMemberController = { index, invite, update, destroy, permissions, updatePermissions }

export default TeamMemberController