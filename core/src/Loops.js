import {BehaviorSubject} from 'rxjs'
import {first} from 'rxjs/operators'
import {getBrowserInput, initBrowserInput} from './inputs'
import {browserLoopPlay, updateLoop, onNewLoop$, onTap$, playFromGenerator} from './outputs'
import {sampleRate, bufferSize} from './consts'
const weight = 4;

export default class Loops {
  constructor(type, onStartRecord, onStopRecord) {
    this.type = type
    this.loops = []
    this.tapTimestamps = []
    this.bpm = 0
    this.bufferCount = 0
    this.currentLoopIndex = 0
    this.isRecording = false
    this.isPlaying = false
    this.tap = this.tap.bind(this)
    this.maxLoopInSamples = 0
    this.onStartRecord = onStartRecord
    this.onStopRecord = onStopRecord
    this.isRecording$ = new BehaviorSubject(false);
    this.loops$ = new BehaviorSubject([])
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
    console.log('init recording')
    return initBrowserInput(this.inputDeviceId)
  }



  tap() {
    this.tapTimestamps.push(Date.now())
    
    if (this.isRecording) {
      this.stop()
      this.onStopRecord && this.onStopRecord()
      this.isRecording$.next(false);
      return 0;
    } else if (this.bpm) {
      onNewLoop$.pipe(first()).subscribe(() => {
        this.startRecording()
        this.onStartRecord && this.onStartRecord(this.bpm)
        console.log('New recording')
      })
      
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
      
      let recordingBeatCount = 1;
      const recordingIntervalId = setInterval(() => {
        onTap$.next(recordingBeatCount % 4);
        

        recordingBeatCount++;
      }, averageInterval)
      
      this.isRecording$.subscribe(isRecording => recordingBeatCount > 4 && !isRecording && clearInterval(recordingIntervalId))

      setTimeout(() => {
        this.startRecording()
        this.onStartRecord && this.onStartRecord(this.bpm)
      }, averageInterval * 5)
    }

    onTap$.next(this.tapTimestamps.length)

    return this.tapTimestamps.length;
  }

  stop () {
    this.stopCallback();
    const samplesCount = (this.bufferCount ) * bufferSize;

    this.loops[this.currentLoopIndex] = normalizeLoop(this.loops[this.currentLoopIndex], this.bpm, samplesCount)
    const loopSizeInSamples = this.loops[this.currentLoopIndex].length

    if (loopSizeInSamples > this.maxLoopInSamples) {
      this.maxLoopInSamples = loopSizeInSamples
    }

    this.loops$.next([...this.loops])
    this.play()
  }

  play() {
    let finalLoop = new Float32Array(this.maxLoopInSamples)

    for (let i = 0; i < this.maxLoopInSamples; i++) {
      finalLoop[i] = 0;

      this.loops.forEach(loop => {
          finalLoop[i] += loop[i % loop.length] * 0.8
      })
    }

    if (this.isPlaying) {
      updateLoop(finalLoop) 
    } else {
      browserLoopPlay(finalLoop, this.bpm)
      this.isPlaying = true
    }
  }

  setInput(inputDeviceId) {
    this.inputDeviceId = inputDeviceId
  }

  getTap() {
    return onTap$.asObservable()
  }

  getLoops() {
    return this.loops$.asObservable()
  }
}

function normalizeLoop(loop, bpm, samplesCount) {
  const lengthInMinutes = (samplesCount / sampleRate) / 60;
  const lengthInBeats = Math.round(lengthInMinutes * bpm);

  let lengthInBars;
  if (lengthInBeats % weight >= 1) {
    lengthInBars = Math.floor(lengthInBeats / weight) + 1;
  } else {
    lengthInBars = Math.floor(lengthInBeats / weight);
  }

  const loopSizeInSamples = Math.floor(((lengthInBars * weight) / bpm ) * 60 * sampleRate)
  
   return loop.slice(0, loopSizeInSamples)
}