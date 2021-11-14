var myVariable1 = 1;
var myVariable2 = 1.5;
var myVariable3 = "Hello World";

console.log(myVariable3);

//Painting by number converter by Corey Sean Lister during the great quarantine of 2020.

//Assumptions to be maintained at website development
	//1) image is added to document and given the unique id 'imageRaw'.
	//2) rgba pixel values may never be == -1
	//3) RGB format is [red, green, blue, alpha]
	
//further development:
	//1) Ability to scale output up/down as desired
	//2) Output to alternative filetypes
	//3) Ability to alter contrast / brightness / individual colors with a slider in post
	


//Declare Global Variables

//colors is a vector containing [R,G,B,A] values as assigned as primary colors by 
var colors = new Array(); // 2d vector [colorIndex, r, g, b, a]
var colorsUsed = new Array();
var range = 60;
var relativeColors = 1; //true or false
var lineThicknessX = 2;
var lineThicknessY = 2;
var cleanupIterations = 10;
var scale = 2;
//cleanupWidth is some kind of blotchy smoothing technique
//width 10 seems to be very thick
var cleanupWidth = 5; //some kind of secondary smoothing

//pixelMap is a vector to represent pixel rows in y direction with vector members to represent pixels in X direction containing vector of int (i) values matching colors[i] for their color
//initialize pixelMap
var pixelMap;
//numbers[0] = [colorIndex, x, y]; where the x y coordinate determines where it shall be printed
var numbers;

var canvasWidth;
var canvasHeight;


function create2DArray(x,y) {
  var arr = [];

  for (var iy=0;iy<y;iy++) {
     arr[iy] = [];
	 for (var ix=0; ix<x; ix++){
		arr[iy].push(0);
	 }
  }
  

  return arr;
}

function getEventLocation(element,event){
    // Relies on the getElementPosition function.
    var pos = getElementPosition(element);
    
    return {
    	x: (event.pageX - pos.x),
      	y: (event.pageY - pos.y)
    };
}

function getElementPosition(obj) {
    var curleft = 0, curtop = 0;
    if (obj.offsetParent) {
        do {
            curleft += obj.offsetLeft;
            curtop += obj.offsetTop;
        } while (obj = obj.offsetParent);
        return { x: curleft, y: curtop };
    }
    return undefined;
}

//render canvas from image
function specifyImage(){	
	console.log("specifyImage running");
	//select the image to upload
	
	//when image loaded run the function below:
	document.getElementById("imageRaw");
	//convert image to canvas
	var c = document.getElementById('canvasImage');
	var ctx = c.getContext("2d");
	var img = document.getElementById("imageRaw");

	//resize canvas to image
	c.width = img.clientWidth;
	c.height = img.clientHeight;	
	
	//draw canvas
	ctx.drawImage(img, 0, 0);
	img.style.display = "none";

	canvasHeight = c.height;
	canvasWidth = c.width;
	
	//initialize pixelMap
	pixelMap = create2DArray(canvasWidth, canvasHeight);

	processImage();
}

//return arrayLineCoordinates at index i
function getLineCoordinates(i){
	return arrayLineCoordinates[i]
}

//add colorIndex i to pixelMap at coordinate x y
function setPixelMapColorIndexAtCoord(x, y, i){
	pixelMap[y][x] = i;
}

//returns the [R,G,B,A] at coordinates x, y as stored in PixelMap
function getPixelMapColorIndexAtCoord(x, y){
	return pixelMap[y][x];
}

function setPixel(imageData, x, y, r, g, b, a) {
    index = (x + y * imageData.width) * 4;
    imageData.data[index+0] = r;
    imageData.data[index+1] = g;
    imageData.data[index+2] = b;
    imageData.data[index+3] = a;
}

//processImage
function processImage(){
	console.log("processImage running");
	//reference canvas for processing
	var canvasContext = document.getElementById('canvasImage').getContext('2d');
	var imageData = canvasContext.getImageData(0, 0, canvasWidth, canvasHeight).data;
	console.log(imageData);
	var yDataJump = canvasWidth*4;
	
	//loop through pixels of canvasImage and do action
	//iterate vertically start at y=0 (px)
	var ylimit = canvasImage.height;
	var xlimit = canvasImage.width;
	//for (var y = ylimit - 1; y >= 0; y--){ //<-- iterate in reverse direction
	for (var y = 0; y < ylimit; y++){
		console.log("processing status: " + (y) + " / " + ylimit);
		//iterate horizontally start at x=0 (px)
		//for (var x = xlimit; x >= 0; x--){ //<-- iterate in reverse direction
		for (var x = 0; x < xlimit; x++){
			//populate the points on pixelMap
			//setPixelMapColorIndexAtCoord(x,y,getColorIndex(canvasContext.getImageData(x, y, 1, 1).data)); //<-- this is crazy slow
			//x0y0 = index 0-4
			var localreference = 0+4*x+y*yDataJump;
			setPixelMapColorIndexAtCoord(x,y,getColorIndex([imageData[0+localreference],imageData[1+localreference],imageData[2+localreference],1]));
		}
	}
	console.log('processImage finished');
	cleanupPixelMap();
}

function getColorIndex([r,g,b,a]){
	//r,g,b,a = red, green, blue, alpha (disabled)
	var i = 0;
	var len = colors.length;
	
	//given a predefined colorIndex we can calculate the color index rather than looking it up - find time to do this
	
	for(i; i < len; i++){
		//red
		if (colors[i][0] - (range - 1) < r && r <= colors[i][0] + (range - 1)){
			//red within bounds - subtract least error from newRange
			//Math.abs(colors[i][0] - range)
			//green
			if (colors[i][1] - (range - 1) < g && g <= colors[i][1] + (range - 1)){
				//blue
				if (colors[i][2] - (range - 1) < b && b <= colors[i][2] + (range - 1)){
					return i;
				}
			}
		}
	}
	//color was not found, increment i for new color
	console.log("warning: getColorIndex found no matching color!");
	console.log(colors);
	console.log([r,g,b,a]);
	colors.push([r,g,b]);
	//console.log("color not found, stored at index " +i);
	//console.log(colors);
	return i;
}

function predefineColors(){
	console.log("defining colors");
	//min color = 0
	//max color = 255
	//must cover all colors at interval range
	
	for (var red = 0; red < 255; red+=range ){
		for (var green = 0; green < 255; green+= range){
			for (var blue=0; blue < 255; blue+=range){
				colors.push([red,green,blue]);				
			}
		}
	}
	//finally add white to fill the color palette.
	if ((255 % range) != 0){
		colors.push([255,255,255]);	
	}
}
	
//rebuild image with new colors from pixelMap
function imageGeneratePreview(){
	var div = document.getElementById("previewImage");
	while (div.firstChild){
		div.removeChild(div.firstChild);
	}
	var canvas = document.createElement('canvas');
	canvas.id="canvasPreview";
	div.appendChild(canvas);
	ctx=canvas.getContext("2d");
	canvas.width = scale * canvasWidth;
	canvas.height = scale * canvasHeight;
	ctx.scale(scale,scale);
	
	document.getElementById("postEdit").style.display = "none";
	
	ymax = canvasHeight;
	xmax = canvasWidth;
	
	//reset colorsUsed each time a preview is generated.
	colorsUsed = [];
	
	for (var y = 0; y < ymax; y++){
		console.log("imageGeneratePreview progress: "+y+"/"+ymax);
		for (var x=0; x < xmax; x++){
			var colorIndex = getPixelMapColorIndexAtCoord(x,y);
			var rgb = colors[colorIndex];
			//check if colorIndex exists in colorsUsed
			var numColorsUsed = colorsUsed.length;
			var newColor = true;
			for (var i = 0; i < numColorsUsed; i++){
				if(colorsUsed[i][0] == colorIndex){
					newColor = false;
				}
			}
			if (newColor){
				colorsUsed.push([colorIndex, rgb[0], rgb[1], rgb[2]]);
			}
			ctx.fillStyle ="rgba(" + rgb[0] + "," + rgb[1] + "," + rgb[2] + ",1)";
			ctx.fillRect(x,y,1,1);
		}
	}
	
	//setup onclick events
	canvas.addEventListener("click", function(event){
		// Get the coordinates of the click
		var eventLocation = getEventLocation(this,event);
		// Get the data of the pixel according to the location generate by the getEventLocation function
		var context = this.getContext('2d');
		var pixelData = context.getImageData(eventLocation.x, eventLocation.y, 1, 1).data;
		//get color id of this color
		var colorIndex = getColorIndex(pixelData);
		
		document.getElementById("redColorSlider").value = pixelData[0];
		document.getElementById("greenColorSlider").value = pixelData[1];
		document.getElementById("blueColorSlider").value = pixelData[2];
		document.getElementById("titleColorValue").innerHTML = colorIndex;
		document.getElementById("colorSwab").style.backgroundColor = "rgb("+pixelData[0]+","+pixelData[1]+","+pixelData[2]+")";
		document.getElementById("colorSwabOriginal").style.backgroundColor = "rgb("+pixelData[0]+","+pixelData[1]+","+pixelData[2]+")";
		
		document.getElementById("postEdit").style.display = "block";
	});

	console.log("imageGeneratePreview completed successfully");
	imageGeneratePrint();
}

//look for adjacent pixels with consecutive different color indexes (over 3 pixels, more than 1 color index change)
//set second pixel to color index of first pixel
function cleanupPixelMap(){
	for (var i = 0; i < cleanupIterations; i++){	
		//look at pixels around pixel of question
		//if 6/8 pixels do not match, reassign to most common mismatch
		for (var y = Math.floor(cleanupWidth/2); y < ymax-Math.floor(cleanupWidth/2); y++){
			for (var x = Math.floor(cleanupWidth/2); x < xmax-Math.floor(cleanupWidth/2); x++){
				var colorIndex = getPixelMapColorIndexAtCoord(x,y);
				var mismatchCount = 0;
				var buffer = [];
				
				for (var ymod = 0 - Math.floor(cleanupWidth/2); ymod < Math.ceil(cleanupWidth/2); ymod++){
					for (var xmod = 0 - Math.floor(cleanupWidth/2); xmod < Math.ceil(cleanupWidth/2); xmod++){
						var checkColorIndex = getPixelMapColorIndexAtCoord(x+xmod, y+ymod);
						buffer.push(checkColorIndex);
						if(checkColorIndex != colorIndex){
							mismatchCount++;
						}
					}				
				}
				
				if (mismatchCount > ((2/3)*(Math.ceil(cleanupWidth/2))*(Math.ceil(cleanupWidth/2)))){
					//Too many of the surrounding pixels do not match, assign this pixel most common value in buffer
					var frequency = {};
					var max = 0;
					var result;
					for(var v in buffer) {
							frequency[buffer[v]]=(frequency[buffer[v]] || 0)+1; // increment frequency.
							if(frequency[buffer[v]] > max) { // is this frequency > max so far ?
									max = frequency[buffer[v]];  // update max.
									result = buffer[v];          // update result.
							}
					}
					setPixelMapColorIndexAtCoord(x,y,result);
				}
			}
		}
		
	var canvas = document.getElementById('canvasFinal');
	canvas.width=document.getElementById("canvasImage").width;
	canvas.height=document.getElementById("canvasImage").height;
	
	ctx=canvas.getContext("2d");
	
	var ymax = canvas.height;
	var xmax = canvas.width;
	
	//iterate left - right, top - down
	//initialize buffer
	for (var y = 0; y < ymax; y++){
		var buffer1 = getPixelMapColorIndexAtCoord(0,y);
		var buffer2 = getPixelMapColorIndexAtCoord(1,y);
		for (var x = 2; x < xmax; x++){
			var currentPixelColorIndex = getPixelMapColorIndexAtCoord(x,y);
			if (buffer1 != buffer2 && buffer2 != currentPixelColorIndex){
				//3 consequtive changes in pixel index detected, replace second pixel index with first
				setPixelMapColorIndexAtCoord(x-1,y,buffer1);
			}
			//update buffers
			buffer1 = buffer2;
			buffer2 = currentPixelColorIndex;
		}
	}
	
	//iterate top - down, left - right
	for (var x = 0; x < xmax; x++){
		var buffer1 = getPixelMapColorIndexAtCoord(x,0);
		var buffer2 = getPixelMapColorIndexAtCoord(x,1);
		for (var y = 2; y < ymax; y++){
			var currentPixelColorIndex = getPixelMapColorIndexAtCoord(x,y);
			if (buffer1 != buffer2 && buffer2 != currentPixelColorIndex){
				//3 consequtive changes in pixel index detected, replace second pixel index with first
				setPixelMapColorIndexAtCoord(x,y-1,buffer1);
			}
			//update buffers
			buffer1 = buffer2;
			buffer2 = currentPixelColorIndex;
			}
		}
	console.log("cleanupPixelMap complete");
	}
	
	//finally clear the pixels on the outside we did not clean up to leave a white outline around image
	for (var y = 0; y < canvasHeight; y++){
		for (var x = 0; x < Math.ceil(cleanupWidth/2); x++){
			setPixelMapColorIndexAtCoord(x,y,getColorIndex([255,255,255,1]));	
		}
		for (var x = canvasWidth-Math.ceil(cleanupWidth/2); x < canvasWidth; x++){
			setPixelMapColorIndexAtCoord(x,y,getColorIndex([255,255,255,1]));	
		}
	}
	for (var x = 0; x < canvasWidth; x++){
		for (var y = 0; y < Math.ceil(cleanupWidth/2); y++){
			setPixelMapColorIndexAtCoord(x,y,getColorIndex([255,255,255,1]));	
		}
		for (var y = canvasHeight-Math.ceil(cleanupWidth/2); y < canvasHeight; y++){
			setPixelMapColorIndexAtCoord(x,y,getColorIndex([255,255,255,1]));	
		}		
	}
	//start next sequence
	imageGeneratePreview();	
	
}
	
//Generate the final paint by number output
function imageGeneratePrint(){
	var canvas = document.getElementById('canvasFinal');
	canvas.width=scale*canvasWidth;
	canvas.height=scale*canvasHeight;
	
	ctx=canvas.getContext("2d");
	ctx.scale(scale,scale);
	
	var ymax = canvasHeight;
	var xmax = canvasWidth;
	
	
	//iterate left - right, top - down
	//initialize buffer
	var buffer = getPixelMapColorIndexAtCoord(0,0);
	for (var y = 0; y < ymax; y++){
		for (var x = 0; x < xmax; x++){
			var currentPixelColorIndex = getPixelMapColorIndexAtCoord(x,y);
			if (currentPixelColorIndex != buffer){
				buffer = currentPixelColorIndex;
				//draw a line 
				ctx.fillStyle="black";
				ctx.fillRect(x,y,lineThicknessX,lineThicknessY);
			}
		}
	//reset buffer for next column to first x of column before
	buffer = getPixelMapColorIndexAtCoord(0,y);
	}
	
	//iterate top - down, left - right
	//reset buffer
	buffer = getPixelMapColorIndexAtCoord(0,0);	
	console.log("starting vertical iterations");
	
	for (var x = 0; x < xmax; x++){
		for (var y = 0; y < ymax; y++){
			var currentPixelColorIndex = getPixelMapColorIndexAtCoord(x,y);
			if (currentPixelColorIndex != buffer){
				buffer = currentPixelColorIndex;
				//draw a line 
				ctx.fillStyle="black";
				ctx.fillRect(x,y,lineThicknessX,lineThicknessY);
			}
		}
	//reset buffer for next column to first x of column before
	buffer = getPixelMapColorIndexAtCoord(x,0);
	}
	
	//generate colorIndex at appropriate position
	console.log("pixelMap");
	console.log(pixelMap);
	imageGenerateLegend();
}

//Generate an output image with colors and their respective numbers
function imageGenerateLegend(){
	var numColorsUsed = colorsUsed.length;
	
	var legend = document.getElementById("legend");
	legend.innerHTML = "";
	
	var summary = document.createElement('div');
	summary.innerHTML="this image uses " + numColorsUsed + " colors.";
	summary.id="summary";
	legend.appendChild(summary);
	
	for (var i = 0; i < numColorsUsed; i++){
		var div = document.createElement('div');
		div.classList.add('legendColor');
		legend.appendChild(div);
		
		var div1 = document.createElement('div');
		div1.classList.add('legendColorCode');
		var div1ColorIndex = document.createElement('div');
		div1ColorIndex.classList.add('legendText');
		div1ColorIndex.innerHTML = "Color Code: " + colorsUsed[i][0];
		div1.appendChild(div1ColorIndex);
		var div1ColorCode = document.createElement('div');
		div1ColorCode.classList.add('legendText');
		div1ColorCode.innerHTML = "rgb(" + colorsUsed[i][1] + "," + colorsUsed[i][2] + "," + colorsUsed[i][3] + ")";
		div1.appendChild(div1ColorCode);
		div.appendChild(div1);
		
		
		
		//inside div create a square for displaying color, color code and RGB color
		var divColorDisplay = document.createElement('div');
		divColorDisplay.classList.add('legendColorBlock');
		divColorDisplay.style.backgroundColor = "rgb(" + colorsUsed[i][1] + "," + colorsUsed[i][2] + "," + colorsUsed[i][3] + ")";
		div.appendChild(divColorDisplay);
	}
	
	var canvasContext = document.getElementById('canvasImage').style.display = "none";
	document.getElementById('imageRaw').style.display = "block";
}

function generateNumberLocations(){
	//generates locations of numbers


}

//Export canvas elements to images in new tabs so they may be downloaded as canvas downloading is not supported.
function exportImage(){
	//ToDo: implement cleaner solution
	

}

//get and validate all configurations
function getConfigurations(){
	console.log("getConfigurations running");
	
	var rangeSlider = document.getElementById('rangeSlider');
	console.log(rangeSlider.value);
	range = (160 - rangeSlider.value);
	console.log("range is " + range);
	
	var relativeColorCheckbox = document.getElementById('checkboxColorFormat');
	relativeColors=relativeColorCheckbox.checked;
	console.log("relativeColors set to " + relativeColorCheckbox.checked);
	
	var roundnessSlider = document.getElementById('roundnessSlider');
	cleanupWidth = roundnessSlider.value;
	console.log("cleanupWidth is "+cleanupWidth);
	
	colors = []
	
	
	if(relativeColors == false){
		predefineColors();
	}
	if ((cleanupWidth % 2) == 0){
		cleanupWidth = cleanupWidth-1;
	}
	
	

	specifyImage();
}

function initialize(){
	//initialize dropZone
	var dropZone = document.getElementById('dropZone');
	//for chrome:
	dropZone.addEventListener('dragover', function(e) {
		e.stopPropagation();
		e.preventDefault();
		e.dataTransfer.dropEffect = 'copy';
	});
	
	// Get file data on drop
	dropZone.addEventListener('drop', function(e) {
		e.stopPropagation();
		e.preventDefault();
		var files = e.dataTransfer.files; // Array of all files

		for (var i=0, file; file=files[i]; i++) {
			if (file.type.match(/image.*/)) {
				while(dropZone.firstChild){
					dropZone.removeChild(dropZone.firstChild);
				}
				var reader = new FileReader();

				reader.onload = function(e2) {
					// finished reading file data.
					var img = document.createElement('img');
					img.src= e2.target.result;
					img.id="imageRaw";
					dropZone.appendChild(img);
					img.onload = function() {
						dropZone.style.width=img.width+"px";
						dropZone.style.height=img.height+"px";
					}
					var canvas = document.createElement('canvas');
					canvas.id="canvasImage";
					dropZone.appendChild(canvas);
				}

				reader.readAsDataURL(file); // start reading the file data.
			}
		}
	});
	
	document.getElementById("redColorSlider").oninput = function() {
		var colorIndex = Number(document.getElementById("titleColorValue").innerHTML);
		
		colors[colorIndex][0] = this.value;
		
		//update colorSwab color
		document.getElementById("colorSwab").style.backgroundColor = "rgb(" + colors[colorIndex][0] + "," + colors[colorIndex][1] + "," + colors[colorIndex][2] + ")";
	}
	document.getElementById("greenColorSlider").oninput = function() {
		var colorIndex = Number(document.getElementById("titleColorValue").innerHTML);
		
		colors[colorIndex][1] = this.value;
		
		//update colorSwab color
		document.getElementById("colorSwab").style.backgroundColor = "rgb(" + colors[colorIndex][0] + "," + colors[colorIndex][1] + "," + colors[colorIndex][2] + ")";
	}
	document.getElementById("blueColorSlider").oninput = function() {
		var colorIndex = Number(document.getElementById("titleColorValue").innerHTML);
		
		colors[colorIndex][2] = this.value;
		
		//update colorSwab color
		document.getElementById("colorSwab").style.backgroundColor = "rgb(" + colors[colorIndex][0] + "," + colors[colorIndex][1] + "," + colors[colorIndex][2] + ")";	
	}
	
	document.getElementById("postEdit").style.display = "none";
	
	var btnRerender = document.createElement('button');
	btnRerender.id = 'rerender';
	btnRerender.classList.add('btn-important');
	btnRerender.innerHTML ='Rerender Image';
	document.getElementById("selectedColor").appendChild(btnRerender);
	btnRerender.onclick = function() {
		imageGeneratePreview();
	};
	
	
	//initialize controls
	var controlZone = document.getElementById('controlZone');
	
	var btn = document.createElement('button');
	btn.id = 'process';
	btn.classList.add('btn-important');
	btn.innerHTML ='Start Conversion';
	controlZone.appendChild(btn);
	btn.onclick = function() {
		if(dropZone.firstChild){
			getConfigurations();
		}
	};
}


initialize();
