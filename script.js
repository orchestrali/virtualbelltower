const places = "1234567890ETABCD";
//number of bells
var numbells = 6;
var soundurl = "sounds/";
//objects with sounds and other info
var bells = [
  {bell: "F4",type: "tower"},{bell: "G4",type: "tower"},{bell: "A4",type: "tower"},{bell: "Bf4",type: "tower"},{bell: "C5",type: "tower"},{bell: "D5",type: "tower"},{bell: "E5",type: "tower"},{bell: "F5",type: "tower"},{bell: "G5",type: "tower"},{bell: "A5",type: "tower"},{bell: "Bf5",type: "tower"},{bell: "C6",type: "tower"}
];
//length of bell rope animation
var duration = 1.3;
//holders
var audioCtx = new (window.AudioContext || window.webkitAudioContext)();
var gainNode;
var svg;
var rowArr = [];

//time for one row
var speed = 2.3;
var delay = speed/numbells;

var rownum = 0;
var place = 0;
var stroke = 1;
var playing = false;
var nextBellTime = 0;

const lookahead = 25.0;
const scheduleAheadTime = 0.1;
var scheduledtimes = [];
var timeout;


for (let i = 0; i < bells.length; i++) {
  bells[i].url = "/sounds/" + bells[i].bell + ".wav";
}


$(function() {
  setupSample(0);
});





/* set up tower */

function setuptower() {
  
}

//fetch a sound file
async function getFile2(audioContext, filepath) {
  try {
    const response = await fetch(filepath);
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }
    const arrayBuffer = await response.arrayBuffer();
    return arrayBuffer;
  } catch (error) {
    console.log(error.message);
    //alert("Sorry, there has been a problem accessing the sound files.");
    return null;
  }
}

//create sound buffers for all the bells
async function setupSample(i) {
  let arrayBuffer = await getFile2(audioCtx, bells[i].url);
  if (arrayBuffer) {
    audioCtx.decodeAudioData(arrayBuffer, (buffer) => {
      bells[i].buffer = buffer;
      if (i < bells.length-1) {
        i++;
        setupSample(i);
      } else {
        console.log("finished getting sounds");
      }
    }, (e) => { console.log(e) });
  }
}



