import {Subject} from 'rxjs'
import {getBrowserInput, initBrowserInput} from './inputs'
import {browserPlay, updateLoop} from './outputs'
import {sampleRate, bufferSize} from './consts'

const weight = 4;

export default class Loops {
  constructor(type, onStartRecord, onStopRecord,  onTap) {
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
    
    this.onStartRecord = onStartRecord;
    this.onStopRecord = onStopRecord

    this.isRecording$ = new Subject();
    this.isRecording$.subscribe(value => this.isRecording = value)
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

    this.isRecording$.next(true);
    this.stopCallback = await getBrowserInput(handleBuffer)
  }

  initRecording() {
    initBrowserInput(this.inputDeviceId)
    console.log('init recording')
  }

  tap() {
    this.tapTimestamps.push(Date.now())
    this.onTap();
    
    if (this.isRecording) {
      this.stop()
      this.onStopRecord && this.onStopRecord()
      this.isRecording$.next(false);
      return 0;
    }

    if (this.bpm) {
      this.startRecording()
      this.onStartRecord && this.onStartRecord(this.bpm)

      return 0;
    } else if (this.tapTimestamps.length === weight) {
      let sumIntervals = 0;

      for (let i = 0; i < 3; i++) {
        sumIntervals += (this.tapTimestamps[i + 1] - this.tapTimestamps[i])
      }
      
      let averageInterval = sumIntervals / 3
      const bpm = Math.floor(1 / (averageInterval / 60000))
      this.bpm = bpm;

      this.initRecording()

      const recordingIntervalId = setInterval(() => {
        this.onTap();

        this.isRecording$.subscribe(isRecording => !isRecording && clearInterval(recordingIntervalId))
      }, averageInterval)
      
    
      setTimeout(() => {
        this.startRecording()
        this.onStartRecord && this.onStartRecord(this.bpm)
      }, averageInterval * 5)
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
      browserPlay(finalLoop, this.bpm, this.onTap)
      this.isPlaying = true
    }
  }

  setInput(inputDeviceId) {
    this.inputDeviceId = inputDeviceId
  }
}