var n = null;
var k = null;
var t = null;
var localKnots = new Array();
// TODO: implement your bspline code here
// n : number of points
// k : degree + 1
// t : parameter for the curve [0, n - k + 2]
function BSpline(_n, _k, _t, nodes, knotes, showConst, ctx) {
    n = _n;
    k = _k;
    t = _t;
    
    localKnots = knotes;
    var x = 0;
    var y = 0;
    var lim = n;

    for(var i = 0; i < lim; i++) {
        var base = getBase(i, k);
        x += nodes[i].x * base;
        y += nodes[i].y * base;
    }
    if(showConst) {
        var curKnot = new Node(x, y);
        setColors(ctx,'rgb(0,255,0)','green');
        curKnot.draw(ctx);
    }
    return [x, y];
}


function getBase(i, k) {
    if(k ==  1) {
        if(knotT(i) <= t && t < knotT(i + 1) &&
           knotT(i) < knotT(i + 1)) {
            return 1;
        }else {
            return 0;
        }
    } else{
        var fstPartNumerator = (t - knotT(i));
        var fstPartDenumerator = (knotT(i + k - 1 ) - knotT(i));
        if(fstPartDenumerator == 0) {
            var fstPart = 0;
        } else {
            var fstPart = (fstPartNumerator * getBase(i, k - 1)) / fstPartDenumerator;
        }
        var scdPartNumerator = (knotT(i + k) - t) ;
        var scdPartDenumerator = (knotT(i + k) - knotT(i + 1));
        if(scdPartDenumerator == 0) {
            var scdPart = 0;
        } else {
            var scdPart = (scdPartNumerator * getBase(i + 1, k - 1)) / scdPartDenumerator;
        }
        return fstPart + scdPart;
    }
    
}

function knotT(j) {
    var result = 0;
    
    result = localKnots[j].value;
    return result;
}

function deBoor(x, degree, nodes, ctx, draw) {
    //calculate the index of the interval in witch x lies
    // problem part maybe
    var l = 0;
    for(var i = degree; i < localKnots.length; i++) {
        if(x >= localKnots[i].value && x < localKnots[i + 1].value) {
            l = i;
            break;
        }
    }
    //copy the intersiting points
    var d = new Array();
    
    for(var i = l - (degree); i <= l; i++){
        d[i] = nodes[i];
        setColors(ctx,'rgb(0,0,255)','blue');
        d[i].draw(ctx);
    }
    for(var _k = 1; _k <= degree; _k++) {
        var dkiPrev = null;
        for(var i = l - (degree) + _k; i <= l; i++) {
            var dkiNext = getD(x, _k, i, d, degree);
            if(draw) {
                setColors(ctx,'rgb(255,0,0)','red');
                dkiNext.draw(ctx);
            }
            if(dkiPrev != null) {
                if(draw) {
                    drawLine(ctx, dkiPrev.x, dkiPrev.y, dkiNext.x, dkiNext.y);
                }
            }
            dkiPrev = dkiNext;
        }
    }
    return [dkiNext.x, dkiNext.y];
    
}


function getD(x, k, i, d, deg) {
    if(k == 0) {
        return d[i];
    }
    var alpha = getAlpha(x, k, i, deg) ;
    var d1 = getD(x, k - 1, i - 1, d, deg);
    var d2 = getD(x, k - 1, i, d, deg);
    
    var x = (1 - alpha) * d1.x + alpha * d2.x;
    var y = (1 - alpha) * d1.y + alpha * d2.y;
    
    var curNode = new Node(x, y);
    
    return curNode;
}

function getAlpha(x, k, i, deg) {
    var num = x - localKnots[i].value;
    var denum = localKnots[i + deg + 1 - k].value - localKnots[i].value
    return num / denum;
}
