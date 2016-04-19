function BBox() {}
BBox.prototype = {
    
    init: function() {
        this.elements = new Array();
    },
    addElement: function(e) {
        this.elements[this.elements.length] = e;
    },
    getNumberElements: function() {
        return this.elements.length;
    },
    resetMem: function() {
      this.elements = [];  
    },
    // Smits’ method with out interval
    intersectRay: function(ray){
        var result = false;
        var localMin = $V(Math.min(this.min.e(1), this.max.e(1)), Math.min(this.min.e(2), this.max.e(2)), Math.min(this.min.e(3), this.max.e(3)));
        var localMax = $V(Math.min(this.max.e(1), this.max.e(1)), Math.max(this.min.e(2), this.max.e(2)), Math.max(this.min.e(3), this.max.e(3)));
        var tmin;
        var tmax;
        // x value
        if (ray.getDirection().e(1) >= 0) {
            tmin = (localMin.e(1) - ray.getDirection().e(1)) / ray.getDirection().e(1);
            tmax = (localMax.e(1) - ray.getDirection().e(1)) / ray.getDirection().e(1);
        } else {
            tmin = (localMax.e(1) - ray.getDirection().e(1)) / ray.getDirection().e(1);
            tmax = (localMin.e(1) - ray.getDirection().e(1)) / ray.getDirection().e(1);
        }
        var tymin;
        var tymax;
        // y value
        if (ray.getDirection().e(2) >= 0) {
            tymin = (localMin.e(2) - ray.getDirection().e(2)) / ray.getDirection().e(2);
            tymax = (localMax.e(2) - ray.getDirection().e(2)) / ray.getDirection().e(2);
        } else {
            tymin = (localMax.e(2) - ray.getDirection().e(2)) / ray.getDirection().e(2);
            tymax = (localMin.e(2) - ray.getDirection().e(2)) / ray.getDirection().e(2);
        }
        
        if ((tmin > tymax) || (tymin > tmax)) {
            return result;
        }

        if (tymin > tmin) {
            tmin = tymin;
        }
            
        if (tymax < tmax){
            tmax = tymax;
        }
        
        var tzmin;
        var tzmax;
        // z value
        if (ray.getDirection().e(3) >= 0) {
            tzmin = (localMin.e(3) - ray.getDirection().e(3)) / ray.getDirection().e(3);
            tzmax = (localMax.e(3) - ray.getDirection().e(3)) / ray.getDirection().e(3);
        } else {
            tzmin = (localMax.e(3) - ray.getDirection().e(3)) / ray.getDirection().e(3);
            tzmax = (localMin.e(3) - ray.getDirection().e(3)) / ray.getDirection().e(3);
        }
        if ( (tmin > tzmax) || (tzmin > tmax) ) {
            return result;
        }
        result = true;
        
        return result;
        
    },
    
    touchBySphere: function(sphere) {
        var dmin = 0;
        
        var localMin = $V(Math.min(this.min.e(1), this.max.e(1)), Math.min(this.min.e(2), this.max.e(2)), Math.min(this.min.e(3), this.max.e(3)));
        var localMax = $V(Math.min(this.max.e(1), this.max.e(1)), Math.max(this.min.e(2), this.max.e(2)), Math.max(this.min.e(3), this.max.e(3)));

        var center = sphere.getCenter();
        for (var i = 1;i < 4; i++) {
             if (center.e(i) < localMin.e(i)) {
                dmin += Math.pow(center.e(i) - localMin.e(i), 2);
            } else if (center.e(i) > localMax.e(i)) {
                dmin += Math.pow(center.e(i) - localMax.e(i), 2);
            }
        } 

        return dmin <= Math.pow(sphere.getRadius(), 2);

    },
    
    touchByTri: function(triangle){
        var p0 = triangle.e(0);
        var p1 = triangle.e(1);
        var p2 = triangle.e(2);
        var p0Inside = false;
        var p1Inside = false;
        var p2Inside = false;
        // check whitch points are in th bbox
        if(p0.e(1) >= this.min.e(1) && p0.e(2) >= this.min.e(2) && p0.e(3) >= this.min.e(3) &&
           p0.e(1) <= this.max.e(1) && p0.e(2) <= this.max.e(2) && p0.e(3) <= this.max.e(3)) {
            p0Inside = true;
        }
        if(p1.e(1) >= this.min.e(1) && p1.e(2) >= this.min.e(2) && p1.e(3) >= this.min.e(3) &&
           p1.e(1) <= this.max.e(1) && p1.e(2) <= this.max.e(2) && p1.e(3) <= this.max.e(3)) {
            p1Inside = true;
        }
        if(p2.e(1) >= this.min.e(1) && p2.e(2) >= this.min.e(2) && p2.e(3) >= this.min.e(3) &&
           p2.e(1) <= this.max.e(1) && p2.e(2) <= this.max.e(2) && p2.e(3) <= this.max.e(3)) {
            p2Inside = true;
        }
        // point is inside the box, so the triangle touches the box
        if(p0Inside || p1Inside || p2Inside) {
            return true;
        } else {
            //check diagonal
            var baseP1 = this.min;
            var baseP2 = $V(this.max.e(1), this.min.e(2), this.min.e(3));
            var baseP3 = $V(this.max.e(1), this.min.e(2), this.max.e(3));
            var baseP4 = $V(this.min.e(1), this.min.e(2), this.max.e(3));
            
            var capP1 = $V(this.min.e(1), this.max.e(2), this.min.e(3));
            var capP2 = $V(this.max.e(1), this.max.e(2), this.min.e(3));
            var capP3 = this.max;
            var capP4 = $V(this.min.e(1), this.max.e(2), this.max.e(3));
            //create ray for the diagonals
            var ray = $R(baseP1, capP3.subtract(baseP1));
            var result = triangle.intersect(ray);
            if(result[3] && result[2] <= 1.0) {
                return true;
            }
            var ray = $R(baseP3, capP1.subtract(baseP3));
            var result = triangle.intersect(ray);
            if(result[3] && result[2] <= 1.0) {
                return true;
            }
            var ray = $R(baseP2, capP4.subtract(baseP2));
            var result = triangle.intersect(ray);
            if(result[3] && result[2] <= 1.0) {
                return true;
            }
            var ray = $R(baseP4, capP2.subtract(baseP4));
            var result = triangle.intersect(ray);
            if(result[3] && result[2] <= 1.0) {
                return true;
            }
            //check all 12 square edges
            var ray = $R(baseP1, baseP2.subtract(baseP1));
            var result = triangle.intersect(ray);
            if(result[3] && result[2] <= 1.0) {
                return true;
            }
            var ray = $R(baseP2, baseP3.subtract(baseP2));
            var result = triangle.intersect(ray);
            if(result[3] && result[2] <= 1.0) {
                return true;
            }
            var ray = $R(baseP3, baseP4.subtract(baseP3));
            var result = triangle.intersect(ray);
            if(result[3] && result[2] <= 1.0) {
                return true;
            }
            var ray = $R(baseP4, baseP1.subtract(baseP4));
            var result = triangle.intersect(ray);
            if(result[3] && result[2] <= 1.0) {
                return true;
            }
            var ray = $R(baseP1, capP1.subtract(baseP1));
            var result = triangle.intersect(ray);
            if(result[3] && result[2] <= 1.0) {
                return true;
            }
            var ray = $R(baseP2, capP2.subtract(baseP2));
            var result = triangle.intersect(ray);
            if(result[3] && result[2] <= 1.0) {
                return true;
            }
            var ray = $R(baseP3, capP3.subtract(baseP3));
            var result = triangle.intersect(ray);
            if(result[3] && result[2] <= 1.0) {
                return true;
            }
            var ray = $R(baseP4, capP4.subtract(baseP4));
            var result = triangle.intersect(ray);
            if(result[3] && result[2] <= 1.0) {
                return true;
            }
             var ray = $R(capP1, capP2.subtract(capP1));
            var result = triangle.intersect(ray);
            if(result[3] && result[2] <= 1.0) {
                return true;
            }
            var ray = $R(capP2, capP3.subtract(capP2));
            var result = triangle.intersect(ray);
            if(result[3] && result[2] <= 1.0) {
                return true;
            }
            var ray = $R(capP3, capP4.subtract(capP3));
            var result = triangle.intersect(ray);
            if(result[3] && result[2] <= 1.0) {
                return true;
            }
            var ray = $R(capP4, capP1.subtract(capP4));
            var result = triangle.intersect(ray);
            if(result[3] && result[2] <= 1.0) {
                return true;
            }
            return false;
        }
        
    },
    
    getElement: function(index) {
        if(index < this.elements.length) {
            return this.elements[index];
        } 
    },
    setMin: function(vector) {
        this.min = vector;
	   return this;
    },
  
  
    setMax: function(vector) {
        this.max = vector;
        return this;
    },
  
  
    getMax: function() {
        return this.max;
    }, 

    getMin: function() {
        return this.min;
    },

    // Returns a copy of the sphere
    dup: function() {
        return BBox.create(this.min,this.max);
    }

};
  
// Constructor function
BBox.create = function(min, max) {
    var B = new BBox();
    B.init();
    B.setMin(min);
    B.setMax(max);
    return B;
};

// Utility functions
var $B = BBox.create;

