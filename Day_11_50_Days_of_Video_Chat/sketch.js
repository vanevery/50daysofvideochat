/*  
  Day 11 of 50 Days of Video Chat
  Sounds mixed in with microphone
  press mouse to play
  Inspired by Sam Lavigne's Zoom Escaper:
  https://lav.io/projects/zoom-escaper/
*/

let allVideos = {};
let myVideo;
var audioCtx;
var audiotoload;

let p5l;

function setup() {
  createCanvas(1, 1);
    
  audioCtx = new AudioContext();
  audiotoload = document.getElementById("audiotoplay");	
  var audioSource = audioCtx.createMediaElementSource(audiotoload);
  var gainNode = audioCtx.createGain();
  audioSource.connect(gainNode);

  let constraints = {audio: true, "video": {
        "width": 320,
        "height": 240
    }};
  
  myVideo = createCapture(constraints, 
    function(stream) {

      streamSource = audioCtx.createMediaStreamSource(stream);
      streamSource.connect(gainNode);
      streamDestination = audioCtx.createMediaStreamDestination();
      gainNode.connect(streamDestination);
    
    let videoTracks = stream.getVideoTracks();
    if (videoTracks[0]) {
      streamDestination.stream.addTrack(videoTracks[0]);
    }
    
      p5l = new p5LiveMedia(this, "CAPTURE", streamDestination.stream, "Day 11 - 50 Days of Video Chat")
	  p5l.on('stream', gotStream);
      p5l.on('disconnect', gotDisconnect);    
    
      allVideos['me'] = myVideo;
    }
  );  
  myVideo.elt.muted = true;   
}

function draw() {  
}

// We got a new stream!
function gotStream(stream, id) {
  console.log(stream);
  allVideos[id] = stream;
}

function gotDisconnect(id) {
  delete allVideos[id]; 
}

function mousePressed() {
  audiotoload.play();  
}