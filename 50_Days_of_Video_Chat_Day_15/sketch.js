/* Manipulation of stream before sending - shared canvas - trying transparency */
/* 
How about sending 2 streams - 1 is a mask??? what's the implementation of that in p5? 
Darn, it is alpha channel only
This sketch does a kind of threshold
*/

let myCanvas;
let myVideo;
let maniImage;
let grphics;

let allVideos = {};

let otherVideo;

function setup() {
  createCanvas(320, 240);
  grphics = createGraphics(320, 240);

  // Use constraints to request audio from createCapture
  let constraints = {
    audio: true,
    video: {width: 320, height: 240}
  };
  
  // Need to use the callback to get at the audio/video stream
   myVideo = createCapture(constraints, function(stream) {
    
    // Get a stream from the canvas to send
    let canvasStream = grphics.elt.captureStream(15);
     
    // Combine with video stream
    let canvasTracks = stream.getVideoTracks();
    if (canvasTracks.length > 0) {
      stream.addTrack(canvasTracks[0]);
    }
    
    // Give the canvas stream to SimpleSimplePeer as a "CAPTURE" stream
    let p5lm = new p5LiveMedia(this, "CAPTURE", stream, "50 Days of Video Chat - Day 15");
    p5lm.on('stream', gotStream);       
  });
  
  myVideo.elt.muted = true;
  myVideo.hide();  
}

function draw() {
  background(0);
  myVideo.loadPixels();
  grphics.loadPixels();
  for (let i = 0; i < myVideo.width-20; i++) {
    for (let j = 0; j < myVideo.height-20; j++) {
      let r = myVideo.pixels[(i+j*myVideo.width)*4];
      let g = myVideo.pixels[(i+j*myVideo.width)*4 + 1];
      let b = myVideo.pixels[(i+j*myVideo.width)*4 + 2];
      
      // Doesn't work??
      //grphics.pixels[(i+j*myVideo.width)*4] = r;
      
      if (g > r && g > b && g > 100) { 
        grphics.set(i, j, color(0,255,0)); 
      } else {
        grphics.set(i, j, color(r, g, b));
      }      
    }
  }
  grphics.updatePixels();
  image(grphics,0,0,320,240);
  
  for (const id in allVideos) {
    image(allVideos[id],0,0,allVideos[id].width,allVideos[id].height);
  }
}

function gotStream(stream, id) {
  allVideos[id] = stream;
  allVideos[id].hide()
}