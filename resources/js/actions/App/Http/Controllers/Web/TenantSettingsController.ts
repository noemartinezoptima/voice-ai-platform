import { queryParams, type RouteQueryOptions, type RouteDefinition } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Web\TenantSettingsController::edit
* @see app/Http/Controllers/Web/TenantSettingsController.php:23
* @route '/settings/tenant'
*/
export const edit = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: edit.url(options),
    method: 'get',
})

edit.definition = {
    methods: ["get","head"],
    url: '/settings/tenant',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Web\TenantSettingsController::edit
* @see app/Http/Controllers/Web/TenantSettingsController.php:23
* @route '/settings/tenant'
*/
edit.url = (options?: RouteQueryOptions) => {
    return edit.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Web\TenantSettingsController::edit
* @see app/Http/Controllers/Web/TenantSettingsController.php:23
* @route '/settings/tenant'
*/
edit.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: edit.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Web\TenantSettingsController::edit
* @see app/Http/Controllers/Web/TenantSettingsController.php:23
* @route '/settings/tenant'
*/
edit.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: edit.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Web\TenantSettingsController::update
* @see app/Http/Controllers/Web/TenantSettingsController.php:70
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
* @see app/Http/Controllers/Web/TenantSettingsController.php:70
* @route '/settings/tenant'
*/
update.url = (options?: RouteQueryOptions) => {
    return update.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Web\TenantSettingsController::update
* @see app/Http/Controllers/Web/TenantSettingsController.php:70
* @route '/settings/tenant'
*/
update.patch = (options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update.url(options),
    method: 'patch',
})

const TenantSettingsController = { edit, update }

export default TenantSettingsController