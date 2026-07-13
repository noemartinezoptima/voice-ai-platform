import HealthController from './HealthController'
import FlowController from './FlowController'
import CallController from './CallController'
import TenantController from './TenantController'
import V2 from './V2'
import DataDeletionController from './DataDeletionController'
import DataExportController from './DataExportController'

const Api = {
    HealthController: Object.assign(HealthController, HealthController),
    FlowController: Object.assign(FlowController, FlowController),
    CallController: Object.assign(CallController, CallController),
    TenantController: Object.assign(TenantController, TenantController),
    V2: Object.assign(V2, V2),
    DataDeletionController: Object.assign(DataDeletionController, DataDeletionController),
    DataExportController: Object.assign(DataExportController, DataExportController),
}

export default Api