let myVideo = null;
let otherVideos = {};
let p5lm;

function setup() {
  createCanvas(400, 400);
  
  let constraints = {audio: false, video: true};
  myVideo = createCapture(constraints, function(stream) {
    p5lm = new p5LiveMedia(this, "CAPTURE", stream, "ITP Camp 2021 p5LiveMedia Start");
    p5lm.on('stream', gotStream);
    p5lm.on('data', gotData);
  });
  
  myVideo.hide()
}

function draw() {
  background(220);
  image(myVideo,0,0,width,height);
  for (const id in otherVideos) {
    if (otherVideos[id] && otherVideos[id].data) {
      //blend(otherVideos[id],0,0,width,height, 0, 0, width, height,MULTIPLY);
      
      image(otherVideos[id], otherVideos[id].data.x, otherVideos[id].data.y, 50, 50);
    }
  }
}

function gotStream(stream, id) {
  stream.hide();
  otherVideos[id] = stream;
}

function gotData(data, id) {
  if (otherVideos[id]) {
    otherVideos[id].data = JSON.parse(data);
  }
}

function mouseMoved() {
  let dataToSend = {x: mouseX, y: mouseY};
  p5lm.send(JSON.stringify(dataToSend));
}