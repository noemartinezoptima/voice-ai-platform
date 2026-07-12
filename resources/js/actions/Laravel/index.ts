import Dusk from './Dusk'
import Horizon from './Horizon'
import Sanctum from './Sanctum'

const Laravel = {
    Dusk: Object.assign(Dusk, Dusk),
    Horizon: Object.assign(Horizon, Horizon),
    Sanctum: Object.assign(Sanctum, Sanctum),
}

export default Laravel