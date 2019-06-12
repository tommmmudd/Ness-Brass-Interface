/*********************
** SCORE AND INSTRUMENT BUILDER FOR NESS BRASS MODEL
** 2019, Tom Mudd
** Disclaimer - I'm not very good at this
*********************/

outlets = 5;


// SCORE VARIABLES
var T = 0;
var runningT = 0;
var valveCount = 3;
var lipFreq = new Array();
var init = [0.0, 30.0];
lipFreq.push(init);
var pressure = new Array();
var pressureMax = 5000;

var valves = new Array(valveCount);
for (var v=0; v<valveCount; v++) {valves[v] = new Array();}

var sr = 0.0000146;
var mu = 0.0000537;
var sigma = 5;
var H = 0.00029;
var w = 0.01;

var previousNoteEndMS = 0;
var previousPitch = 0;

var pitchInterpolationTime = 0.0025;

var noise = new Array();

var vibamp = new Array();
var vibampMax = 1.0;
var vibfreq = new Array();
var vibfreqMax = 15;


//************************
// INSTRUMENT VARIABLES

var sample_rate = 44100;
var inst_temperature = 20;
var inst_vpos = [600, 630, 660];
var inst_vdl = [20,20,20];
var inst_vbl = [130.7,57.5,199.8];
var inst_mouthpieceLen = 20;
var inst_middleLens = [80,200,545];
var inst_length = 1400;
var inst_mouthpieceDiameter = 20;
var inst_profile = [[4,9,3], [9,12,1], [12,12,1]];
var inst_endDiameter = 130;
var inst_flare = 6; 
var inst_mid_section_count = 3;



// FUNCTIONS



function bang() {
	var totalTime = Math.floor(previousNoteEndMS*0.001) + 1;
	if (totalTime < runningT) { totalTime = runningT;}	// taken from addNote function
	post("total time = "+totalTime);
	outlet(0, "clear");
	outlet(3, "clear");
	writeScoreHeader();
	writeScoreMain();
	writeValveOpenings(totalTime);
	//combined_score += scoreFooter();
	
	//outlet(0, combined_score);
	outlet(1, "score_out.m");
	
	writeInstrument();
	outlet(4, "inst_out.m");
}

// ****************************************
//  SCORE FUNCTIONS


// Clearing
function clearAll() {
	lipFreq = new Array();
	clearPressure();
	clearValves();
}
function clearPressure() {
	pressure = new Array();
}
function clearValves() {
	valves = new Array(valveCount);
	for (var v=0; v<valveCount; v++) {valves[v] = new Array(); post(v);}
}

// Adding
function addPair() {
	var args = arrayfromargs(arguments);
	var type = args[0]; 		// could be "pressure", ...
	//post("\ntype: "+args[0]+" firstval: "+args[1]+"  count: "+args[2]+"\n");
	vals = new Array(2);
	vals[0] = (args[1] * T * 0.001).toFixed(3);  // MILLISECONDS-TO-SECONDS and scale the single second breakpoint by the total time (T)
	if (type == "pressure") {
		vals[1] = args[2] * pressureMax;
		pressure.push(vals);
	} else if (type == "vibamp") {
		vals[1] = args[2] * vibampMax;
		vibamp.push(vals);
	} else if (type == "vibfreq") {
		vals[1] = args[2] * vibfreqMax;
		vibfreq.push(vals);
	} else if (type == "noise") {
		vals[1] = args[2];
		noise.push(vals);
	}
}
function addValve() {
	var args = arrayfromargs(arguments);
	var valveNum = args[0]-1;
	var valCount = args.length - 1;
	for (var i=0; i<valCount; i++) {
		valve_pair = new Array(2);
		valve_pair[0] = (T * i/valCount).toFixed(3);
		valve_pair[1] = (args[i+1]).toFixed(3);
		//post("index: "+valveNum+"   T: "+valve_pair[0]+"  val: "+valve_pair[1]+"\n");
		valves[valveNum].push(valve_pair);
	}
}
/* Needs to check what comes first: a new note, or a note off
** if a new note arrives before the note off, then make manual note off
** so that there isn't a pitch glide */
function addNote(t_ms, pitch, vel, dur) {
	
	// END PREVIOUS NOTE
	// if the new note coming in is before the end of the previous note, then end the previous note
	if (t_ms < previousNoteEndMS) { 
		// end the previous note just before starting this one
		addLF((t_ms*0.001) - pitchInterpolationTime, previousPitch);
	}
	// if not, then end the previous note according to it's own (at previousNoteEnd)?
	else {
		// end the prvious note according to it's own time
		addLF(previousNoteEndMS*0.001, previousPitch);
	}

	// ADD NEW NOTE
	if (vel != 0) {
		addLF(t_ms*0.001, pitch);
	}
	
	previousNoteEndMS = t_ms + dur;
	if (previousNoteEndMS > runningT) {runningT = previousNoteEndMS;}
	previousPitch = pitch;
}
function addLF(t, p) { // seconds and MIDI pitches
	var lf_vals = new Array(2);
	lf_vals[0] = t.toFixed(3);
	lf_vals[1] = mtof(p).toFixed(3);
	lipFreq.push( lf_vals );
}

// Setting
function setParam() {
	var args = arrayfromargs(arguments);
	var paramName = args[0];
	if (paramName == "sr") { sr = (args[1]*0.001).toFixed(7);}
	if (paramName == "mu") { mu = (args[1]*0.001).toFixed(7);}
	if (paramName == "sigma") { (sigma = args[1]).toFixed(7);}
	if (paramName == "H") { H = (args[1]*0.001).toFixed(7);}
	if (paramName == "w") { w = (args[1]*0.001).toFixed(7);}
}


// *************************************
// WRITING SCORE

function writeValveOpenings(maxT) {
	outlet(0, "valveopening=[");
	for (var i=0; i<valves[0].length; i++) {
		// get the time from the first valve
		var tempScore = valves[0][i][0];
		for (var v=0; v<valveCount; v++) {
			tempScore += ","+valves[v][i][1];
		}
		tempScore +="; ";
		outlet(0, tempScore);
	}
	outlet(0, "];\n\n");
}


function writeScoreHeader() {
	var tempString = "maxout=0.95;\nT="+T+";\n\nSr=[0,"+sr+"];\nmu=[0,"+mu+"];\nsigma=[0,"+sigma+"];\nH=[0,"+H+"];\nw=[0,"+w+"];\n\n";
	outlet(0, tempString);
}

function writeScoreMain() {
	var tempScore = "lip_frequency=[";
	tempScore += writePairs(lipFreq);
	tempScore += "];\n\n";
	outlet(0, tempScore);
	
	tempScore = "pressure=[";
	tempScore += writePairs(pressure);
	tempScore += "];\n\n";
	outlet(0, tempScore);
	
	tempScore = "vibamp=[";
	tempScore += writePairs(vibamp);
	tempScore += "];\n\n";
	tempScore += "vibfreq=[";
	tempScore += writePairs(vibfreq);
	tempScore += "];\n\n";
	tempScore += "noiseamp=[";
	tempScore += writePairs(noise);
	tempScore += "];\n\n";
	outlet(0, tempScore);
}

function writePairs(pairArray) {
	var tempScore = "";
	var valCount = pairArray.length;
	for (var i=0; i<valCount; i++) {
		tempScore += pairArray[i][0]+", "+pairArray[i][1];
		if (i<(valCount-1)) {
			tempScore += "; ";
		}
	}
	return tempScore;
}

function scoreFooter() {
	var tempString = "";
	return tempString;
}

function getTime() {
	T = Math.floor(previousNoteEndMS*0.001)+1;
	outlet(2, "time", T);
}


function mtof(note) {
	return (440.0 * Math.pow(2, (note - 69) / 12.0));
}


// INSTURMENT FUNCTIONS

function setMiddleSections() {
	var args = arrayfromargs(arguments);
	for (var i=0; i<inst_mid_section_count; i++) {
		inst_profile[i][0] = args[i*3];
		inst_profile[i][1] = args[i*3 + 1];
		inst_profile[i][2] = args[i*3 + 2];
	}
}
function setValvePos() {
	var args = arrayfromargs(arguments);
	inst_vpos[0] = args[0] * inst_length;
	inst_vpos[1] = args[1] * inst_length;
	inst_vpos[2] = args[2] * inst_length;
}
function setLength(new_len) {
	// return each valve to a ratio of the length
	for (var i =0; i<inst_vpos.length; i++) {
		inst_vpos[i] = inst_vpos[i] / inst_length;
	}
	// scale the positions by the length
	inst_length = new_len;
	for (var i =0; i<inst_vpos.length; i++) {
		inst_vpos[i] = inst_vpos[i] * inst_length;
	}
}
function setMidSectionCount(new_count) {
	inst_mid_section_count = new_count;
	var middleSize = inst_middleLens.length;
	if (inst_mid_section_count > middleSize) {
		for (var i=0; i<(inst_mid_section_count - middleSize); i++) {
			inst_middleLens.push(inst_middleLens[middleSize-1]);
		}
	}
	var middleProfileSize = inst_profile.length;
	if (inst_mid_section_count > middleProfileSize) {
		for (var i=0; i<(inst_mid_section_count - middleProfileSize); i++) {
			inst_profile.push(inst_profile[middleProfileSize-1]);
		}
	}
}

function writeInstrument() {
	post(inst_mid_section_count);
	instrument_string = "% brversion 1.0\n"
	instrument_string += "% auto generated instrument from Max-based brass interface\n\n"
	instrument_string += "custominstrument=1;\n\n"
	instrument_string += "FS = "+sample_rate+"; % sample rate\n"	
	instrument_string += "temperature = "+inst_temperature+";   % instrument temperature in C\n"	
	instrument_string += "vpos = ["+inst_vpos[0]+","+inst_vpos[1]+","+inst_vpos[2]+"];  position of valve in mm \n"
	instrument_string += "vdl = ["+inst_vdl[0]+","+inst_vdl[1]+","+inst_vdl[2]+"];   % default (shortest) tube length mm\n"	
	instrument_string += "vbl = ["+inst_vbl[0]+","+inst_vbl[1]+","+inst_vbl[2]+"];   % %bypass (longest) tube length mm\n"	
	instrument_string += "xmeg = "+inst_mouthpieceLen+";\n"	
	instrument_string += "x0eg = [";
	for (var i=0; i<inst_mid_section_count; i++) {
		instrument_string += inst_middleLens[i];
		if (i < (inst_mid_section_count-1)) {
			instrument_string += ",";
		}
	}
	instrument_string += "];   % bypass (longest) tube length mm\n"	
	instrument_string += "Leg = "+inst_length+";\n"	
	instrument_string += "rmeg = "+inst_mouthpieceDiameter+";\n"	
	instrument_string += "r0eg = [";
	for (var i=0; i<inst_mid_section_count; i++) {
		for (var j=0; j<inst_profile[i].length; j++) {
			instrument_string += inst_profile[i][j]
			if (j < (inst_profile[i].length -1)) {
				instrument_string += ",";
			}
		}
		if (i < (inst_mid_section_count-1)) {
			instrument_string += ";";
		}
	}
	instrument_string += "];    % middle section diameter (mm) and profile specifications\n\n";
	instrument_string += "rbeg = "+inst_endDiameter+";    % end diameter mm\n"
	instrument_string += "fbeg = "+inst_flare+";    % flare power\n"
	outlet(3, instrument_string);
}

