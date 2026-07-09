import WebhookController from './WebhookController'
import SmsController from './SmsController'

const Twilio = {
    WebhookController: Object.assign(WebhookController, WebhookController),
    SmsController: Object.assign(SmsController, SmsController),
}

export default Twilio