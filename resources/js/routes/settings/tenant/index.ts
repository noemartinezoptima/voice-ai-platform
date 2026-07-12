import { queryParams, type RouteQueryOptions, type RouteDefinition } from './../../../wayfinder'
/**
* @see \App\Http\Controllers\Web\TenantSettingsController::update
* @see app/Http/Controllers/Web/TenantSettingsController.php:72
* @route '/settings/tenant'
*/
export const update = (options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update.url(options),
    method: 'patch',
})

update.definition = {
    methods: ["patch"],
    url: '/settings/tenant',
} satisfies RouteDefinition<["patch"]>

/**
* @see \App\Http\Controllers\Web\TenantSettingsController::update
* @see app/Http/Controllers/Web/TenantSettingsController.php:72
* @route '/settings/tenant'
*/
update.url = (options?: RouteQueryOptions) => {
    return update.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Web\TenantSettingsController::update
* @see app/Http/Controllers/Web/TenantSettingsController.php:72
* @route '/settings/tenant'
*/
update.patch = (options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update.url(options),
    method: 'patch',
})

const tenant = {
    update: Object.assign(update, update),
}

export default tenant