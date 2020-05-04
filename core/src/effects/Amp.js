import {playFromGenerator} from '../outputs'
import {sampleRate, bufferSize} from '../consts'
import {getBrowserInput, initBrowserInput} from '../inputs'


const dist = 8
const Q = -0.1
const gain = 3;

function transfer(value) {
  let x = value * gain;
  if (x === Q || x === 0) {
    return x
  }  
  return ((x - Q) / (1 - Math.pow(Math.E, (-1) * dist * (x - Q))) + (Q / (1 - Math.pow(Math.E, dist * Q))))
}


class Amp {
    constructor(inputDeviceId) {
      this.inputDeviceId = inputDeviceId
    }

    initRecording() {
      console.log('init recording')
      return initBrowserInput(this.inputDeviceId)
    }

    async monitor() {
      const monitorBufferSize = bufferSize * 20 

      let monitorBuffer = new Float32Array(monitorBufferSize)
      let bufferCount = 0;
      
      function* monitorGenerator() {
        let index = 0;
  
        while (true) {
          const value = monitorBuffer[(index) % (monitorBufferSize)]
          yield value ? transfer(value) : 0
          index++;
        }
      }

      const handleBuffer = (inputBuffer) => {
        const inputArray = new Float32Array(bufferSize)
        inputBuffer.copyFromChannel(inputArray, 0)
  
        monitorBuffer.set(inputArray, bufferSize * (bufferCount % 20))
        bufferCount++;
      }
  
      this.stopCallback = await getBrowserInput(handleBuffer)
      setTimeout(() => this.initRecording().then(() => playFromGenerator(monitorGenerator())), (bufferSize / sampleRate) * 1000)
    }

    getTransferFunction() {
      return transfer
    }
    stopMonitor() {
      this.stopCallback && this.stopCallback()
    }
}

export default Amp