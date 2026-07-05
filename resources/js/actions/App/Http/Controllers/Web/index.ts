import DashboardController from './DashboardController'
import FlowController from './FlowController'
import CallController from './CallController'
import MonitorController from './MonitorController'
import ApiTokenController from './ApiTokenController'
import TenantSettingsController from './TenantSettingsController'
import VoiceSettingsController from './VoiceSettingsController'
import DocumentsController from './DocumentsController'
import TeamMemberController from './TeamMemberController'
import AcceptInviteController from './AcceptInviteController'

const Web = {
    DashboardController: Object.assign(DashboardController, DashboardController),
    FlowController: Object.assign(FlowController, FlowController),
    CallController: Object.assign(CallController, CallController),
    MonitorController: Object.assign(MonitorController, MonitorController),
    ApiTokenController: Object.assign(ApiTokenController, ApiTokenController),
    TenantSettingsController: Object.assign(TenantSettingsController, TenantSettingsController),
    VoiceSettingsController: Object.assign(VoiceSettingsController, VoiceSettingsController),
    DocumentsController: Object.assign(DocumentsController, DocumentsController),
    TeamMemberController: Object.assign(TeamMemberController, TeamMemberController),
    AcceptInviteController: Object.assign(AcceptInviteController, AcceptInviteController),
}

export default Web