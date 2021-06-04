/*  
  Day 2 of 50 Days of Video Chat
  Quantifying Talk Time - Making Speaker Big!
*/


let otherVideos = {};
let myVideo;
var audioCtx;

function setup() {
  createCanvas(1, 1);
  frameRate(10);  // This is how often we calculate the average volume
  
  audioCtx = new AudioContext();

  let constraints = {audio: true, "video": {
        "width": 320,
        "height": 240
    }};
  myVideo = createCapture(constraints, 
    function(stream) {
	  let p5l = new p5LiveMedia(this, "CAPTURE", stream, "Day 3 - 50 Days of Video Chat")
	  p5l.on('stream', gotStream);
      p5l.on('disconnect', gotDisconnect);
    
      var audioSource = audioCtx.createMediaStreamSource(stream); 
      var analyser = audioCtx.createAnalyser();
      var source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);
      // Is there a callback I can use instead
      myVideo.analyser = analyser;
      myVideo.loudestCount = 0;
      addDiv(myVideo);
      otherVideos['me'] = myVideo;

    }
  );  
  myVideo.elt.muted = true;   
}

function draw() {
  var loudest = -1;
  var loudness = -1;
  for (const v in otherVideos) {
    if (otherVideos.hasOwnProperty(v)) {
      // get the average, bincount is fftsize / 2
      //console.log(otherVideos[v]);
      var array =  new Uint8Array(otherVideos[v].analyser.frequencyBinCount);
      otherVideos[v].analyser.getByteFrequencyData(array);
      var average = getAverageVolume(array)
      //console.log('VOLUME:' + average); 
      if (average > loudness) {
        loudness = average;
        loudest = v;        
      }
    }
  }
  if (loudest != -1) {
      for (const vl in otherVideos) {
        if (loudest == vl) {
          otherVideos[vl].elt.style.border = "solid 10px red";
          otherVideos[vl].loudestCount++;
          otherVideos[vl].text.innerHTML = otherVideos[vl].loudestCount;
          otherVideos[vl].elt.width++;
          otherVideos[vl].elt.height++;
        } else {
          otherVideos[vl].elt.style.border = "";
          otherVideos[vl].elt.width--;
          otherVideos[vl].elt.height--;
        }
      }
  }
}

// Is this really the right way to calculate that?
function getAverageVolume(array) {
  var values = 0;
  var average;

  var length = array.length;

  // get all the frequency amplitudes
  for (var i = 0; i < length; i++) {
      values += array[i];
  }

  average = values / length;
  return average;
}

// We got a new stream!
function gotStream(stream, id) {
  // This is just like a video/stream from createCapture(VIDEO)
  otherVideo = stream;
  //otherVideo.id and id are the same and unique identifiers
  //otherVideo.hide();
  
  var analyser = audioCtx.createAnalyser();
  console.log(stream);
  var source = audioCtx.createMediaStreamSource(stream.elt.srcObject);
  source.connect(analyser);
  stream.analyser = analyser;
  stream.loudestCount = 0;
  addDiv(stream);
  otherVideos[id] = stream;
}

function gotDisconnect(id) {
  delete otherVideos[id]; 
}

function addDiv(v) {
  v.div = document.createElement("div");
  document.body.removeChild(v.elt);
  v.div.appendChild(v.elt);
  document.body.appendChild(v.div);
  v.text = document.createElement("div");
  v.text.innerHTML = "the div";
  v.div.appendChild(v.text);
}