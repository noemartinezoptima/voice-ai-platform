import CallSearchController from './CallSearchController'
import CallQualityController from './CallQualityController'
import TranscriptSearchController from './TranscriptSearchController'
import AnalyticsController from './AnalyticsController'
import MonitoringController from './MonitoringController'

const V2 = {
    CallSearchController: Object.assign(CallSearchController, CallSearchController),
    CallQualityController: Object.assign(CallQualityController, CallQualityController),
    TranscriptSearchController: Object.assign(TranscriptSearchController, TranscriptSearchController),
    AnalyticsController: Object.assign(AnalyticsController, AnalyticsController),
    MonitoringController: Object.assign(MonitoringController, MonitoringController),
}

export default V2