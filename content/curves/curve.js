
showConstruction = false;
showNodeConnections = true;

var Curve = function() {
	this.timeKnot = new Knot(0,0,true);
	this.knots = new Array();
	this.nodes = new Array();
};

Curve.prototype.draw = function(ctx)
{
    if (showNodeConnections) {
		// Connect nodes with a line
        setColors(ctx,'rgb(10,70,160)');
        for (var i = 1; i < this.nodes.length; i++) {
            drawLine(ctx, this.nodes[i-1].x, this.nodes[i-1].y, this.nodes[i].x, this.nodes[i].y);
        }
		// Draw nodes
		setColors(ctx,'rgb(10,70,160)','white');
		for (var i = 0; i < this.nodes.length; i++) {
			this.nodes[i].draw(ctx);
		}
    }

	ctx.lineWidth = 2;
    setColors(ctx,'black');
    
	// TODO: Draw the curve
    // you can use: drawLine(ctx, x1, y1, x2, y2);
    var steps = 100 * this.nodes.length;
    // degree of the polynom
    var k = 3;
    var  bDB = false;   
    if(this.nodes.length >= k) {
        // begin and end of the current part of the curve 
        var curBeginX = null;
        var curBeginY = null;
        var curEndX = null; 
        var curEndY = null;
        var dbcurBeginX = null;
        var dbcurBeginY = null;
        var dbcurEndX = null; 
        var dbcurEndY = null;
        // get min and max for the t intervall
        var min = this.knots[k].value;
        var max = this.knots[this.nodes.length].value;
        // calc the first point
        var curPt = BSpline(this.nodes.length, k + 1, min, this.nodes, this.knots, false, ctx);
        curBeginX = curPt[0];
        curBeginY = curPt[1];
        if (this.nodes.length >= 4 && bDB) {
            var dbcurPt = deBoor(min, k, this.nodes, ctx, false);
            dbcurEndX = dbcurPt[0];
            dbcurEndY = dbcurPt[1];
        }
        // get the step length for uniform steps in the interval
        var stepLength = (max - min) / steps;
        for(var i = 0; i < steps; i++) {

            var factor =  min + stepLength * i;

            var curPt = BSpline(this.nodes.length, k + 1, factor, this.nodes, this.knots);
            curEndX = curPt[0];
            curEndY = curPt[1];
            // draw the line
            setColors(ctx,'black');
            drawLine(ctx, curBeginX, curBeginY, curEndX, curEndY);
            // set the new beginning 
            curBeginX = curEndX;
            curBeginY = curEndY;
            if (this.nodes.length >= 4 && bDB) {
                var dbcurPt = deBoor(factor, k, this.nodes, ctx, false);
                dbcurEndX = dbcurPt[0];
                dbcurEndY = dbcurPt[1];
                // draw the line
                setColors(ctx,'green');
                drawLine(ctx, dbcurBeginX, dbcurBeginY, dbcurEndX, dbcurEndY);
                // set the new beginning 
                dbcurBeginX = dbcurEndX;
                dbcurBeginY = dbcurEndY;
            }
        }

    }
    
	ctx.lineWidth = 1;

    if (this.nodes.length >= 4) {
		// TODO: Show how the curve is constructed
		// you can use: drawLine(ctx, x1, y1, x2, y2);
		// you can use: drawCircle(ctx, x, y, radius);
        


        // De Boor construction
        if (showConstruction) {
            if(this.timeKnot.value < min) {
                BSpline(this.nodes.length, 4, min, this.nodes, this.knots, true, ctx);
            } else if (this.timeKnot.value > max) {
                BSpline(this.nodes.length, 4, max, this.nodes, this.knots, true, ctx);
            } else {
                deBoor(this.timeKnot.value, k, this.nodes, ctx, true);
                BSpline(this.nodes.length, 4, this.timeKnot.value, this.nodes, this.knots, true, ctx);
            }
            
        }

    }
}

Curve.prototype.addNode = function(x,y)
{
    this.nodes.push(new Node(x,y));
	if (this.knots.length == 0) {
        this.knots.push(new Knot(0,0,false));
        this.knots.push(new Knot(1,1,false));
        this.knots.push(new Knot(2,2,false));
        this.knots.push(new Knot(3,3,false));
        this.knots.push(new Knot(4,4,false));
    } else {
        this.knots.push(new Knot(this.knots[this.knots.length-1].value+1,this.knots.length,false));
    }
}


