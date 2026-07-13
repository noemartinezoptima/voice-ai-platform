import Cashier from './Cashier'
import Dusk from './Dusk'
import Horizon from './Horizon'
import Sanctum from './Sanctum'

const Laravel = {
    Cashier: Object.assign(Cashier, Cashier),
    Dusk: Object.assign(Dusk, Dusk),
    Horizon: Object.assign(Horizon, Horizon),
    Sanctum: Object.assign(Sanctum, Sanctum),
}

export default Laravel