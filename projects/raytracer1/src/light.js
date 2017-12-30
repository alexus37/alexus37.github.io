function Light() {}
Light.prototype = {

  setPosition: function(vector) {
    this.position = vector;
	return this;
  },
  
  
  setColor: function(colorVec) {
    this.color = colorVec;
	return this;
  },
  
  
  setDiffuse: function(k) {
	this.diffuse = k;
	return this;
  },
    
  setAmbient: function(k) {
	this.ambient = k;
	return this;
  },

  setSpecular: function(k) {
	this.specular = k;
	return this;
  },
  setRadi: function(vector) {
    this.radi = vector;
	return this;
  },
  getSpecular: function() {
	return this.specular;
  },
    
  getAmbient: function() {
	return this.ambient;
  },
  
  getDiffuse: function() {
	return this.diffuse;
  },
  
  getPosition: function() {
	return this.position;
  }, 
  
  getColor: function() {
	return this.color;
  },
  getRadi: function() {
    return this.radi;
  },
  
  // Returns a copy of the sphere
  dup: function() {
    return Light.create(this.position, this.color);
  }

};
  
// Constructor function
Light.create = function(position, color) {
  var L = new Light();
  L.setPosition(position);
  L.setColor(color);
  return L;
};

// Utility functions
var $L = Light.create;

