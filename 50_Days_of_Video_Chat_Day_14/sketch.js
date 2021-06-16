/* Manipulation of stream before sending - shared canvas */

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
    
    // Extract the audio tracks from the stream
    let audioTracks = stream.getAudioTracks();
    
    // Use the first audio track, add it to the canvas stream
    if (audioTracks.length > 0) {
      canvasStream.addTrack(audioTracks[0]);
    }
    
    // Give the canvas stream to SimpleSimplePeer as a "CAPTURE" stream
    let p5lm = new p5LiveMedia(this, "CAPTURE", canvasStream, "50 Days of Video Chat - Day 13");
    p5lm.on('stream', gotStream);       
  });
  
  myVideo.elt.muted = true;
  myVideo.hide();  
}

function draw() {
  //background(0);
  myVideo.loadPixels();
  grphics.loadPixels();
  for (let i = 0; i < myVideo.width-20; i+=20) {
    for (let j = 0; j < myVideo.height-20; j+=20) {
      let r = myVideo.pixels[(i+j*myVideo.width)*4];
      let g = myVideo.pixels[(i+j*myVideo.width)*4 + 1];
      let b = myVideo.pixels[(i+j*myVideo.width)*4 + 2];
      //grphics.set(i, j, color(r, g, b));
      let drb = abs(r-b);
      let drg = abs(g-b);
      grphics.fill(r,g,b);
      grphics.stroke(0);
      grphics.rect(i,j,drb,drg);
    }
  }
  //grphics.updatePixels();
  image(grphics,0,0,320,240);
  
  for (const id in allVideos) {
        blend(allVideos[id],0,0,allVideos[id].width,allVideos[id].height, 0, 0, allVideos[id].width, allVideos[id].height, 64);
    
  }
}

function gotStream(stream, id) {
  allVideos[id] = stream;
  allVideos[id].hide()
}