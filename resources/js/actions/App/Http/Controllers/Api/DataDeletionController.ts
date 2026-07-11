import { queryParams, type RouteQueryOptions, type RouteDefinition } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Api\DataDeletionController::destroy
* @see app/Http/Controllers/Api/DataDeletionController.php:15
* @route '/api/tenant/data'
*/
export const destroy = (options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/api/tenant/data',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Api\DataDeletionController::destroy
* @see app/Http/Controllers/Api/DataDeletionController.php:15
* @route '/api/tenant/data'
*/
destroy.url = (options?: RouteQueryOptions) => {
    return destroy.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\DataDeletionController::destroy
* @see app/Http/Controllers/Api/DataDeletionController.php:15
* @route '/api/tenant/data'
*/
destroy.delete = (options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(options),
    method: 'delete',
})

const DataDeletionController = { destroy }

export default DataDeletionController