function Sphere() {}
Sphere.prototype = {

  setCenter: function(vector) {
    this.center = vector;
	return this;
  },
  
  
  setRadius: function(r) {
    this.radius = r;
	return this;
  },
  setTexture: function(tga) {
      this.tga = tga;
      return this;
  },
  getTexture: function() {
      return this.tga;
  },
  
  setDiffuseMaterialColors: function(colorVec) {
	this.DiffMatColor = colorVec;
	return this;
  },
    
  setAmbientMaterialColors: function(colorVec) {
	this.AmbientMatColor = colorVec;
	return this;
  },

  setSpecularMaterialColors: function(colorVec) {
	this.SpecularMatColor = colorVec;
	return this;
  },
    
  setSpecularExponent: function(exp) {
	this.SpecularExponent = exp;
	return this;
  },
  setRefractionIndex: function(index) {
	this.RefractionIndex = index;
	return this;
  },
  getRefractionIndex: function() {
	return this.RefractionIndex;
  },
  getSpecularMaterialColors: function() {
	return this.SpecularMatColor;
  },
    
  getSpecularExponent: function() {
	return this.SpecularExponent;
  },
  getAmbientMaterialColors: function() {
	return this.AmbientMatColor;
  },
  
  getDiffuseMaterialColors: function() {
	return this.DiffMatColor;
  },
  
  getCenter: function() {
	return this.center;
  }, 
  getNormal: function(hitPoint) {

        // the hit point coordinates
        var x = hitPoint.e(1);
        var y = hitPoint.e(2);
        var z = hitPoint.e(3);

        // get the spherecenter coordinates
        var cx = this.center.e(1);
        var cy = this.center.e(2);
        var cz = this.center.e(3);

        var result =  $V((x - cx), (y - cy), (z - cz));

        return result.toUnitVectorN(); 
  },
  
  getRadius: function() {
	return this.radius;
  },
    hits: function(ray) {
        var distVec = this.center.subtract(ray.getOrigin());
        distance = distVec.dot(ray.getDirection());

        if(distance > 0) {
            var orthoVec = distVec.cross(ray.getDirection());
            var distRayCenter = orthoVec.modulus() / ray.getDirection().modulus();
            var dist = distVec.modulus();
            var DSquare = Math.pow(dist, 2) - Math.pow(distance, 2);

            //check if the sphere is hit by the ray
            //if(distRayCenter < obj[i].getRadius()) {
            if(DSquare < Math.pow(this.radius, 2)) {
                return true;
            }
        }
        return false;
    },
    intersect: function(ray){
      var hit = false;
      var outSide = true;

        // get the coordinates from the ray direction
        var dx = ray.getDirection().e(1);
        var dy = ray.getDirection().e(2);
        var dz = ray.getDirection().e(3);

        // get the camera (viewer) coordinates
        var x0 = ray.getOrigin().e(1);
        var y0 = ray.getOrigin().e(2);
        var z0 = ray.getOrigin().e(3);

        // get the spherecenter coordinates
        var cx = this.center.e(1);
        var cy = this.center.e(2);
        var cz = this.center.e(3);

        // get the sphere radius
        var R = this.radius;

        var a = Math.pow(dx, 2) + Math.pow(dy, 2) + Math.pow(dz, 2);
        var b = 2 * dx * (x0 - cx) + 2 * dy * (y0 - cy) + 2 * dz * (z0 - cz);
        var c = Math.pow(cx, 2) + Math.pow(cy, 2) + Math.pow(cz, 2) + 
                Math.pow(x0, 2) + Math.pow(y0, 2) + Math.pow(z0, 2) -
                2 * (cx * x0 + cy * y0 + cz * z0) - Math.pow(R, 2);
        if (Math.pow(b, 2) - 4 * a * c < 0) {
            console.log("Error the ray don't hits the sphere");
            return [0, 0, 0, hit, outSide];
        } else {
            hit = true
            var t0 = (- b - Math.sqrt(Math.pow(b, 2) - 4 * a * c)) / (2 * a);
            if(t0 < 0) {
                // ray inside a sphere
                outSide = false
                t0 = (- b + Math.sqrt(Math.pow(b, 2) - 4 * a * c)) / (2 * a);
            }
            return [0, 0, t0, hit, outSide];;
        }
  },

  // Returns a copy of the sphere
  dup: function() {
    return Sphere.create(this.center,this.radius);
  }

};
  
// Constructor function
Sphere.create = function(center,radius) {
  var S = new Sphere();
  S.setCenter(center);
  S.setRadius(radius)
  return S;
};

// Utility functions
var $S = Sphere.create;

