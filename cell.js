function Cell(x, y, w, h, value){
	this.value = value;
	this.x = x;
	this.y = y;
	this.w = w;
	this.h = h;
}

Cell.prototype.show = function (){
	// stroke(0);
	noStroke();
	fill(255*(1 - this.value), 0, 255*(this.value));
	rect(this.x, this.y, this.w, this.h);
}
Cell.prototype.setValue = function(newValue){
	this.value = newValue;
}
Cell.prototype.getValue = function(){
	return this.value;
}

