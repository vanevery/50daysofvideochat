/*  
  Day 5 of 50 Days of Video Chat
  Going to attempt a vocoder:
  https://stackoverflow.com/questions/63969864/creating-a-phase-vocoder-with-the-webaudio-api-using-analyzer-and-periodic-wave
*/

let otherVideos = {};
let myVideo;
var audioCtx;
var osc;
var analyser;
var dataArray;
var start = false;
var gainNode;

function generatePeriodicWave(freqData) {
  const real = [];
  const imag = [];

  freqData.forEach((x, i) => {
    const amp = fromDecibels(x);
    const phase = getRandomPhase();
    real.push(amp * Math.cos(phase));
    imag.push(amp * Math.sin(phase));
  });

  return audioCtx.createPeriodicWave(real, imag);
}

function fromDecibels(x) {
  return 10 ** (x / 20);
}

function getRandomPhase() {
  return Math.random() * 2 * Math.PI - Math.PI;
}

function setup() {
  createCanvas(300, 300);
    
  audioCtx = new AudioContext();
  analyser = audioCtx.createAnalyser();
  analyser.fftSize = 1024;

  var gainNode = audioCtx.createGain();

  dataArray = new Uint8Array(analyser.frequencyBinCount);
  osc = audioCtx.createOscillator();
  osc.start();
  
  let constraints = {audio: true, "video": {
        "width": 320,
        "height": 240
    }};
  
  myVideo = createCapture(constraints, 
    function(stream) {
	  
      var source = audioCtx.createMediaStreamSource(stream);
      
      // filter it
      var bandpassFilter = audioCtx.createBiquadFilter();
      bandpassFilter.type = 'bandpass';
      bandpassFilter.frequency.value = 1500;
      source.connect(bandpassFilter);

      bandpassFilter.connect(analyser);
      bandpassFilter.connect(gainNode);
      //source.connect(analyser);
    
      //analyser.getByteTimeDomainData(dataArray);
      //analyser.getByteFrequencyData(dataArray);
    
      // Create new Stream
      // newStream.stream is a MediaStream
      // Add audio track
      var newStream = audioCtx.createMediaStreamDestination();  
      // UNCOMMENT THIS
      //osc.connect(newStream);
      // COMMENT THIS
      osc.connect(gainNode);
        
      gainNode.connect(newStream);

      // Add video track
    
      // Extract the video tracks from the stream
      let videoTracks = stream.getVideoTracks();
    
      // Use the first video track, add it to the newStream
      if (videoTracks.length > 0) {
        newStream.stream.addTrack(videoTracks[0]);
      }    
    
      let p5l = new p5LiveMedia(this, "CAPTURE", newStream.stream, "Day 5 - 50 Days of Video Chat")
	  p5l.on('stream', gotStream);
      p5l.on('disconnect', gotDisconnect);    
    
      otherVideos['me'] = myVideo;

      start = true;
    }
  );  
  myVideo.elt.muted = true;   
}

function draw() {
  background(255);
  if (start) {
    //analyser.getByteTimeDomainData(dataArray);
    analyser.getByteFrequencyData(dataArray);

    /*
    Each item in the array represents the decibel value for a specific frequency. The frequencies are spread linearly from 0 to 1/2 of the sample rate. For example, for 48000 sample rate, the last item of the array will represent the decibel value for 24000 Hz.
    */
    var loudest = -1
    dataArray.forEach((x, i) => {
      //if (i > 20) {
          if (loudest <  0 || x > dataArray[loudest])
          {
            loudest = i;
          }
        rect(width/analyser.fftSize*i,height-x,width/analyser.fftSize,height);
      //}
    });    
    var freq = 16000/analyser.fftSize*(loudest+1);
    console.log(freq);
    osc.frequency.value = freq;
    
    /*
    var wave = generatePeriodicWave(dataArray);
    osc.setPeriodicWave(wave);
    */
    //osc.start();
    //osc.stop(1/60);
  }
}

// We got a new stream!
function gotStream(stream, id) {
  // This is just like a video/stream from createCapture(VIDEO)
  otherVideo = stream;
  //otherVideo.id and id are the same and unique identifiers
  //otherVideo.hide();
  
  otherVideos[id] = stream;
}

function gotDisconnect(id) {
  delete otherVideos[id]; 
}