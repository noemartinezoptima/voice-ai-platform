import { queryParams, type RouteQueryOptions, type RouteDefinition } from './../../../wayfinder'
/**
* @see \App\Http\Controllers\Web\VoiceSettingsController::update
* @see app/Http/Controllers/Web/VoiceSettingsController.php:40
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
* @see app/Http/Controllers/Web/VoiceSettingsController.php:40
* @route '/settings/voice'
*/
update.url = (options?: RouteQueryOptions) => {
    return update.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Web\VoiceSettingsController::update
* @see app/Http/Controllers/Web/VoiceSettingsController.php:40
* @route '/settings/voice'
*/
update.patch = (options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update.url(options),
    method: 'patch',
})

const voice = {
    update: Object.assign(update, update),
}

export default voice