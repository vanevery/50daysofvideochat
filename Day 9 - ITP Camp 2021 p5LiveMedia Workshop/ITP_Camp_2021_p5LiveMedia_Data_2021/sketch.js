let otherPeople = {};
let p5lm;

function setup() {
  createCanvas(400, 400);
  
  p5lm = new p5LiveMedia(this, "DATA", null, "ITP Camp 2021 p5LiveMedia Data");
  p5lm.on('data', gotData);
}

function draw() {
  //background(220);
  for (const id in otherPeople) {
    if (otherPeople[id].shape == 1) {
      ellipse(otherPeople[id].x, otherPeople[id].y, 10, 10);
    } else {
      rect(otherPeople[id].x, otherPeople[id].y, 10, 10);
    }
  }
}

let shape = 1;
function gotData(data, id) {
  print(id + ":" + data);
  if (!otherPeople[id]) {
    otherPeople[id] = JSON.parse(data);
    otherPeople[id].shape = shape;
    shape = shape * -1;
  } else {
    otherPeople[id].x = JSON.parse(data).x;
    otherPeople[id].x = JSON.parse(data).y;
  }
}

function mousePressed() {
  //p5lm.send("Hi");
  let dataToSend = {x: mouseX, y: mouseY};
  p5lm.send(JSON.stringify(dataToSend));
  otherPeople['me'] = dataToSend;
}

function mouseMoved() {
  let dataToSend = {x: mouseX, y: mouseY};
  p5lm.send(JSON.stringify(dataToSend));
  otherPeople['me'] = dataToSend;
}



