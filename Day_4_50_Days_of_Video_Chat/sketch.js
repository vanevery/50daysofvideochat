/*  
  Day 4 of 50 Days of Video Chat
  
*/


let otherVideos = {};
let myVideo;
var audioCtx;
var waveShaper;

function makeDistortionCurve(amount) {
  var k = typeof amount === 'number' ? amount : 50,
    n_samples = 44100,
    curve = new Float32Array(n_samples),
    deg = Math.PI / 180,
    i = 0,
    x;
  for ( ; i < n_samples; ++i ) {
    x = i * 2 / n_samples - 1;
    curve[i] = ( 3 + k ) * x * 20 * deg / ( Math.PI + k * Math.abs(x) );
  }
  return curve;
}

function setup() {
  createCanvas(1, 1);
  
  audioCtx = new AudioContext();
  waveShaper = audioCtx.createWaveShaper();
  waveShaper.curve = makeDistortionCurve(40);
  

  let constraints = {audio: true, "video": {
        "width": 320,
        "height": 240
    }};
  
  myVideo = createCapture(constraints, 
    function(stream) {
	  
      var audioSource = audioCtx.createMediaStreamSource(stream); 
      var analyser = audioCtx.createAnalyser();
      var source = audioCtx.createMediaStreamSource(stream);
      source.connect(waveShaper);

      // Create new Stream
      // newStream.stream is a MediaStream
      // Add audio track
      var newStream = audioCtx.createMediaStreamDestination();  
      waveShaper.connect(newStream);

      // Add video track
    
      // Extract the video tracks from the stream
      let videoTracks = stream.getVideoTracks();
    
      // Use the first video track, add it to the canvas stream
      if (videoTracks.length > 0) {
        newStream.stream.addTrack(videoTracks[0]);
      }    
    
      let p5l = new p5LiveMedia(this, "CAPTURE", newStream.stream, "Day 4 - 50 Days of Video Chat")
	  p5l.on('stream', gotStream);
      p5l.on('disconnect', gotDisconnect);    
    
      otherVideos['me'] = myVideo;

    }
  );  
  myVideo.elt.muted = true;   
}

function draw() {
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