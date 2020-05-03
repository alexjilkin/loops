import {playFromGenerator} from '../outputs'
import {sampleRate, bufferSize} from '../consts'
import {getBrowserInput, initBrowserInput} from '../inputs'

function transfer(value) {
  let x = value * gain;
  if (x === Q || x === 0) {
    return x
  }  
  return ((x - Q) / (1 - Math.pow(Math.E, (-1) * dist * (x - Q))) + (Q / (1 - Math.pow(Math.E, dist * Q))))
}

const dist = 8
const Q = -0.1
const gain = 3;

class Amp {
    constructor(inputDeviceId) {
      this.inputDeviceId = inputDeviceId
    }

    initRecording() {
      console.log('init recording')
      return initBrowserInput(this.inputDeviceId)
    }

    async monitor() {
      initBrowserInput(this.inputDeviceId)
      let monitorBuffer = new Float32Array(bufferSize * 10)
      let bufferCount = 0;
      
      function* monitorGenerator() {
        let index = 0;
  
        while (true) {
          const value = monitorBuffer[index % (bufferSize * 10)]
          yield value ? transfer(value) : 0
          index++;
        }
      }

      const handleBuffer = (inputBuffer) => {
        const inputArray = new Float32Array(bufferSize)
        inputBuffer.copyFromChannel(inputArray, 0)
  
        monitorBuffer.set(inputArray, bufferSize * (bufferCount % 10))
        bufferCount++;
      }
  
      this.stopCallback = await getBrowserInput(handleBuffer)
      setTimeout(() => playFromGenerator(monitorGenerator()), (bufferSize / sampleRate) * 150)
    }
}

export default Amp