import Web from './Web'
import Api from './Api'
import Twilio from './Twilio'
import ProfileController from './ProfileController'
import Auth from './Auth'

const Controllers = {
    Web: Object.assign(Web, Web),
    Api: Object.assign(Api, Api),
    Twilio: Object.assign(Twilio, Twilio),
    ProfileController: Object.assign(ProfileController, ProfileController),
    Auth: Object.assign(Auth, Auth),
}

export default Controllers