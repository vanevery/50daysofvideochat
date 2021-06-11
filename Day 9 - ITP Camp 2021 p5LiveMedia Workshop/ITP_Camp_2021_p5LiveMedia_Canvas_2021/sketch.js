let otherCanvas;

function setup() {
  let myCanvas = createCanvas(400, 400);
  let p5lm = new p5LiveMedia(this, "CANVAS", myCanvas, "e4LTqKI8Q");
  p5lm.on('stream', gotStream);
}

function draw() {
  background(220);
  fill(255,0,0);
  ellipse(mouseX,mouseY,100,100); 
}

function gotStream(stream) {
  otherCanvas = stream;
}