import { queryParams, type RouteQueryOptions, type RouteDefinition } from './../../../../../wayfinder'
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

const DataExportController = { exportMethod, export: exportMethod }

export default DataExportController