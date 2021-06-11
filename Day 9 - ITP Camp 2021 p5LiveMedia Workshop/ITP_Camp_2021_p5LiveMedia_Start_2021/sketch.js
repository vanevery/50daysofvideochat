let myVideo = null;
let otherVideos = {};

function setup() {
  createCanvas(400, 400);
  
  let constraints = {audio: false, video: true};
  myVideo = createCapture(constraints, function(stream) {
    let p5lm = new p5LiveMedia(this, "CAPTURE", stream, "ITP Camp 2021 p5LiveMedia Start");
    p5lm.on('stream', gotStream);
  });
  
  myVideo.hide()
}

function draw() {
  background(220);
  image(myVideo,0,0,width,height);
  for (const id in otherVideos) {
    if (otherVideos[id]) {
      blend(otherVideos[id],0,0,width,height, 0, 0, width, height,MULTIPLY);
    }
  }
}

function gotStream(stream, id) {
  stream.hide();
  otherVideos[id] = stream;
}