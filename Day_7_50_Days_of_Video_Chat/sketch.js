/*  
  Day 7 of 50 Days of Video Chat
  Positional Audio:
  https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Web_audio_spatialization_basics
*/

let allVideos = {};
let myVideo;
var audioCtx;
var listener;
let p5l;

function setup() {
  createCanvas(800, 800);
    
  audioCtx = new AudioContext();
  listener = audioCtx.listener;
  // What should this be?
  //listener.setOrientation(0,0,-1,0,1,0);
  listener.setPosition(0,0,0);

  let constraints = {audio: true, "video": {
        "width": 320,
        "height": 240
    }};
  
  myVideo = createCapture(constraints, 
    function(stream) {
      p5l = new p5LiveMedia(this, "CAPTURE", stream, "Day 7 - 50 Days of Video Chat")
	  p5l.on('stream', gotStream);
      p5l.on('disconnect', gotDisconnect);    
      p5l.on('data', gotData);
    
      myVideo.x = 0;
      myVideo.y = 0;
      allVideos['me'] = myVideo;
    }
  );  
  myVideo.elt.muted = true;   
}

function draw() {
  background(255);
  
  for (var id in allVideos) {

    image(allVideos[id], allVideos[id].x, allVideos[id].y, 160, 120);
    
  }
  
}

function mouseMoved() {
  myVideo.x = mouseX;
  myVideo.y = mouseY;
  
  listener.setPosition(mouseX,mouseY,0);
  
  // Package as JSON to send
  let dataToSend = {x: mouseX, y: mouseY};
  
  // Send it
  p5l.send(JSON.stringify(dataToSend));
}

function gotData(data, id) {
  console.log(data);

  let parsedData = JSON.parse(data);
  if (allVideos[parsedData.id]) {
    allVideos[parsedData.id].x = parsedData.x;
    allVideos[parsedData.id].y = parsedData.y;
    allVideos[parsedData.id].panner.setPosition(parsedData.x,parsedData.y,0);
  }
}

// We got a new stream!
function gotStream(stream, id) {
  //console.log(stream);
  
  var audioSource = audioCtx.createMediaStreamSource(stream.elt.srcObject);
  
  var panner = audioCtx.createPanner();
  panner.panningModel = 'HRTF';
  panner.distanceModel = 'linear';
  panner.refDistance = 1;
  panner.maxDistance = 100;
  panner.rolloffFactor = 1;
  panner.coneInnerAngle = 360;
  panner.coneOuterAngle = 0;
  panner.coneOuterGain = 0;
  // What should this be?
  //panner.setOrientation(1,0,0);
  panner.setPosition(0,0,0);
  audioSource.connect(panner);
  panner.connect(audioCtx.destination);
  stream.panner = panner;
  
  stream.elt.muted = true;
  
  stream.x = 0;
  stream.y = 0;
  allVideos[id] = stream;
}

function gotDisconnect(id) {
  delete allVideos[id]; 
}