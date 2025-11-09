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
var gainNode = audioCtx.createGain();
gainNode.gain.value = 0.75;
var currentbells = [];
var svg;
var rowArr = [[1,2,3,4,5,6],[1,2,3,4,5,6],[2,1,4,3,6,5],[2,1,3,4,5,6],[1,2,4,3,6,5],[1,2,3,4,5,6]];

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
  $("body").svg({onLoad: (o) => {
    svg = o;
  }});
  $("#startplay").on("click", startstopclick);
});





/* set up tower */

function setuptower() {
  buildcurrentbells("tower", numbells);

  buildtower(numbells, numbells);
  $("#buttoncontainer").show();
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
        setuptower();
      }
    }, (e) => { console.log(e) });
  }
}

//build array from bells array
function buildcurrentbells(type, n) {
  currentbells = [];
  let filter = bells.filter(o => o.type === type);
  for (let i = 0; i < n; i++) {
    let model = filter[i];
    let o = {
      num: n-i,
      buffer: model.buffer,
      stroke: 1
    };
    currentbells.push(o);
  }
}


//set up all the ropes
//start is the center/user rope, n is numbells
function buildtower(start, n) {
  //start with closest rope and go clockwise
  for (let i = 0; i < n; i++) {
    let num = start + i;
    if (num > n) num -= n;
    let j = n - num;
    
    addrope(num);
    position(i,num);
    //attach sounds to animation
    let handstroke = document.getElementById("hand9b"+num);
    handstroke.addEventListener("beginEvent", ring);
    let backstroke = document.getElementById("back11b"+num);
    backstroke.addEventListener("beginEvent", ring);
  }
}

function position(i, num) {
  let radius = 270; //update this for non-div by 4 stages
  let zrad = 270; //diff ????
  let angle = 2*Math.PI/numbells*i;
  //adjustment here for user ringing two bells
  let left = radius - radius * Math.sin(angle);
  let z = Math.cos(angle*-1) * zrad - zrad/2; //diff
  let bell = currentbells.find(b => b.num === num);
  bell.left = left;
  bell.z = z;
  $("#chute"+num).css({"left": left+"px", transform: "translateZ("+z+"px)"});
}

function addrope(num) {
  let div = `<div class="chute" id="chute${num}">
    <span class="bellnum">${num}</span>
    <span class="placebell"></span>
  </div>`;
  //then append the div
  $("#bells").append(div);
  let rope = svg.svg($("#chute"+num), null, null, 60, 500, {id: "rope"+num, class: "rope", viewBox: "0 0 60 500", xmlns: "http://www.w3.org/2000/svg", "xmlns:xlink": "http://www.w3.org/1999/xlink"});
  let defs = svg.defs(rope);
  let pattern = svg.pattern(defs, "sallypattern", 0, 0, 1, 0.13);
  let patternpaths = [{stroke: "blue", d: "M -2 4 l 5 -5"}, {stroke: "red", d: "M -2 8 l 9 -9"}, {stroke: "skyblue", d: "M -2 12 l 12 -12"}, {stroke: "blue", d: "M 1 13 l 9 -9"}, {stroke: "red", d: "M 5 13 l 5 -5"}];
  patternpaths.forEach(o => {
    svg.path(pattern, o.d, {"stroke-width": 3.2, stroke: o.stroke});
  });

  svg.rect(rope, 30, -90, 3, 260, {fill: "#dddddd", "stroke-width": 1, stroke: "#aaaaaa"});
  svg.rect(rope, 30, 255, 3, 60, {fill: "#dddddd", "stroke-width": 1, stroke: "#aaaaaa"});

  let hand = svg.svg(rope, null, null, null, null, {class: "hand", id: "hand"+num});
  svg.rect(hand, 0, 170, 29, 90, {fill: "transparent"});
  svg.rect(hand, 35, 170, 29, 90, {fill: "transparent"});
  svg.rect(hand, 27, 170, 9, 90, 7, null, {fill: "url(#sallypattern)", class: "sally", id: "sally"+num});

  let back = svg.svg(rope, null, null, null, null, {class: "back", id: "back"+num});
  svg.rect(back, 0, 315, 29, 61, {fill: "transparent"});
  svg.rect(back, 33, 315, 29, 61, {fill: "transparent"});
  let tail = svg.svg(back, null, null, null, null, {class: "tail", id: "tail"+num});
  svg.rect(tail, 30, 315, 5, 61, {fill: "white"});
  svg.path(tail, "M31.5,310 v30 l2,2 v30 l-1,2 h-2 l-1,-2 v-28 l4,-5 v-20 l-6,-3", {"stroke-width": 3, stroke: "#dddddd", fill: "none"});
  svg.path(tail, "M30,290 v50 l2,2 v30 l-1,2 l-1,-2 v-28 l5,-5 v-20 l-6,-3", {stroke: "#aaaaaa", "stroke-width": 1, fill: "none"});
  svg.path(tail, "M33,290 v50 l2,2 v30 l-2,3 h-4 l-2,-2 v-28 l6,-7 v-17 l-6,-3 l1.2,-2", {stroke: "#aaaaaa", "stroke-width": 1, fill: "none"});
  svg.rect(tail, 30.5, 315, 2, 9, {fill: "#dddddd"});
  svg.path(tail, "M31,342 l3,-3", {stroke: "#dddddd", fill: "none", "stroke-width": 1});

  let yy = [0, -6.2, -17, -37.22, -55.2, -37.11, -9.74, 23, 56.35, 89.125, 116.15, 135.04, 149.42, 159.65, 170.1, 173.7];
  ["hand", "back"].forEach(s => {
    for (let i = 0; i < yy.length-1; i++) {
      let j = s === "hand" ? i+1 : i;
      let y = s === "hand" ? yy[j] : yy[yy.length-i-2] ;
      let dur = setdur(s,i);
      let begin = i === 0 ? "indefinite" : s + (j-1) +"b"+num + ".endEvent";
      svg.other(rope, "animate", {id: s+j+"b"+num, attributeName: "viewBox", to: "0 "+y+" 60 500", dur: dur, begin: begin, fill: "freeze"});
    }
  });
}

//calculate duration for a portion of the bellrope animation
function setdur(s,i) {
  let n = duration/21;
  let dur = [0,14].includes(i) ? 3*n : [1,13].includes(i) ? 2*n : n;
  return dur;
}




/* **** RUN THE SIMULATOR **** */


function startstopclick() {
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  playing = !playing;
  if (playing) {
    $("#startplay").text("Stop");
    scheduledtimes = [];
    nextBellTime = audioCtx.currentTime + delay;
    scheduler();
  } else {
    $("#startplay").text("Start");
    clearTimeout(timeout);
  }
}


function scheduler() {
  while (nextBellTime < audioCtx.currentTime + scheduleAheadTime) {
    scheduleRing(place, nextBellTime);
    nextPlace();
  }
  rowArr[rownum] ? timeout = setTimeout(scheduler, lookahead) : clearTimeout(timeout);
}

//place and time
function scheduleRing(p, t) {
  let bell = rowArr[rownum][p];
  let strikediff = (stroke === 1 ? 11 : 14)/21 * duration;
  let striketime = t + strikediff;
  scheduledtimes.push({rownum: rownum, place: p+1, bell: bell, time: striketime});
  pull({bell: bell, stroke: stroke}, t);
}


function nextPlace() {
  place++;
  if (place === numbells) {
    //special
    nextBellTime += calcnextdelay(stroke);
    
    place = 0;
    stroke *= -1;
    rownum++;
  } else {
    nextBellTime += delay;
  }
}

function calcnextdelay(stroke) {
  let currentfraction = stroke === 1 ? 11 : 14;
  let currentdiff = currentfraction/21 * duration;
  let nextsound = currentdiff + delay;
  let nextfraction = stroke === 1 ? 14 : 11;
  let nextstart = nextsound - nextfraction/21*duration;
  if (stroke === -1) nextstart += delay; //handstroke gap
  return nextstart;
}







/* **** SIMULATOR USE **** */


//ring a bell
//obj has: bell (number), stroke (1 or -1)
function pull(obj, t) {
  if (currentbells.length) {
    let now = audioCtx.currentTime;
    let id = (obj.stroke === 1 ? "hand1b" : "back0b") + obj.bell;
    let bell = currentbells.find(b => b.num === obj.bell);
    if (bell && bell.stroke === obj.stroke) { //if strokes are consistent
      //actually pull the rope
      t ? document.getElementById(id).beginElementAt(t-now) : document.getElementById(id).beginElement();
      
      bell.stroke = obj.stroke * -1;
    }
  }
}



//given animation event find the buffer to play
function ring(e) {
  let stroke = this.id.startsWith("hand") ? 1 : -1;
  let bellnum = Number(this.id.startsWith("hand") ? this.id.slice(6) : this.id.slice(7));
  let bell = currentbells.find(b => b.num === bellnum);
  if (bell) {
    let pan = [];
    let x = (bell.left - 270)/135;
    let z = (bell.z)/100;
    pan.push(x, 10, z);
    
    let buffer = bell.buffer;
    playSample(audioCtx, buffer, pan);
  }
}


//play sound
function playSample(audioContext, audioBuffer, pan) {
  //console.log("playSample called");
  //console.log(audioBuffer);
  const sampleSource = audioContext.createBufferSource();
  sampleSource.buffer = audioBuffer;
  const panner = audioContext.createPanner();
  panner.panningModel = 'equalpower';
  if (pan) {
    panner.setPosition(...pan);
    sampleSource.connect(panner).connect(gainNode).connect(audioContext.destination);
  } else {
    sampleSource.connect(gainNode).connect(audioContext.destination);
  }
  //sampleSource.connect(audioContext.destination);
  sampleSource.start();
  return sampleSource;
}









