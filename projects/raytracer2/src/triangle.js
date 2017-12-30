function Triangle() {}
Triangle.prototype = {
    setElements: function(p0, p1, p2) {
        this.p0 = p0;
        this.p1 = p1;
        this.p2 = p2;
        var W = p1.subtract(p0);
        var U = p2.subtract(p0);
        this.normal = W.cross(U);
        //this.normal.toUnitVectorN();
        this.p0Norm = this.normal.toUnitVector();
        this.p1Norm = this.normal.toUnitVector();
        this.p2Norm = this.normal.toUnitVector();
        return this;
    },
    e: function(idx) {
        if(idx == 0) return this.p0;
        if(idx == 1) return this.p1;
        if(idx == 2) return this.p2;
    },
    // Returns a copy of the triangle
    dup: function() {
        return Triangle.create(this.p0,this.p1,this.p2);
    },
    setNormal: function(vecNormal) {
        this.normal = vecNormal;
        return this;
    },
    setNormalP0: function(normal){
        this.p0Norm = normal;
        return this;
    },
    setNormalP1: function(normal){
        this.p1Norm = normal;
        return this;
    },
    setNormalP2: function(normal){
        this.p2Norm = normal;
        return this;
    },
    getNormal: function() {
      return this.normal;  
    },
    getNormalSmooth: function(u, v) {
        var fst = this.p1Norm.multiply(u);
        var scd = this.p0Norm.multiply(1.0 - (u + v));
        var trd = this.p2Norm.multiply(v);
        var res = fst.add(scd.add(trd));  
        return res;
    },
    // Moller Trumbore's method
    intersect: function(ray){
        var eps = 0.000001;
        var fFacing = true;
        var intersect = false;
        // get the two edges
        var e1 = this.p1.subtract(this.p0);
        var e2 = this.p2.subtract(this.p0);
        //Begin calculating determinant 
        var P = ray.getDirection().cross(e2);
        // translated ray origin
        //var s = ray.getOrigin().subtract(this.p1)
        var det = e1.dot(P);
        if(det > - eps && det < eps) {
            return [0, 0, 0, intersect, fFacing];
        }
        
        var inv_det = 1.0 / det;
        
        //calculate distance from p0 to ray origin
        var T = ray.getOrigin().subtract(this.p0);
        
        //Calculate u parameter and test bound
        u = T.dot(P) * inv_det;
        //The intersection lies outside of the triangle
        if(u < 0.0 || u > 1.0){
            return [0, 0, 0, intersect, fFacing];
        }
        
        
        //Prepare to test v parameter
        var Q = T.cross(e1);
        
        //Calculate V parameter and test bound
        var v = ray.getDirection().dot(Q) * inv_det;
        
        //The intersection lies outside of the triangle
        if(v < 0.0 || v > 1.0 || (u + v)  > 1.0) {
            return [0, 0, 0, intersect, fFacing];
        }
        
        t = e2.dot(Q) * inv_det;
        intersect = true;
        
        return [u, v, t, intersect, fFacing];
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
};
  
// Constructor function
Triangle.create = function(p0,p1,p2) {
    var T = new Triangle();
    return T.setElements(p0, p1, p2);
};

// Utility functions
var $T = Triangle.create;

