/* Manipulation of stream before sending - Background Removal */

let myVideo;
let myCanvas;

let allVideos = {};

let bodypix;
let segmentation;


const bodypixOptions = {
  outputStride: 8, // 8, 16, or 32, default is 16
  segmentationThreshold: 0.3, // 0 - 1, defaults to 0.5
};

function preload() {
  bodypix = ml5.bodyPix(bodypixOptions);
}

function setup() {
  myCanvas = createCanvas(320, 240);

  // Use constraints to request audio from createCapture
  let constraints = {
    audio: false,
    video: {width: 320, height: 240}
  };
  
  // Need to use the callback to get at the audio/video stream
   myVideo = createCapture(constraints, function(stream) {
    
    // Give the canvas stream to SimpleSimplePeer as a "CAPTURE" stream
    let p5lm = new p5LiveMedia(this, "CANVAS", myCanvas, "50 Days of Video Chat - Day 16");
    p5lm.on('stream', gotStream);  
     
    bodypix.segment(myVideo, gotBodypixResults);
  });
  
  myVideo.elt.muted = true;
  myVideo.hide();  
}

function draw() {
  background(0);
  
  if (segmentation) {
    image(segmentation.backgroundMask, 0, 0, width, height);
    
    bodypix.segment(myVideo, gotBodypixResults);

  }
}

function gotStream(stream, id) {
  allVideos[id] = stream;
}

function gotBodypixResults(error, result) {
  if (error) {
    console.log(error);
    return;
  }
  segmentation = result;
  bodypix.segment(mVideo, gotResults);
}