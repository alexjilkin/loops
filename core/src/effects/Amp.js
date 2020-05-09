const dist = 6
const Q = -0.2
const gain = 3;
const ePow =  Math.pow(Math.E, dist * Q)

function transfer(value) {
  let x = value * gain;
  if (x === Q || x === 0) {
    return x
  }  
  return ((x - Q) / (1 - Math.pow(Math.E, (-1) * dist * (x - Q))) + (Q / (1 - ePow)))
}


class Amp {
    constructor(inputDeviceId) {
      this.inputDeviceId = inputDeviceId
    }

    getTransferFunction() {
      return transfer
    }
    stopMonitor() {
      this.stopCallback && this.stopCallback()
    }
}

export default Amp