import FlowController from './FlowController'
import CallController from './CallController'
import TenantController from './TenantController'

const Api = {
    FlowController: Object.assign(FlowController, FlowController),
    CallController: Object.assign(CallController, CallController),
    TenantController: Object.assign(TenantController, TenantController),
}

export default Api