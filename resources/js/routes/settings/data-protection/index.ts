import { queryParams, type RouteQueryOptions, type RouteDefinition } from './../../../wayfinder'
/**
* @see \App\Http\Controllers\Web\DataProtectionController::update
* @see app/Http/Controllers/Web/DataProtectionController.php:26
* @route '/settings/data-protection'
*/
export const update = (options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update.url(options),
    method: 'patch',
})

update.definition = {
    methods: ["patch"],
    url: '/settings/data-protection',
} satisfies RouteDefinition<["patch"]>

/**
* @see \App\Http\Controllers\Web\DataProtectionController::update
* @see app/Http/Controllers/Web/DataProtectionController.php:26
* @route '/settings/data-protection'
*/
update.url = (options?: RouteQueryOptions) => {
    return update.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Web\DataProtectionController::update
* @see app/Http/Controllers/Web/DataProtectionController.php:26
* @route '/settings/data-protection'
*/
update.patch = (options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update.url(options),
    method: 'patch',
})

const dataProtection = {
    update: Object.assign(update, update),
}

export default dataProtection