import {BehaviorSubject} from 'rxjs'

const dist = 6
const Q = -0.2
const gain = 8;
const ePow =  Math.pow(Math.E, dist * Q)

class Amp {
    constructor(inputDeviceId) {
      this.inputDeviceId = inputDeviceId
      this.gain = gain
    }

    transfer(value) {
      let x = value * gain;
      if (x === Q || x === 0) {
        return x
      }  
      return ((x - Q) / (1 - Math.pow(Math.E, (-1) * dist * (x - Q))) + (Q / (1 - ePow)))
    }

    getTransferFunction() {
      return this.transfer
    }
 
}

export default Amp