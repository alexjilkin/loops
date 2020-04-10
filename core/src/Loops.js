import {getBrowserInput, initBrowserInput} from './inputs'
import {browserPlay, updateLoop} from './outputs'
import {sampleRate, bufferSize} from './consts'

const weight = 4;

export default class Loops {
  constructor(type, onTap) {
    this.type = type
    this.loops = []
    this.tapTimestamps = []
    this.bpm = 0;
    this.bufferCount = 0;
    this.currentLoopIndex = 0;
    this.isRecording = false;
    this.isPlaying = false;
    this.tap = this.tap.bind(this);
    this.maxLoopInSamples = 0;
    this.onTap = onTap
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

    this.isRecording = true;
    this.stopCallback = await getBrowserInput(handleBuffer)
  }

  initRecording() {
    initBrowserInput(this.inputDeviceId)
    console.log('init recording')
  }

  subscribeToClick(onTap) {
    this.onTap = onTap
  }

  tap(onStartRecord, onStopRecord) {
    this.tapTimestamps.push(Date.now())
    this.onTap();
    
    if (this.isRecording) {
      this.stop()
      onStopRecord && onStopRecord()
      this.isRecording = false;
      return 0;
    }

    if (this.bpm) {
      this.startRecording()
      onStartRecord && onStartRecord(this.bpm)

      return 0;
    } else if (this.tapTimestamps.length === weight) {
      let sumIntervals = 0;

      for (let i = 0; i < 3; i++) {
        sumIntervals += (this.tapTimestamps[i + 1] - this.tapTimestamps[i])
      }
      
      let averageInterval = sumIntervals / 3
      const bpm = Math.floor(1 / (averageInterval / 60000))
      console.log(bpm);
      this.bpm = bpm;

      this.initRecording()

      for (let i = 0; i < 4; i++) {

      }
      setTimeout(() => {
        this.startRecording()
        onStartRecord && onStartRecord(this.bpm)
      }, averageInterval)
    }

    return this.tapTimestamps.length;
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
    const loopSizeInSamples = Math.floor(((lengthInBars * weight) / this.bpm ) * 60 * sampleRate)
    
    this.loops[this.currentLoopIndex] = this.loops[this.currentLoopIndex].slice(0, loopSizeInSamples)
    if (loopSizeInSamples > this.maxLoopInSamples) {
      this.maxLoopInSamples = loopSizeInSamples
    }

    this.play()
  }

  play() {
    let finalLoop = new Float32Array(this.maxLoopInSamples)

    for (let i = 0; i < this.maxLoopInSamples; i++) {
      finalLoop[i] = 0;

      this.loops.forEach(loop => {
          finalLoop[i] += loop[i % loop.length]
      })
    }

    if (this.isPlaying) {
      updateLoop(finalLoop) 
    } else {
      browserPlay(finalLoop)
      this.isPlaying = true
    }
  }

  async getInputs() {
    const devices = await navigator.mediaDevices.enumerateDevices()
    return devices.filter((d) => d.kind === 'audioinput');
  }

  setInput(inputDeviceId) {
    this.inputDeviceId = inputDeviceId
  }
}