import {BehaviorSubject} from 'rxjs'
import {first} from 'rxjs/operators'
import {getBrowserInput, initBrowserInput} from './inputs'
import {browserLoopPlay, setNextLoop, onNewLoop$, onTap$, playFromGenerator} from './outputs'
import {sampleRate, bufferSize} from './consts'
const weight = 4;

export default class Loops {
  constructor(type, onStartRecord) {
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
    this.isRecording$ = new BehaviorSubject(false);
    this.loops$ = new BehaviorSubject([])
    this.monitor$ = new BehaviorSubject(false)

    this.isRecording$.subscribe(value => this.isRecording = value)
    this.middlewares = []
  }

  async startRecording() {
    this.currentLoopIndex = this.loops.length
    this.bufferCount = 0;
    this.loops[this.currentLoopIndex] = {
      isPlaying: true,
      data: new Float32Array(sampleRate * 30)
    }

    // const handleBuffer = (inputBuffer) => {
      
    // };

    this.isRecording$.next(true);
    // await this.initRecording()
    // this.stopCallback = getBrowserInput(handleBuffer)
    
  }

  async startMonitor() {
    const monitorBufferSize = bufferSize * 5 

    let monitorBuffer = new Float32Array(monitorBufferSize)
    let bufferCount = 0;
    
    function* monitorGenerator(middlewares) {
      let index = 0;

      while (true) {
        const value = monitorBuffer[(index) % (monitorBufferSize)]
        yield value
        index++;
      }
    }

    const handleBuffer = (inputBuffer) => {
      const inputArray = new Float32Array(bufferSize)
      inputBuffer.copyFromChannel(inputArray, 0)
      let res = inputArray.map((y, x) => this.middlewares.reduce((acc, func) => func(acc, (this.bufferCount * bufferSize) + x), y));

      if (this.isRecording) {
        this.loops[this.currentLoopIndex].data.set(res, this.bufferCount * bufferSize)
        this.bufferCount++;
      }

      monitorBuffer.set(res, (bufferSize * bufferCount) % monitorBufferSize)
      bufferCount++;
    }

    await initBrowserInput(this.inputDeviceId)
    getBrowserInput(handleBuffer)
    setTimeout(() => playFromGenerator(monitorGenerator(this.middlewares)), (bufferSize / sampleRate) * 1000)
  }

  stopMonitor() {
    this.stopCallback()
  }

  initRecording() {
    console.log('init recording')
    return initBrowserInput(this.inputDeviceId)
  }

  addMiddleware(middleware) {
    this.middlewares.push(middleware)
  }
  
  removeMiddleware(middleware) {
    const index = this.middlewares.indexOf(middleware)

    if (index !== -1) {
      this.middlewares.splice(index, 1)
    }
  }

  tap() {
    this.tapTimestamps.push(Date.now())
    
    if (this.isRecording) {
      this.stop()
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
      
      let recordingBeatCount = 1;

      const recordingIntervalId = setInterval(() => {
        if (recordingBeatCount === weight + 1) {
          this.startRecording()
          this.onStartRecord && this.onStartRecord(this.bpm)
        }

        onTap$.next(recordingBeatCount % 4);

        recordingBeatCount++;
      }, averageInterval)
      
      this.isRecording$.subscribe(isRecording => recordingBeatCount > 4 && !isRecording && clearInterval(recordingIntervalId))
    }

    onTap$.next(this.tapTimestamps.length)

    return this.tapTimestamps.length;
  }

  stop () {
 
    const samplesCount = (this.bufferCount ) * bufferSize;

    this.loops[this.currentLoopIndex].data = normalizeLoop(this.loops[this.currentLoopIndex].data, this.bpm, samplesCount)
    const loopSizeInSamples = this.loops[this.currentLoopIndex].data.length

    if (loopSizeInSamples > this.maxLoopInSamples) {
      this.maxLoopInSamples = loopSizeInSamples
    }

    this.loops$.next([...this.loops])
    this.updateLoop()
  }

  updateLoop() {
    const finalLoopSize = Math.max(...(this.loops.filter(loop => loop.isPlaying).map(loop => loop.data.length)))

    let finalLoop = new Float32Array(finalLoopSize)

    for (let i = 0; i < finalLoopSize; i++) {
      finalLoop[i] = 0;

      this.loops.filter(loop => loop.isPlaying).forEach(loop => {
          finalLoop[i] += loop.data[i % loop.data.length] * 0.8
      })
    }

    if (this.isPlaying) {
      setNextLoop(finalLoop) 
    } else {
      browserLoopPlay(finalLoop, this.bpm,  this.middlewares)
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

  toggleLoop(index) {
    this.loops[index].isPlaying = !this.loops[index].isPlaying;
    this.updateLoop()
  }
}

// Round loop to bars
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
  
   return loop.slice(bufferSize, loopSizeInSamples)
}