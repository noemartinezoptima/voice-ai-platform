import Api from './Api'
import Twilio from './Twilio'
import Web from './Web'
import ProfileController from './ProfileController'
import Auth from './Auth'

const Controllers = {
    Api: Object.assign(Api, Api),
    Twilio: Object.assign(Twilio, Twilio),
    Web: Object.assign(Web, Web),
    ProfileController: Object.assign(ProfileController, ProfileController),
    Auth: Object.assign(Auth, Auth),
}

export default Controllers