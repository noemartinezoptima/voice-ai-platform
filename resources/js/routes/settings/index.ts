import { queryParams, type RouteQueryOptions, type RouteDefinition } from './../../wayfinder'
import tenant69401c from './tenant'
import voice1db564 from './voice'
import documents from './documents'
import webhooks from './webhooks'
import activity from './activity'
import agents from './agents'
import dataProtection0a045c from './data-protection'
/**
* @see \App\Http\Controllers\Web\TenantSettingsController::tenant
* @see app/Http/Controllers/Web/TenantSettingsController.php:22
* @route '/settings/tenant'
*/
export const tenant = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: tenant.url(options),
    method: 'get',
})

tenant.definition = {
    methods: ["get","head"],
    url: '/settings/tenant',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Web\TenantSettingsController::tenant
* @see app/Http/Controllers/Web/TenantSettingsController.php:22
* @route '/settings/tenant'
*/
tenant.url = (options?: RouteQueryOptions) => {
    return tenant.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Web\TenantSettingsController::tenant
* @see app/Http/Controllers/Web/TenantSettingsController.php:22
* @route '/settings/tenant'
*/
tenant.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: tenant.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Web\TenantSettingsController::tenant
* @see app/Http/Controllers/Web/TenantSettingsController.php:22
* @route '/settings/tenant'
*/
tenant.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: tenant.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Web\VoiceSettingsController::voice
* @see app/Http/Controllers/Web/VoiceSettingsController.php:20
* @route '/settings/voice'
*/
export const voice = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: voice.url(options),
    method: 'get',
})

voice.definition = {
    methods: ["get","head"],
    url: '/settings/voice',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Web\VoiceSettingsController::voice
* @see app/Http/Controllers/Web/VoiceSettingsController.php:20
* @route '/settings/voice'
*/
voice.url = (options?: RouteQueryOptions) => {
    return voice.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Web\VoiceSettingsController::voice
* @see app/Http/Controllers/Web/VoiceSettingsController.php:20
* @route '/settings/voice'
*/
voice.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: voice.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Web\VoiceSettingsController::voice
* @see app/Http/Controllers/Web/VoiceSettingsController.php:20
* @route '/settings/voice'
*/
voice.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: voice.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Web\DataProtectionController::dataProtection
* @see app/Http/Controllers/Web/DataProtectionController.php:19
* @route '/settings/data-protection'
*/
export const dataProtection = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: dataProtection.url(options),
    method: 'get',
})

dataProtection.definition = {
    methods: ["get","head"],
    url: '/settings/data-protection',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Web\DataProtectionController::dataProtection
* @see app/Http/Controllers/Web/DataProtectionController.php:19
* @route '/settings/data-protection'
*/
dataProtection.url = (options?: RouteQueryOptions) => {
    return dataProtection.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Web\DataProtectionController::dataProtection
* @see app/Http/Controllers/Web/DataProtectionController.php:19
* @route '/settings/data-protection'
*/
dataProtection.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: dataProtection.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Web\DataProtectionController::dataProtection
* @see app/Http/Controllers/Web/DataProtectionController.php:19
* @route '/settings/data-protection'
*/
dataProtection.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: dataProtection.url(options),
    method: 'head',
})

const settings = {
    tenant: Object.assign(tenant, tenant69401c),
    voice: Object.assign(voice, voice1db564),
    documents: Object.assign(documents, documents),
    webhooks: Object.assign(webhooks, webhooks),
    activity: Object.assign(activity, activity),
    agents: Object.assign(agents, agents),
    dataProtection: Object.assign(dataProtection, dataProtection0a045c),
}

export default settings