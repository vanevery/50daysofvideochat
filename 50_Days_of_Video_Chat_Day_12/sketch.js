let myVideo = null;
let otherVideos = {};
let p5lm;

function setup() {
  createCanvas(400, 400);
  
  let constraints = {audio: false, video: {width: 320, height: 240}};
  myVideo = createCapture(constraints, function(stream) {
    p5lm = new p5LiveMedia(this, "CAPTURE", stream, "50 Days of Video Chat Day 12");
    p5lm.on('stream', gotStream);
    p5lm.on('data', gotData);
  });
  otherVideos['me'] = myVideo;
  myVideo.x = 0;
  myVideo.y = 0;
  
  myVideo.hide()
}

function draw() {
  background(220);
  //image(myVideo,0,0,width,height);
  for (const id in otherVideos) {
    if (otherVideos[id] && otherVideos[id].data) {
      image(otherVideos[id], otherVideos[id].data.x, otherVideos[id].data.y, 160, 120);
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
  otherVideos['me'].data = {};
  otherVideos['me'].data.x = mouseX;
  otherVideos['me'].data.y = mouseY;
  
  if (p5lm) {
    let dataToSend = {x: mouseX, y: mouseY};
    p5lm.send(JSON.stringify(dataToSend));
  }
  
}