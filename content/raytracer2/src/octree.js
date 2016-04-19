function Octree() {}
Octree.prototype = {
    
    init: function() {
        this.isLeaf = true;
        this.haveData = false,
        this.childern = new Array(8);
        this.data = $B(this.origin, this.end);
        this.halfDim = this.end.subtract(this.origin)
        this.halfDim.multiplyN(0.5);
    },
    setDepth: function(d) {
        this.BoderDepth = d;
        return this;
    },
    setOrigin: function(vector){
        this.origin = vector;
        return this;
    },
    getData: function() {
        return this.data;  
    },
    setEnd: function(vector){
        this.end = vector;
        return this;
    },
    insertSphere: function(sphere) {
        var result = this.insertSph(sphere);
        var resStack = new Array();
        if(result != null) {
            resStack.push(result);
        }
        // curent node is not a leaf
        while (resStack.length > 0) {
            result = resStack.pop();
            for(var i = 0; i < result.length; i++) {
                var tempRes = result[i].insertSph(sphere);
                if(tempRes != null) {
                    resStack.push(tempRes);
                }
            }
        }
    },
    insertTriangle: function(Triangle) {
        var result = this.insertTri(Triangle);
        var resStack = new Array();
        if(result != null) {
            resStack.push(result);
        }
        // curent node is not a leaf
        while (resStack.length > 0) {
            result = resStack.pop();
            for(var i = 0; i < result.length; i++) {
                var tempRes = result[i].insertTri(Triangle);
                if(tempRes != null) {
                    resStack.push(tempRes);
                }
            }
        }
    },
    
    // insert a Triangle in a octree
    insertTri: function(Triangle) {
        // check if the node is a leaf
        if(this.isLeaf) {
            // check if the node has data
            if(!this.haveData) {
                this.haveData = true;
                this.data.addElement(Triangle);
                return;
            } else {
                // there allready exists data
                if (this.BoderDepth == 0) {
                    // the limit is reached
                    this.data.addElement(Triangle);
                } else {
                    //split the bounding box
                    this.split();
                    this.isLeaf = false;
                    this.haveData = false;
                    
                    // reinsert the old data
                    for(var i= 0; i < this.data.getNumberElements(); i++) {
                        var curTriangle = this.data.getElement(i);
                        for( var j = 0; j < 8; j++) {
                            if(this.childern[j].data.touchByTri(curTriangle)) {
                                this.childern[j].insertTriangle(Triangle);
                            }
                        }
                    }
                }
                this.data.resetMem();
            }
        } else {
            // the current node is no leaf
            
            var BBoxes = new Array(); 
            var hits = 0;
            //check childern for optimal kanidates
            for(var i = 0; i < 8; i++) {
                if (this.childern[i].data.touchByTri(Triangle)) {
                    BBoxes[hits] = this.childern[i];
                    hits++;
                }
            }
            
            //return all boundingbox which have contact with the triangle
            return BBoxes;
        }
        return null;
    },
    
    // insert a sphere in a octree
    insertSph: function(Sphere) {
        // check if the node is a leaf
        if(this.isLeaf) {
            // check if the node has data
            if(!this.haveData) {
                this.haveData = true;
                this.data.addElement(Sphere);
                return null;
            } else {
                // there allready exists data
                if (this.BoderDepth == 0) {
                    // the limit is reached
                    this.data.addElement(Sphere);
                } else {
                    //split the bounding box
                    this.split();
                    this.isLeaf = false;
                    this.haveData = false;
                    this.data.addElement(Sphere);
                    // reinsert the old data
                    for(var i= 0; i < this.data.getNumberElements(); i++) {
                        var curSphere = this.data.getElement(i);
                        for( var j = 0; j < 8; j++) {
                            if(this.childern[j].data.touchBySphere(curSphere)) {
                                this.childern[j].insertSphere(curSphere);
                            }
                        }
                    }
                    this.data.resetMem();
                }
            }
        } else {
            // the current node is no leaf
            var BBoxes = new Array(); 
            var hits = 0;
            //check childern for optimal kanidates
            for(var i = 0; i < 8; i++) {
                if (this.childern[i].data.touchBySphere(Sphere)) {
                    BBoxes[hits] = this.childern[i];
                    hits++;
                }
            }
            
            //return all boundingbox which have contact with the triangle
            return BBoxes;
        }
        return null;
    },
    
    print: function(){
        var childerenStack = new Array();
        childerenStack.push(this);
        while(childerenStack.length > 0) {
            var curOct = childerenStack.pop();
            if (curOct.isLeaf) {
                if(curOct.haveData) {
                    console.log("Data found " + curOct.data.getNumberElements() + " Elements in depth " + curOct.BoderDepth);
                }
            } else {
                for(var i = 0; i < 8; i++) {
                    childerenStack.push(curOct.childern[i]);
                }
            }
        }
    },

    split: function() {
        //base childeren 
        this.childern[0] = $O(this.origin, this.origin.add(this.halfDim),this.BoderDepth - 1);
        
        var x = this.origin.e(1) + (this.end.e(1) - this.origin.e(1)) * 0.5;
        var y = this.origin.e(2);
        var z = this.origin.e(3);
        var newOrigin = $V(x, y, z);
        this.childern[1] = $O(newOrigin, newOrigin.add(this.halfDim),this.BoderDepth - 1);
        
        var x = this.origin.e(1) + (this.end.e(1) - this.origin.e(1)) * 0.5;
        var y = this.origin.e(2);
        var z = this.origin.e(3) + (this.end.e(3) - this.origin.e(3)) * 0.5;
        var newOrigin = $V(x, y, z);
        this.childern[2] = $O(newOrigin, newOrigin.add(this.halfDim),this.BoderDepth - 1);
        
        var x = this.origin.e(1);
        var y = this.origin.e(2);
        var z = this.origin.e(3) + (this.end.e(3) - this.origin.e(3)) * 0.5;
        var newOrigin = $V(x, y, z);
        this.childern[3] = $O(newOrigin, newOrigin.add(this.halfDim),this.BoderDepth - 1);
        //cap childeren
        
        var x = this.origin.e(1);
        var y = this.origin.e(2) + (this.end.e(2) - this.origin.e(2)) * 0.5;
        var z = this.origin.e(3);
        var newOrigin = $V(x, y, z);
        this.childern[4] = $O(newOrigin, newOrigin.add(this.halfDim),this.BoderDepth - 1);
        
        var x = this.origin.e(1) + (this.end.e(1) - this.origin.e(1)) * 0.5;
        var y = this.origin.e(2) + (this.end.e(2) - this.origin.e(2)) * 0.5;
        var z = this.origin.e(3);
        var newOrigin = $V(x, y, z);
        this.childern[5] = $O(newOrigin, newOrigin.add(this.halfDim),this.BoderDepth - 1);
        
        var x = this.origin.e(1) + (this.end.e(1) - this.origin.e(1)) * 0.5;
        var y = this.origin.e(2) + (this.end.e(2) - this.origin.e(2)) * 0.5;
        var z = this.origin.e(3) + (this.end.e(3) - this.origin.e(3)) * 0.5;
        var newOrigin = $V(x, y, z);
        this.childern[6] = $O(newOrigin, newOrigin.add(this.halfDim),this.BoderDepth - 1);
        
        var x = this.origin.e(1);
        var y = this.origin.e(2) + (this.end.e(2) - this.origin.e(2)) * 0.5;
        var z = this.origin.e(3) + (this.end.e(3) - this.origin.e(3)) * 0.5;
        var newOrigin = $V(x, y, z);
        this.childern[7] = $O(newOrigin, newOrigin.add(this.halfDim),this.BoderDepth - 1);
    },
    
    intersectRay: function(ray) {
        // get all touched bboxes which are leafs
        var hitBBoxes = new Array();
        var hitBBoxes = this.getHitBBoxes(ray);
        var curMinDist = Number.MAX_VALUE;
        var nearesteElement;
        var hit = false;
        // iterated over all boxes
        for (var i = 0; i < hitBBoxes.length; i++){
            var curData = hitBBoxes[i].getData();
            var cntElm = curData.getNumberElements();
            // iterade over all elements in a box
            for(var j = 0; j < cntElm; j++) {
                var curElement = curData.getElement(j);
                var bool = true;
                if(curElement instanceof Sphere) {
                    bool = curElement.hits(ray);
                }
                if(bool) {
                    var curResult = curElement.intersect(ray);
                    // check for intersection
                    if(curResult[3]) {
                        hit = true;
                        if(curResult[2] < curMinDist) {
                            nearesteElement = curElement;
                            curMinDist = curResult[2];
                        }
                    }
                }
            }
        }
        if(hit) {
            var hitPoint = ray.getOrigin().add(ray.getDirection().multiply(curMinDist));
            return [hit, hitPoint, nearesteElement];
        }
        return [hit, null, null];
    },
    // check if a the octree is hti by a ray. if the octree is a leaf insert it, else check the childeren
    getHitBBoxes: function(ray) {
        var result = new Array();
        var octStack = new Array();
        if(this.data.intersectRay(ray)){
            octStack.push(this);
            while(octStack.length > 0) {
                var curOct = octStack.pop();
                if(curOct.isLeaf) {
                    if(curOct.haveData) {
                        result.push(curOct);
                    }
                } else {
                    for (var i = 0; i < 8; i++) {
                        octStack.push(curOct.childern[i]);
                    }
                }
            }
        }
        return result;
    },
    
    // Returns a copy of the sphere
    dup: function() {
        return Octree.create(this.min,this.max, this.BoderDepth);
    }
};
  
// Constructor function
Octree.create = function(min, max, depth) {
    var O = new Octree();
    O.setOrigin(min);
    O.setEnd(max);
    O.setDepth(depth);
    O.init(); 
    return O;
};

// Utility functions
var $O = Octree.create;

