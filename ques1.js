var grid;
var next;
var n;
var k; //diffusion rate
var prev;
let capturer;
let btn;
var isAnimating = false;
var isNewton = true;
let downloadText;
let methodButton;
let resetBtn;
let tempTxt;
let reflecting, absorbing, periodic;
let boundaryType;
var middle = [];
let chartLink;
let dropDownText;
var end = [];
var isGreaterThan001 = false;
var printed = false;
var x, y;
var sum = 0;
capturer = new CCapture({
    format: "webm",
    framerate: 100,
    name: "movie",
  });
let p5Canvas;

boundaryTemp = 0.5 // (1-boundaryTemp)*50 gives the actual value of temp
intermediateTemp = 0.4 // (1 - intermediateTemp)*50 gives actual value
w = 20; //width of each cell
h = 20; //height of each cell
k = 0.08 //diffusion rate or thermal diffusivity


function setAbsorbingBoundary(grid, next, boundaryTemp){

	boundaryType = 'absorbing';
	for(var x = 0; x<cols; x++)
	{
		if(x==0 || x == cols - 1)
		{
			for(var y = 0; y < rows; y++)
			{
				grid[x][y] = new Cell(x*w, y*h, w, h, boundaryTemp);
				next[x][y] = new Cell(x*w, y*h, w, h, boundaryTemp);
			}
		}
		else
		{
			grid[x][0] = new Cell(x*w, 0, w, h, boundaryTemp);
			grid[x][rows - 1] = new Cell(x*w, (rows - 1)*h, w, h, boundaryTemp);

			next[x][0] = new Cell(x*w, 0, w, h, boundaryTemp);
			next[x][rows - 1] = new Cell(x*w, (rows - 1)*h, w, h, boundaryTemp);
		}
	}

	if(tempTxt)
	{
		tempTxt.remove();
	}
	//creating a new p tag to display temp
	tempTxt = document.createElement("p");
	tempTxt.innerHTML = "Boundary temperature: " + ((1 - boundaryTemp)*50).toString() + " C";
	document.body.appendChild(tempTxt);
	tempTxt.style = "font-size: 18px; margin-left: 26%";

	return grid, next;
}

function setPeriodicBoundary(grid, next){

	boundaryType = 'periodic';
	for(var y = 1; y<rows - 1; y++){
		//setting the left most boundary
		grid[0][y] = new Cell(0, y*h, w, h, grid[cols - 2][y].getValue());
		next[0][y] = new Cell(0, y*h, w, h, grid[cols - 2][y].getValue());

		//setting the right most boundary
		grid[cols - 1][y] = new Cell((cols-1)*w, y*h, w, h, grid[1][y].getValue());
		next[cols - 1][y] = new Cell((cols-1)*w, y*h, w, h, grid[1][y].getValue());
	}

	for(var x = 1; x < cols - 1; x ++){
		//setting the top most boundary
		grid[x][0] = new Cell(x*w, 0, w, h, grid[x][rows - 2].getValue());
		next[x][0] = new Cell(x*w, 0, w, h, grid[x][rows - 2].getValue());

		//setting the bottom most boundary
		grid[x][rows - 1] = new Cell(x*w, (rows-1)*h, w, h, grid[x][1].getValue());
		next[x][rows - 1] = new Cell(x*w, (rows-1)*h, w, h, grid[x][1].getValue());
	}

	//setting the corner cells
	grid[0][0] = new Cell(0, 0, w, h, grid[0][rows - 2].getValue());
	grid[cols - 1][0] = new Cell ((cols - 1)*w, 0, w, h, grid[1][0].getValue());
	grid[0][rows - 1] = new Cell (0, (rows - 1)*h, w, h, grid[cols - 2][rows - 1].getValue());
	grid[cols - 1][rows - 1] = new Cell ((cols - 1)*w, (rows - 1)*h, w, h, grid[cols - 1][1].getValue());

	next[0][0] = new Cell(0, 0, w, h, grid[0][rows - 2].getValue());
	next[cols - 1][0] = new Cell ((cols - 1)*w, 0, w, h, grid[1][0].getValue());
	next[0][rows - 1] = new Cell (0, (rows - 1)*h, w, h, grid[cols - 2][rows - 1].getValue());
	next[cols - 1][rows - 1] = new Cell ((cols - 1)*w, (rows - 1)*h, w, h, grid[cols - 1][1].getValue());

	return grid, next;
}

function setReflectingBoundary(grid, next){

	boundaryType = 'reflecting';
	for(var x = 1; x < cols - 1; x++)
	{
		//setting the topmost row
		grid[x][0] = new Cell(x*w, 0, w, h, grid[x][1].getValue());
		next[x][0] = new Cell(x*w, 0, w, h, grid[x][1].getValue());

		//setting the bottom most row
		grid[x][rows - 1] = new Cell(x*w, (rows-1)*h, w, h, grid[x][rows - 2].getValue());
		next[x][rows - 1] = new Cell(x*w, (rows-1)*h, w, h, grid[x][rows - 2].getValue());
	}

	for(var y=1;y<rows - 1; y++)
	{
		//setting the leftmost column
		grid[0][y] = new Cell(0, y*h, w, h, grid[1][y].getValue());
		next[0][y] = new Cell(0, y*h, w, h, grid[1][y].getValue());

		//setting the rightmost column
		grid[cols - 1][y] = new Cell((cols - 1)*w, y*h, w, h, grid[cols - 2][y].getValue());
		next[cols - 1][y] = new Cell((cols - 1)*w, y*h, w, h, grid[cols - 2][y].getValue());
	}

	//setting the corner cells
	grid[0][0] = new Cell(0, 0, w, h, grid[1][0].getValue());
	next[0][0] = new Cell(0, 0, w, h, grid[1][0].getValue());

	grid[cols - 1][0] = new Cell((cols - 1)*w, 0, w, h, grid[cols - 2][0].getValue());
	next[cols - 1][0] = new Cell((cols - 1)*w, 0, w, h, grid[cols - 2][0].getValue());

	grid[cols - 1][rows - 1] = new Cell((cols - 1)*w, (rows - 1)*h, w, h, grid[cols - 2][rows - 1].getValue());
	next[cols - 1][rows - 1] = new Cell((cols - 1)*w, (rows - 1)*h, w, h, grid[cols - 2][rows - 1].getValue());

	grid[0][rows - 1] = new Cell(0, (rows - 1)*h, w, h, grid[1][rows -1].getValue());
	next[0][rows - 1] = new Cell(0, (rows - 1)*h, w, h, grid[1][rows -1].getValue());

	return grid, next;
}

function animate()
{

	if(!isAnimating)
	{
		btn.textContent = "Stop Animation";
		loop();
		isAnimating = true;
	}
	else
	{
		noLoop();
		btn.textContent = "Start Animation";
		isAnimating = false;
	}
	
}
function changeMethod(){
	if(isNewton){
		methodButton.textContent = "Custom Filter";
		isNewton = false;
	}
	else
	{
		methodButton.textContent = "Newton's law";
		isNewton = true;
	}
}

function start(){

	localStorage.clear();
	grid = [];
	next = [];
	cols = floor(width/w);
	rows = floor(height/h);
	for(var x = 0;x<cols;x++)
	{
		grid[x] = [];
		next[x] = [];
	}

	//setting all the other cells at ambient temperature except few defined to be hot and cold zones
	for(var x = 0; x<cols ;x++)
	{
		for(var y = 0; y < rows; y++)
		{
			grid[x][y] = new Cell(x*w, y*h, w, h, intermediateTemp);
			next[x][y] = new Cell(x*w, y*h, w, h, intermediateTemp);
		}
	}

	//defining hot zones
	grid[1][6].value = 0;
	grid[1][7].value = 0;
	grid[1][8].value = 0;
	grid[7][1].value = 0;
	grid[8][1].value = 0;


	next[1][6].value = 0;
	next[1][7].value = 0;
	next[1][8].value = 0;
	next[7][1].value = 0;
	next[8][1].value = 0;

	//defining cold zones
	grid[8][rows - 2].value = 1;
	grid[9][rows - 2].value = 1;

	next[8][rows - 2].value = 1;
	next[9][rows - 2].value = 1;

}
// Main function
function setup(){
	//setting up the canvas
	p5Canvas = createCanvas(600, 400);
	pixelDensity(1);
	noLoop();

	//initialization
	start();

	absorbing = document.getElementById('absorbing');
	absorbing.addEventListener('click', ()=>{

		dropDownText = document.getElementById('dropdownMenu2');
		dropDownText.textContent = 'Absorbing Boundary';
		//reset
		start();
		grid, next = setAbsorbingBoundary(grid, next, boundaryTemp);
		loop();
		noLoop();

	});

	reflecting = document.getElementById('reflecting');
	reflecting.addEventListener('click', ()=>{
		dropDownText = document.getElementById('dropdownMenu2');
		dropDownText.textContent = 'Reflecting Boundary';
		start();
		grid, next = setReflectingBoundary(grid, next);
		loop();
		noLoop();

	});

	periodic = document.getElementById('periodic');
	periodic.addEventListener('click', ()=>{
		dropDownText = document.getElementById('dropdownMenu2');
		dropDownText.textContent = 'Periodic Boundary';
		start();
		grid, next = setPeriodicBoundary(grid, next);
		loop();
		noLoop();

	});
	// defining boundary
	grid, next = setAbsorbingBoundary(grid, next, boundaryTemp);

	//setting the frame rate
	frameRate(100);

	// creating button to start and stop animation
	btn = document.createElement("button");
	btn.style = "margin-top: 12px; margin-left: 26%;padding: 10px";
	btn.textContent = "Start Animation";
	document.body.appendChild(btn);
	btn.onclick = animate;

	//creating a button to change method
	// methodButton = document.createElement("button");
	// methodButton.style = "margin-top: 12px; margin-left: 10px; padding: 10px";
	// methodButton.textContent = "Newton's law";
	// document.body.appendChild(methodButton);
	// methodButton.onclick = changeMethod;

	//creating a reset button for animation
	var r = createButton("Reset Animation");
	r.mousePressed(resetSketch);
	r.style('margin-top', '12px');
	r.style('padding', '10px');
	r.style('margin-left', '10px');

	//creating download text to notify the user
	downloadText = document.createElement('p');
	downloadText.style = 'font-weight: bold; margin-left: 19%; margin-top:20px';
	downloadText.textContent = "Note: A movie will be downloaded after 300 frames have passed by and chart will be generated. You will be able to open the movie in Google Chrome browser."
	document.body.appendChild(downloadText);


}

function resetSketch(){
	location.reload();
}



function draw(){
	isGreaterThan001 = false;
	if(frameCount === 1) capturer.start();
	background(51);

	if(frameCount !== 1 && isNewton)
	{

			middle.push((1 - next[floor(cols/2)][floor(rows/2)].getValue())*50);
			end.push((1 - next[1][1].getValue())*50);
			if(frameCount>2)
			{
					for(x = 1; x < cols - 1; x++){
						for(y = 1; y < rows - 1; y++){
							if(abs((1 - next[x][y].getValue())*50 - (1 - grid[x][y].getValue())*50)> 0.001){
								isGreaterThan001 = true;
								break;
							}
						}
					if(isGreaterThan001)
						break;
					}

				if(!isGreaterThan001 && !printed){
					for(x = 0; x < cols ; x++){
						for(y = 0; y < rows; y++){
							sum += next[x][y].value;
						}
					}
					alert(`Reached equilibrium at time step ${frameCount} and average temperature is ${(1 - sum/(rows*cols))*50}`);
					printed = true;
				}
			}

			for(x = 0; x < cols ; x++){
				for(y = 0; y < rows; y++){
					grid[x][y].value = next[x][y].value;
				}
			}

				// //defining hot zones
				// grid[1][6].value = 0;
				// grid[1][7].value = 0;
				// grid[1][8].value = 0;
				// grid[7][1].value = 0;
				// grid[8][1].value = 0;


				// next[1][6].value = 0;
				// next[1][7].value = 0;
				// next[1][8].value = 0;
				// next[7][1].value = 0;
				// next[8][1].value = 0;

				// //defining cold zones
				// grid[8][rows - 2].value = 1;
				// grid[9][rows - 2].value = 1;

				// next[8][rows - 2].value = 1;
				// next[9][rows - 2].value = 1;


		for(var x = 1; x<cols - 1;x++)
		{
			for(var y = 1; y < rows - 1; y++){
				N = next[x][y - 1].getValue();
				S = next[x][y + 1].getValue();
				W = next[x-1][y].getValue();
				E = next[x+1][y].getValue();
				NE = next[x + 1][y - 1].getValue();
				NW = next[x - 1][y - 1].getValue();
				SE = next[x + 1][y + 1].getValue();
				SW = next[x - 1][y + 1].getValue();
				value = next[x][y].getValue();
				next[x][y].setValue(calculateNewValueNewtonsLaw(k,value, N, S, E, W, NE, NW, SE, SW, x, y, frameCount));
			}
		}
	}	

	for(var x = 0;x<cols;x++)
	{
		for(var y =0;y<rows;y++)
		{
			next[x][y].show();
		}
	}
	if (capturer) {
	capturer.capture(p5Canvas.canvas);
	}


	if(frameCount=== 300 && printed){
		noLoop();
		btn.textContent="Start Animation";
		capturer.stop();
		localStorage.setItem("middle", JSON.stringify(middle));
		localStorage.setItem("end", JSON.stringify(end));
		localStorage.setItem('boundaryType', JSON.stringify(boundaryType));

		alert('Chart is generated. Click the link at the bottom or wait till equilibrium.');
		chartLink = document.createElement('a');
		chartLink.href = 'chart.html';
		chartLink.innerText = 'Checkout chart';
		chartLink.style='margin-left:26%; '
		document.body.appendChild(chartLink);
		// capturer.save();
	}
	else if(printed){
		noLoop();
		btn.textContent="Start Animation";
		capturer.stop();
		localStorage.setItem("middle", JSON.stringify(middle));
		localStorage.setItem("end", JSON.stringify(end));
		localStorage.setItem('boundaryType', JSON.stringify(boundaryType));

		alert('Chart is generated. Click the link at the bottom or wait till equilibrium.');
		chartLink = document.createElement('a');
		chartLink.href = 'chart.html';
		chartLink.innerText = 'Checkout chart';
		chartLink.style='margin-left:26%; '
		document.body.appendChild(chartLink);
		// capturer.save();
	}
}


function calculateNewValueNewtonsLaw(k, value, N, S, E, W, NE, NW, SE, SW, x, y, frameCount)
{

	if(frameCount<2)
	{
			if((x === 1 && y===6) || (x === 1 && y===7) || (x ===1 && y===8 ) || (x===7 && y===1) || (x===8 && y===1)){
			return 0;
		}
		else if((x === 8 && y===rows - 2) || (x === 9 && y===rows-2)){
			return 1;
		}
	}

	var ans = (1 - 8*k)*value + k*(N + S + E + W + NE + NW + SE + SW);
	return ans;
}

function calculateNewValueUsingFilter(value, N, S, E, W, NE, NW, SE, SW, x, y){

	if((x === 1 && y === 8) || (x === 1 && y === 9) || (x === 1 && y === 10) || (x === 1 && y === 11) || (x === 20 && y === 1) || (x === 21 && y === 1) || (x === 22 && y === 1)){
		return 0;
	}
	if((x === 10 && y === rows - 2) || (x === 11 && y === rows - 2) || (x === 12 && y === rows-2)){
		return 1;
	}
	var ans = 0.25*value + 0.125*(N + E + S + W) + 0.0625*(NE + NW + SE + SW);
	return ans;
}

// function mousePressed(){
// 	redraw();
// }