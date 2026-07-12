import { queryParams, type RouteQueryOptions, type RouteDefinition } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Web\VoiceSettingsController::edit
* @see app/Http/Controllers/Web/VoiceSettingsController.php:21
* @route '/settings/voice'
*/
export const edit = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: edit.url(options),
    method: 'get',
})

edit.definition = {
    methods: ["get","head"],
    url: '/settings/voice',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Web\VoiceSettingsController::edit
* @see app/Http/Controllers/Web/VoiceSettingsController.php:21
* @route '/settings/voice'
*/
edit.url = (options?: RouteQueryOptions) => {
    return edit.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Web\VoiceSettingsController::edit
* @see app/Http/Controllers/Web/VoiceSettingsController.php:21
* @route '/settings/voice'
*/
edit.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: edit.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Web\VoiceSettingsController::edit
* @see app/Http/Controllers/Web/VoiceSettingsController.php:21
* @route '/settings/voice'
*/
edit.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: edit.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Web\VoiceSettingsController::update
* @see app/Http/Controllers/Web/VoiceSettingsController.php:42
* @route '/settings/voice'
*/
export const update = (options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update.url(options),
    method: 'patch',
})

update.definition = {
    methods: ["patch"],
    url: '/settings/voice',
} satisfies RouteDefinition<["patch"]>

/**
* @see \App\Http\Controllers\Web\VoiceSettingsController::update
* @see app/Http/Controllers/Web/VoiceSettingsController.php:42
* @route '/settings/voice'
*/
update.url = (options?: RouteQueryOptions) => {
    return update.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Web\VoiceSettingsController::update
* @see app/Http/Controllers/Web/VoiceSettingsController.php:42
* @route '/settings/voice'
*/
update.patch = (options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update.url(options),
    method: 'patch',
})

const VoiceSettingsController = { edit, update }

export default VoiceSettingsController