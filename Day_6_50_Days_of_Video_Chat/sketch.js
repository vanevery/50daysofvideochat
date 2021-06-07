/*  
  Day 6 of 50 Days of Video Chat
  Position
*/

let allVideos = {};
let myVideo;
var audioCtx;
let p5l;

function setup() {
  createCanvas(800, 800);
    
  audioCtx = new AudioContext();
  
  let constraints = {audio: true, "video": {
        "width": 320,
        "height": 240
    }};
  
  myVideo = createCapture(constraints, 
    function(stream) {
      p5l = new p5LiveMedia(this, "CAPTURE", stream, "Day 6 - 50 Days of Video Chat")
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
  }
}

// We got a new stream!
function gotStream(stream, id) {
  // This is just like a video/stream from createCapture(VIDEO)
  otherVideo = stream;
  //otherVideo.id and id are the same and unique identifiers
  //otherVideo.hide();
  
  stream.x = 0;
  stream.y = 0;
  allVideos[id] = stream;
}

function gotDisconnect(id) {
  delete allVideos[id]; 
}