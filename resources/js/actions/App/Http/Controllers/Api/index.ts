import FlowController from './FlowController'
import CallController from './CallController'
import TenantController from './TenantController'
import DataDeletionController from './DataDeletionController'
import DataExportController from './DataExportController'

const Api = {
    FlowController: Object.assign(FlowController, FlowController),
    CallController: Object.assign(CallController, CallController),
    TenantController: Object.assign(TenantController, TenantController),
    DataDeletionController: Object.assign(DataDeletionController, DataDeletionController),
    DataExportController: Object.assign(DataExportController, DataExportController),
}

export default Api