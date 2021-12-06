import {BehaviorSubject} from 'rxjs'

const dist = 6
const Q = -0.2
let prevValue = 0;

class Amp {
    constructor(inputDeviceId) {
      this.inputDeviceId = inputDeviceId
      this.R$ = new BehaviorSubject(2.2)
      this.R = 2.2

      this.transfer = this.transfer.bind(this)
      this.R$.subscribe(value => this.R = value)
    }

    transfer(y) {

      let value = (y * 100)

      if (value > 4.5) {
          value = 4.5
      } else if (y < -4.5){
          value = -4.5
      }
      
      value = prevValue + (this.circuit(prevValue, value))
      prevValue = value;
    
      return value / (50 / (this.R))
    }

    getTransferFunction() {
      return this.transfer
    }

    getR() {
      return this.R$.asObservable()
    }

    setR(R) {
      this.R$.next(R)
    }
    
    
    circuit(x, u) {
      return ((u - x) / (this.R * 10)) - ((0.504) * Math.sinh(x / 45.3)) 
    }
 
}

export default Amp