import { queryParams, type RouteQueryOptions, type RouteDefinition } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Web\DataProtectionController::edit
* @see app/Http/Controllers/Web/DataProtectionController.php:14
* @route '/settings/data-protection'
*/
export const edit = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: edit.url(options),
    method: 'get',
})

edit.definition = {
    methods: ["get","head"],
    url: '/settings/data-protection',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Web\DataProtectionController::edit
* @see app/Http/Controllers/Web/DataProtectionController.php:14
* @route '/settings/data-protection'
*/
edit.url = (options?: RouteQueryOptions) => {
    return edit.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Web\DataProtectionController::edit
* @see app/Http/Controllers/Web/DataProtectionController.php:14
* @route '/settings/data-protection'
*/
edit.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: edit.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Web\DataProtectionController::edit
* @see app/Http/Controllers/Web/DataProtectionController.php:14
* @route '/settings/data-protection'
*/
edit.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: edit.url(options),
    method: 'head',
})

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

const DataProtectionController = { edit, update }

export default DataProtectionController