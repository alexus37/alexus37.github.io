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
  
  getRadius: function() {
	return this.radius;
  },
  //TODO add the Specular material color and Specular exponent

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

