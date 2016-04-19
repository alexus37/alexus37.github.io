function Cylinder() {}
Cylinder.prototype = {

  setAxis: function(vector) {
    this.axis = vector;
	return this;
  },
  
  
  setRadius: function(vector) {
    this.radius = vector;
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

  // Returns a copy of the sphere
  dup: function() {
    return Cylinder.create(this.axis, this.radius);
  }

};
  
// Constructor function
Cylinder.create = function(axis, radius) {
  var C = new Cylinder();
  C.setAxis(axis);
  C.setRadius(radius)
  return C;
};

// Utility functions
var $C = Cylinder.create;

