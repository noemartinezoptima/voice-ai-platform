import { queryParams, type RouteQueryOptions, type RouteDefinition } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\Api\DataDeletionController::deleteMethod
* @see app/Http/Controllers/Api/DataDeletionController.php:15
* @route '/api/tenant/data'
*/
export const deleteMethod = (options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: deleteMethod.url(options),
    method: 'delete',
})

deleteMethod.definition = {
    methods: ["delete"],
    url: '/api/tenant/data',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Api\DataDeletionController::deleteMethod
* @see app/Http/Controllers/Api/DataDeletionController.php:15
* @route '/api/tenant/data'
*/
deleteMethod.url = (options?: RouteQueryOptions) => {
    return deleteMethod.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\DataDeletionController::deleteMethod
* @see app/Http/Controllers/Api/DataDeletionController.php:15
* @route '/api/tenant/data'
*/
deleteMethod.delete = (options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: deleteMethod.url(options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\Api\DataExportController::exportMethod
* @see app/Http/Controllers/Api/DataExportController.php:13
* @route '/api/tenant/data/export'
*/
export const exportMethod = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: exportMethod.url(options),
    method: 'get',
})

exportMethod.definition = {
    methods: ["get","head"],
    url: '/api/tenant/data/export',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\DataExportController::exportMethod
* @see app/Http/Controllers/Api/DataExportController.php:13
* @route '/api/tenant/data/export'
*/
exportMethod.url = (options?: RouteQueryOptions) => {
    return exportMethod.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\DataExportController::exportMethod
* @see app/Http/Controllers/Api/DataExportController.php:13
* @route '/api/tenant/data/export'
*/
exportMethod.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: exportMethod.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\DataExportController::exportMethod
* @see app/Http/Controllers/Api/DataExportController.php:13
* @route '/api/tenant/data/export'
*/
exportMethod.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: exportMethod.url(options),
    method: 'head',
})

const data = {
    delete: Object.assign(deleteMethod, deleteMethod),
    export: Object.assign(exportMethod, exportMethod),
}

export default data