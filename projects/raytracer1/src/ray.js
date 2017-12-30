function Ray() {}
Ray.prototype = {

  setOrigin: function (vector) {
    this.origin = vector;
	return this;
  },
  
  
  setDirection: function (vector) {
    this.direction = vector;
	return this;
  },
  
  
  
  getOrigin: function () {
	return this.origin;
  }, 
  
  getDirection: function () {
	return this.direction;
  },
  
  // Returns a copy of the sphere
  dup: function () {
    return Ray.create(this.origin, this.direction);
  }

};
  
// Constructor function
Ray.create = function (origin, direction) {
  var R = new Ray();
  R.setOrigin(origin);
  R.setDirection(direction);
  return R;
};

// Utility functions
var $R = Ray.create;

