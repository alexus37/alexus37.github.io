function Ellipsoid() {}
Ellipsoid.prototype = {

  setSphere: function(sphere) {
    this.sphere = sphere;
	return this;
  },
  setCenter: function(vector) {
    this.center = vector;
	return this;
  },
  setRadi: function(vector) {
    this.radi = vector;
	return this;
  },
  setBasis: function(matrix) {
    this.basis = matrix;
	return this;
  },
  setInverse: function(matrix) {
    this.inverse = matrix;
	return this;
  },
  
  setDiffuseMaterialColors: function(colorVec) {
	this.DiffMatColor = colorVec;
	return this;
  },
    
  setAmbientMaterialColors: function(colorVec) {
	this.AmbientMatColor = colorVec;
	return this            ;
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
  
  getSphere: function() {
	return this.sphere;
  }, 
  
  getBasis: function() {
	return this.basis;
  },

    getCenter: function() {
	return this.center;
  }, 
  getRadi: function() {
	return this.radi;
  }, 
  getInverse: function() {
	return this.inverse;
  },


  // Returns a copy of the sphere
  dup: function() {
    return Ellipsoid.create(this.center,this.radius);
  }

};
  
// Constructor function
Ellipsoid.create = function(basisMatrix) {
  var E = new Ellipsoid();
  E.setSphere($S($V(0, 0, 0), 1));
  E.setBasis(basisMatrix);
  E.setInverse(basisMatrix.inverse());
  return E;
};

// Utility functions
var $E = Ellipsoid.create;

