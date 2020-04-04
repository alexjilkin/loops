import { getInputStreamByType } from './inputs'
import { play } from './play'
import { sampleRate, bufferSize } from './consts'

export default class Loops {
  constructor(type) {
    this.type = type
    this.loops = []
  }

  async addRecording() {
    const loopIndex = this.loops.length
    let bufferCount = 0;
    this.loops[loopIndex] = new Float32Array(sampleRate * 60)

    const handleBuffer = (inputBuffer) => {
      const inputArray = new Float32Array(bufferSize)

      inputBuffer.copyFromChannel(inputArray, 0)

      this.loops[loopIndex].set(inputArray, bufferCount * bufferSize)
      bufferCount++;
    };

    const stop = await getInputStreamByType('browser', handleBuffer, this.inputId)

    return async () => {
      console.log('stop')
      await stop();
      play(this.loops[loopIndex].slice(0, (bufferCount) * bufferSize))
    };
  }

  async getInputs() {
    const devices = await navigator.mediaDevices.enumerateDevices()
    return devices.filter((d) => d.kind === 'audioinput');
  }

  setInput(inputId) {
    this.inputId = inputId
  }
}