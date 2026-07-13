import { queryParams, type RouteQueryOptions, type RouteDefinition } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Web\PhoneNumberController::index
* @see app/Http/Controllers/Web/PhoneNumberController.php:18
* @route '/settings/phone-numbers'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/settings/phone-numbers',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Web\PhoneNumberController::index
* @see app/Http/Controllers/Web/PhoneNumberController.php:18
* @route '/settings/phone-numbers'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Web\PhoneNumberController::index
* @see app/Http/Controllers/Web/PhoneNumberController.php:18
* @route '/settings/phone-numbers'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Web\PhoneNumberController::index
* @see app/Http/Controllers/Web/PhoneNumberController.php:18
* @route '/settings/phone-numbers'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Web\PhoneNumberController::search
* @see app/Http/Controllers/Web/PhoneNumberController.php:58
* @route '/settings/phone-numbers/search'
*/
export const search = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: search.url(options),
    method: 'get',
})

search.definition = {
    methods: ["get","head"],
    url: '/settings/phone-numbers/search',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Web\PhoneNumberController::search
* @see app/Http/Controllers/Web/PhoneNumberController.php:58
* @route '/settings/phone-numbers/search'
*/
search.url = (options?: RouteQueryOptions) => {
    return search.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Web\PhoneNumberController::search
* @see app/Http/Controllers/Web/PhoneNumberController.php:58
* @route '/settings/phone-numbers/search'
*/
search.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: search.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Web\PhoneNumberController::search
* @see app/Http/Controllers/Web/PhoneNumberController.php:58
* @route '/settings/phone-numbers/search'
*/
search.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: search.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Web\PhoneNumberController::buy
* @see app/Http/Controllers/Web/PhoneNumberController.php:93
* @route '/settings/phone-numbers/buy'
*/
export const buy = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: buy.url(options),
    method: 'post',
})

buy.definition = {
    methods: ["post"],
    url: '/settings/phone-numbers/buy',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Web\PhoneNumberController::buy
* @see app/Http/Controllers/Web/PhoneNumberController.php:93
* @route '/settings/phone-numbers/buy'
*/
buy.url = (options?: RouteQueryOptions) => {
    return buy.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Web\PhoneNumberController::buy
* @see app/Http/Controllers/Web/PhoneNumberController.php:93
* @route '/settings/phone-numbers/buy'
*/
buy.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: buy.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Web\PhoneNumberController::release
* @see app/Http/Controllers/Web/PhoneNumberController.php:137
* @route '/settings/phone-numbers/release'
*/
export const release = (options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: release.url(options),
    method: 'delete',
})

release.definition = {
    methods: ["delete"],
    url: '/settings/phone-numbers/release',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Web\PhoneNumberController::release
* @see app/Http/Controllers/Web/PhoneNumberController.php:137
* @route '/settings/phone-numbers/release'
*/
release.url = (options?: RouteQueryOptions) => {
    return release.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Web\PhoneNumberController::release
* @see app/Http/Controllers/Web/PhoneNumberController.php:137
* @route '/settings/phone-numbers/release'
*/
release.delete = (options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: release.url(options),
    method: 'delete',
})

const PhoneNumberController = { index, search, buy, release }

export default PhoneNumberController