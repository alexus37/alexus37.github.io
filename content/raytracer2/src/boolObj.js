function BoolObj() {}
BoolObj.prototype = {
    setElements: function(sphere1, sphere2, mode) {
        this.s1 = sphere1; // main obj for sphere
        this.s2 = sphere2;
        this.mode = mode; // intersect
        this.eps = 0.0000001;
        return this;
    },
    // Returns a copy of the triangle
    dup: function() {
        return BoolObj.create(this.s1,this.s2,this.mode);
    },
    getMode: function(){
        return this.mode;  
    },
    getSphere1: function(){
        return this.s1;
    },
    getSphere2: function(){
        return this.s2;
    },
    
    intersect: function(ray){

        
        //both spheres were hit
        if (this.mode == 0) {
            var res1 = this.s1.intersect(ray);
            var res2 = this.s2.intersect(ray);
            if(res1[3] && res2[3]) {
                //check witch hitpoint to use or both??
                var hitpoint = ray.getOrigin().add(ray.getDirection().multiply(res1[2]));
                var implictS1 =  Math.pow(hitpoint.e(1) - this.s1.getCenter().e(1), 2) + Math.pow(hitpoint.e(2) - this.s1.getCenter().e(2), 2) + Math.pow(hitpoint.e(3) - this.s1.getCenter().e(3), 2) - Math.pow(this.s1.getRadius(), 2);
                var implictS2 =  Math.pow(hitpoint.e(1) - this.s2.getCenter().e(1), 2) + Math.pow(hitpoint.e(2) - this.s2.getCenter().e(2), 2) + Math.pow(hitpoint.e(3) - this.s2.getCenter().e(3), 2) - Math.pow(this.s2.getRadius(), 2);
                var intersectVal = Math.max(implictS1, implictS2);
                //cehck if implict is zero
                if (intersectVal < this.eps && - this.eps < intersectVal) {
                    return [this.s1, res1[2], true, true];
                }
                //check witch hitpoint to use or both??
                var hitpoint = ray.getOrigin().add(ray.getDirection().multiply(res2[2]));
                var implictS1 =  Math.pow(hitpoint.e(1) - this.s1.getCenter().e(1), 2) + Math.pow(hitpoint.e(2) - this.s1.getCenter().e(2), 2) + Math.pow(hitpoint.e(3) - this.s1.getCenter().e(3), 2) - Math.pow(this.s1.getRadius(), 2);
                var implictS2 =  Math.pow(hitpoint.e(1) - this.s2.getCenter().e(1), 2) + Math.pow(hitpoint.e(2) - this.s2.getCenter().e(2), 2) + Math.pow(hitpoint.e(3) - this.s2.getCenter().e(3), 2) - Math.pow(this.s2.getRadius(), 2);
                var intersectVal = Math.max(implictS1, implictS2);
                //cehck if implict is zero
                if (intersectVal < this.eps && - this.eps < intersectVal) {
                    return [this.s2, res2[2], true, true];
                }
            }
        } else if(this.mode == 1) {
            var res1 = this.s1.intersect(ray); // check if ray hits the outer sphere
            if(res1[3]) {
                var hitpoint = ray.getOrigin().add(ray.getDirection().multiply(res1[2]));
                //cehck condition x >= z
                if (hitpoint.e(1) >= hitpoint.e(3)) {
                    // the outter surface was hitten
                    return [this.s1, res1[2], true, true];
                } else {
                    var newRayOrig = hitpoint.add(ray.getDirection().multiply(this.eps));
                    var insideRay = $R(newRayOrig, ray.getDirection());
                    var res2 = this.s1.intersect(insideRay);
                    if(res2[3]){
                        var hitpoint = insideRay.getOrigin().add(insideRay.getDirection().multiply(res2[2]));
                        if (hitpoint.e(1) >= hitpoint.e(3)) {
                            // the outter surface was hitten
                            return [this.s2, res1[2] + res2[2], true, false];
                        }
                    }
                }
            }
            
        }
        return [null, null, false, false];
    }
    
};
  
// Constructor function
BoolObj.create = function(s1,s2,m) {
    var BO = new BoolObj();
    return BO.setElements(s1, s2, m);
};

// Utility functions
var $BO = BoolObj.create;

