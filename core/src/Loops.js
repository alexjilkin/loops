import {getBrowserInput, initBrowserInput} from './inputs'
import {play} from './outputs'
import {sampleRate, bufferSize} from './consts'

const weight = 4;

export default class Loops {
  constructor(type) {
    this.type = type
    this.loops = []
    this.tapTimestamps = []
    this.bpm = 0;
    this.bufferCount = 0;
    this.currentLoopIndex = 0;

    this.tap = this.tap.bind(this)
  }

  async startRecording() {
    this.currentLoopIndex = this.loops.length
    this.bufferCount = 0;
    this.loops[this.currentLoopIndex] = new Float32Array(sampleRate * 60)

    const handleBuffer = (inputBuffer) => {
      const inputArray = new Float32Array(bufferSize)

      inputBuffer.copyFromChannel(inputArray, 0)

      this.loops[this.currentLoopIndex].set(inputArray, this.bufferCount * bufferSize)
      this.bufferCount++;
    };

    this.stopCallback = await getBrowserInput(handleBuffer)
  }

  initRecording() {
    initBrowserInput(this.inputDeviceId)
    console.log('init recording')
  }

  tap(onTap, onStartRecord) {
    if (this.bpm) {
      this.startRecording()
      onStartRecord && onStartRecord(this.bpm)
    }

    this.tapTimestamps.push(Date.now())
    onTap && onTap()

    if (this.tapTimestamps.length === 4) {
      let sumIntervals = 0;

      for (let i = 0; i < 3; i++) {
        sumIntervals += (this.tapTimestamps[i + 1] - this.tapTimestamps[i])
      }
      
      let averageInterval = sumIntervals / 3
      const bpm = Math.floor(1 / (averageInterval / 60000))
      console.log(bpm);
      this.bpm = bpm;

      this.initRecording()

      setTimeout(() => {
        this.startRecording()
        onStartRecord && onStartRecord(this.bpm)
      }, averageInterval)
    }
  }

  stop () {
    this.stopCallback();
    const samplesCount = (this.bufferCount ) * bufferSize;
    const lengthInMinutes = (samplesCount / sampleRate) / 60;
    const lengthInBeats = Math.round(lengthInMinutes * this.bpm);

    let lengthInBars;
    if (lengthInBeats % weight >= 1) {
      lengthInBars = Math.floor(lengthInBeats / weight) + 1;
    } else {
      lengthInBars = Math.floor(lengthInBeats / weight);
    }

    console.log(lengthInBars)
    const loopSizeInSamples = ((lengthInBars * weight) / this.bpm ) * 60 * sampleRate
    
    play(this.loops[this.currentLoopIndex].slice(0, loopSizeInSamples))
  }

  async getInputs() {
    const devices = await navigator.mediaDevices.enumerateDevices()
    return devices.filter((d) => d.kind === 'audioinput');
  }

  setInput(inputDeviceId) {
    this.inputDeviceId = inputDeviceId
  }
}