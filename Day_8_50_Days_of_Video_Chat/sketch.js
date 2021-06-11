/*  
  Day 8 of 50 Days of Video Chat
  3D - Positional Audio
  https://github.com/vanevery/3D-Shared-Space
  +
  https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Web_audio_spatialization_basics
*/

let all = {};
let p5l;
let groundTexture;

var audioCtx;
var listener;

function preload() {
  groundTexture = loadImage("./aerial_grass_rock_diff_1k.jpg");
}

function setup() {
  createCanvas(800, 600, WEBGL);

  // Create and set up our camera
  cam = createCamera();

  // Tell p5 to use this camera
  setCamera(cam);

  // Setting "perspective matrix"
  // 4x4 matrix of numbers - position, rotation, - shift from 3d to 2d
  // field of view, aspect ratio, camera near (plane), camera (far)
  cam.perspective(PI / 3.0, width / height, 0.1, 50000);

  // position in 3d space
  cam.setPosition(0, -1, 0);
  strokeWeight(0.2);

  let constraints = {
    audio: true,
    video: true,
  };

  myVideo = createCapture(constraints, function (stream) {
    p5l = new p5LiveMedia(this, "CAPTURE", stream, "50 Days of Video Chat Day 8");
    p5l.on("stream", gotStream);
    p5l.on("disconnect", gotDisconnect);
    p5l.on("data", gotData);
  });

  myVideo.elt.muted = true;
  myVideo.hide();

  audioCtx = new AudioContext();
  listener = audioCtx.listener;
  // What should this be?
  //listener.setOrientation(0,0,-1,0,1,0);
  listener.setPosition(0,0,0);

  
  // add a debug grid so we can tell where we are
  // debugMode(GRID, 25, 25, 0, 0, 0);
}



function draw() {
  background(220, 230, 250);

  lights();

  addGround();

  cameraControls();

  for (const id in all) {
    all[id].draw();
  }

  if (frameCount % 10 === 0){
    sendStats();
  }
}


/*
* This function adds a ground plane to the scene with a repeating texture on it!
*/
function addGround() {
  // have to push and pop
  push();
  // box has height of 1 so 1/2 of that
  rotateX(Math.PI / 2);
  scale(50, 50, 50);
  // we are using the vertex() function here instead of plane(),
  // such that we can manually adjust the UV coordinates for a
  // repeating texture. For more info, see this example:
  // https://github.com/processing/p5.js/issues/2189
  textureWrap(REPEAT);
  texture(groundTexture);
  let u = 2048,
    v = 2048;
  beginShape(TRIANGLES);
  vertex(-1, -1, 0, 0, 0);
  vertex(1, -1, 0, u, 0);
  vertex(1, 1, 0, u, v);

  vertex(1, 1, 0, u, v);
  vertex(-1, 1, 0, 0, v);
  vertex(-1, -1, 0, 0, 0);
  endShape();
  pop();
}


/*
* This function controls the movement of the camera in the space according to keypresses
*/
function cameraControls() {
  // out controls
  let leftRightMove = 0,
    upDownMove = 0,
    forwardBackwardMove = 0;
  if (keyIsDown(87)) {
    forwardBackwardMove = -0.1;
  }
  if (keyIsDown(83)) {
    forwardBackwardMove = 0.1;
  }
  if (keyIsDown(65)) {
    leftRightMove = -0.1;
  }
  if (keyIsDown(68)) {
    leftRightMove = 0.1;
  }

  // move the camera along its local axes
  cam.move(leftRightMove, 0, forwardBackwardMove);
  cam.eyeY = -1.5;
  // cam.pan(leftRightMove);

}

/*
* This function sends our current position and rotation to the other players in the space
*/
function sendStats(){
  let cameraPosition = {
    x: cam.eyeX, // There is no x, y, z
    y: cam.eyeY,
    z: cam.eyeZ,
  };
  let cameraLookAtPoint = {
    x: cam.centerX, 
    y: cam.centerY, 
    z: cam.centerZ
  }
  let stats = {
    position: cameraPosition,
    lookAt: cameraLookAtPoint
  }
  if (p5l) {
    p5l.send(JSON.stringify(stats));
  }
  
  listener.setOrientation(cam.centerX,cam.centerY,cam.centerZ,0,1,0);
  listener.setPosition(cam.eyeX,cam.eyeY,cam.eyeZ);

}

// We got a new stream!
function gotStream(stream, id) {
  stream.hide();
  
  stream.elt.muted = true;
  
  all[id] = new Avatar(stream, 0, 0, 0);
}


/*
* This function controls the rotation of the camera in the space when dragging the mouse
*/
function mouseDragged() {
  let scaleFactor = 0.01;
  let deltaX = pmouseX - mouseX;
  let deltaY = pmouseY - mouseY;

  cam.pan(deltaX * scaleFactor);
  cam.tilt(-deltaY * scaleFactor);
}

/*
* This function deals with incoming position and rotation from other players
*/
function gotData(data, id) {
  let stats = JSON.parse(data);
  let position = stats.position;
  let lookAt = stats.lookAt;
  all[id].updatePos(position.x, position.y, position.z);
  all[id].lookAt(lookAt.x,lookAt.y,lookAt.z);
}

function gotDisconnect(id) {
  delete all[id];
}


/*
* This class sets up an 'avatar' representation of another player in space
*/
class Avatar {
  constructor(vid, x, y, z) {
    this.updatePos(x, y, z);
    this.vid = vid;
    this.heading = 0;
    
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
    panner.setPosition(x,y,z);
    audioSource.connect(panner);
    panner.connect(audioCtx.destination);
    this.panner = panner;
   
  }

  updatePos(x, y, z) {
    this.x = x;
    this.y = y;
    this.z = z;
    
    this.panner.setPosition(x,y,z);    
  }

  // see example here: https://p5js.org/reference/#/p5.Vector/sub
  lookAt(x,y,z){
    let lookAt = createVector(x,z);
    let position = createVector(this.x,this.z);
    let differenceVec = p5.Vector.sub(lookAt, position);
    this.heading = -1 * differenceVec.heading();
    
    panner.setOrientation(x,y,z);
  }

  draw() {
    push();
    translate(this.x, this.y, this.z);
    // needs a rotate - something we have to send through
    // adding Math.PI/2 (90 degrees) is a hack to ensure that we see 
    // the face rotated right-side up
    // (seems the UVs of the box are not always right-side up)
    rotateY(this.heading + Math.PI/2);
    texture(this.vid);
    box(1, 1, 1);
    pop();
  }
}


