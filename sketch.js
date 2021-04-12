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
var end = [];

capturer = new CCapture({
    format: "webm",
    framerate: 24,
    name: "movie",
  });
let p5Canvas;

boundaryTemp = 0.6 // (1-boundaryTemp)*50 gives the actual value of temp
intermediateTemp = 0.4 // (1 - intermediateTemp)*50 gives actual value
w = 20; //width of each cell
h = 20; //height of each cell
k = 0.03 //diffusion rate or thermal diffusivity


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
	for(var x = 1; x<cols - 1;x++)
	{
		for(var y = 1; y < rows - 1; y++)
		{
			grid[x][y] = new Cell(x*w, y*h, w, h, intermediateTemp);
			next[x][y] = new Cell(x*w, y*h, w, h, intermediateTemp);
		}
	}

	//defining hot zones
	grid[1][8].value = 0;
	grid[1][9].value = 0;
	grid[1][10].value = 0;
	grid[1][11].value = 0;
	grid[20][1].value = 0;
	grid[21][1].value = 0;
	grid[22][1].value = 0;


	next[1][8].value = 0;
	next[1][9].value = 0;
	next[1][10].value = 0;
	next[1][11].value = 0;
	next[20][1].value = 0;
	next[21][1].value = 0;
	next[22][1].value = 0;


	//defining cold zones
	grid[10][rows-2].value = 1;
	grid[11][rows-2].value = 1;
	grid[12][rows-2].value = 1;

	next[10][rows-2].value = 1;
	next[11][rows-2].value = 1;
	next[12][rows-2].value = 1;

}
// Main function
function setup(){
	//setting up the canvas
	p5Canvas = createCanvas(600, 400);
	pixelDensity(1);
	noLoop();

	//initialization
	start();

	//defining boundary 
	grid, next = setAbsorbingBoundary(grid, next, boundaryTemp);

	//setting the frame rate
	frameRate(24);

	// creating button to start and stop animation
	btn = document.createElement("button");
	btn.style = "margin-top: 20px; margin-left: 26%;padding: 10px";
	btn.textContent = "Start Animation";
	document.body.appendChild(btn);
	btn.onclick = animate;

	//creating a button to change method
	methodButton = document.createElement("button");
	methodButton.style = "margin-top: 20px; margin-left: 10px; padding: 10px";
	methodButton.textContent = "Newton's law";
	document.body.appendChild(methodButton);
	methodButton.onclick = changeMethod;

	//creating a reset button for animation
	var r = createButton("Reset Animation");
	r.mousePressed(resetSketch);
	r.style('margin-top', '20px');
	r.style('padding', '10px');
	r.style('margin-left', '10px');

	//creating download text to notify the user
	downloadText = document.createElement('p');
	downloadText.style = 'font-weight: bold; margin-left: 19%; margin-top:35px';
	downloadText.textContent = "Note: A movie will be downloaded after 300 frames have passed by and chart will be generated. You will be able to open the movie in Google Chrome browser."
	document.body.appendChild(downloadText);


}

function resetSketch(){
	location.reload();
}



function draw(){
	if(frameCount === 1) capturer.start();
	background(51);

	if(frameCount !== 1 && isNewton)
	{
			middle.push((1 - next[cols/2][rows/2].getValue())*50);
			end.push((1 - next[1][1].getValue())*50);
			//applying constant hot zone
			next[1][8].value = 0;
			next[1][9].value = 0;
			next[1][10].value = 0;
			next[1][11].value = 0;
			next[20][1].value = 0;
			next[21][1].value = 0;
			next[22][1].value = 0;

			//applying constant cold zone
			next[10][rows-2].value = 1;
			next[11][rows-2].value = 1;
			next[12][rows-2].value = 1;

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
				next[x][y].setValue(calculateNewValueNewtonsLaw(k,value, N, S, E, W, NE, NW, SE, SW));
			}
		}
	}	

	else if(frameCount !== 1 && !isNewton)
	{
			middle.push((1 - next[cols/2][rows/2].getValue())*50);
			end.push((1 - next[1][1].getValue())*50);
			//applying constant heat
			next[1][8].value = 0;
			next[1][9].value = 0;
			next[1][10].value = 0;
			next[1][11].value = 0;
			next[20][1].value = 0;
			next[21][1].value = 0;
			next[22][1].value = 0;

			//applying constant cold zone
			next[10][rows-2].value = 1;
			next[11][rows-2].value = 1;
			next[12][rows-2].value = 1;
		prev = next[cols/2][rows/2].getValue();
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
				next[x][y].setValue(calculateNewValueUsingFilter(value, N, S, E, W, NE, NW, SE, SW));
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
	if(frameCount=== 300){
		noLoop();
		btn.textContent="Start Animation";
		capturer.stop();
		localStorage.setItem("middle", JSON.stringify(middle));
		localStorage.setItem("end", JSON.stringify(end));
		localStorage.setItem('boundaryType', JSON.stringify(boundaryType));

		chartLink = document.createElement('a');
		chartLink.href = 'chart.html';
		chartLink.innerText = 'Checkout chart';
		chartLink.style='margin-left:26%; '
		document.body.appendChild(chartLink);
		// capturer.save();
	}
	if(frameCount> 300){
		resetSketch();
	}
}


function calculateNewValueNewtonsLaw(k, value, N, S, E, W, NE, NW, SE, SW)
{
	var ans = (1 - 8*k)*value + k*(N + S + E + W + NE + NW + SE + SW);
	return ans;
}

function calculateNewValueUsingFilter(value, N, S, E, W, NE, NW, SE, SW){

	var ans = 0.25*value + 0.125*(N + E + S + W) + 0.0625*(NE + NW + SE + SW);
	return ans;
}

// function mousePressed(){
// 	redraw();
// }