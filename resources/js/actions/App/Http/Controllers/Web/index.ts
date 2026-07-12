import DashboardController from './DashboardController'
import FlowController from './FlowController'
import CallController from './CallController'
import RecordingController from './RecordingController'
import MonitorController from './MonitorController'
import SmsController from './SmsController'
import BillingController from './BillingController'
import ApiTokenController from './ApiTokenController'
import TenantSettingsController from './TenantSettingsController'
import TwilioOAuthController from './TwilioOAuthController'
import VoiceSettingsController from './VoiceSettingsController'
import VoiceController from './VoiceController'
import DocumentsController from './DocumentsController'
import WebhookDestinationController from './WebhookDestinationController'
import ActivityLogController from './ActivityLogController'
import ElevenLabsConnectController from './ElevenLabsConnectController'
import ElevenLabsAgentController from './ElevenLabsAgentController'
import TeamMemberController from './TeamMemberController'
import DataProtectionController from './DataProtectionController'
import PrivacyController from './PrivacyController'
import SystemHealthController from './SystemHealthController'
import GettingStartedController from './GettingStartedController'
import AcceptInviteController from './AcceptInviteController'

const Web = {
    DashboardController: Object.assign(DashboardController, DashboardController),
    FlowController: Object.assign(FlowController, FlowController),
    CallController: Object.assign(CallController, CallController),
    RecordingController: Object.assign(RecordingController, RecordingController),
    MonitorController: Object.assign(MonitorController, MonitorController),
    SmsController: Object.assign(SmsController, SmsController),
    BillingController: Object.assign(BillingController, BillingController),
    ApiTokenController: Object.assign(ApiTokenController, ApiTokenController),
    TenantSettingsController: Object.assign(TenantSettingsController, TenantSettingsController),
    TwilioOAuthController: Object.assign(TwilioOAuthController, TwilioOAuthController),
    VoiceSettingsController: Object.assign(VoiceSettingsController, VoiceSettingsController),
    VoiceController: Object.assign(VoiceController, VoiceController),
    DocumentsController: Object.assign(DocumentsController, DocumentsController),
    WebhookDestinationController: Object.assign(WebhookDestinationController, WebhookDestinationController),
    ActivityLogController: Object.assign(ActivityLogController, ActivityLogController),
    ElevenLabsConnectController: Object.assign(ElevenLabsConnectController, ElevenLabsConnectController),
    ElevenLabsAgentController: Object.assign(ElevenLabsAgentController, ElevenLabsAgentController),
    TeamMemberController: Object.assign(TeamMemberController, TeamMemberController),
    DataProtectionController: Object.assign(DataProtectionController, DataProtectionController),
    PrivacyController: Object.assign(PrivacyController, PrivacyController),
    SystemHealthController: Object.assign(SystemHealthController, SystemHealthController),
    GettingStartedController: Object.assign(GettingStartedController, GettingStartedController),
    AcceptInviteController: Object.assign(AcceptInviteController, AcceptInviteController),
}

export default Web