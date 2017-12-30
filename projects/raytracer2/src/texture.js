function Texture() {}
Texture.prototype = {
    setTGA: function(tga, norm) {
        this.TGA = tga;
        this.NORM = norm;
        this.mipmap = new Array();
        this.mipmapNorm = new Array();
        this.index = 0;
        
    },
    setIndex: function(index) {
        this.index = index;  
    },
    calcIndex: function(viewPt, centerPt, radius){
        var dist = (viewPt.subtract(centerPt)).modulus();
        dist *= radius;
        switch(true) {
                case (dist <= 10):
                this.index = 0;
                break;
                case (dist > 10 && dist <= 20): 
                this.index = 1;
                break;
                case (dist > 20 && dist <= 40):
                this.index = 2;
                break;
                case (dist > 40 && dist <= 80):
                this.index = 3;
                break;
                default:
                this.index = 4;
        }
    },
    setMipMap: function(index, TGA) {
        this.mipmap[index] = TGA;
    },
    setMipMapNorm: function(index, norm) {
        this.mipmapNorm[index] = norm
    },
    initMipMapping: function(){
        
        this.mipmap.push(this.TGA.image);
        var curMipmap = this.createMipmapping(this.TGA.image, this.TGA.header.height, this.TGA.header.width);

        var cnt = 1;
        
        do { 
            var factor = 1.0 / Math.pow(2, cnt);
            var curMipmap = this.createMipmapping(curMipmap, this.TGA.header.height * factor, this.TGA.header.width * factor);
            if(curMipmap != null) {
                this.mipmap.push(curMipmap);
            }
            cnt++;
        } while(curMipmap != null);
        
        
        this.mipmapNorm.push(this.NORM.image);
        var curMipmap = this.createMipmapping(this.NORM.image, this.NORM.header.height, this.NORM.header.width);
        this.mipmap.push(this.NORM.image);
        var cnt = 1;
        
        do {
            var factor = 1.0 / Math.pow(2, cnt);
            var curMipmap = this.createMipmapping(curMipmap, this.NORM.header.height * factor, this.NORM.header.width * factor);
            if(curMipmap != null) {
                this.mipmapNorm.push(curMipmap);
            }
            cnt++;
        } while(curMipmap != null);
    },
    createMipmapping: function(image, height, width) {
        if(height < 10 || width < 10) {
            return null;
        }
        var newHight = Math.ceil(height / 2);
        var newWidth = Math.ceil(width / 2);
        
        var limit = newHight * newWidth * 3;
        var result  = new Array(limit);
        var curPix = 0;
        for (var row =0; row < newHight; row++) {
            for (var col = 0; col < newWidth; col++) {
                //get the id of the pixel in source img
                var srcRow = 2 * row;
                var srcCol = 2 * col;
                id = 3 * (srcRow * width + 2 * srcCol);
                var r = image[id + 2];
                var g = image[id + 1];
                var b = image[id + 0];
                
                srcRow++;
                id = 3 * (srcRow * width + 2 * srcCol);
                r += image[id + 2];
                g += image[id + 1];
                b += image[id + 0];
                
                srcRow--;
                srcCol++;;
                id = 3 * (srcRow * width + 2 * srcCol);
                r += image[id + 2];
                g += image[id + 1];
                b += image[id + 0];
                
                srcRow++;
                id = 3 * (srcRow * width + 2 * srcCol);
                r += image[id + 2];
                g += image[id + 1];
                b += image[id + 0];
                
                r /= 4;
                g /= 4;
                b /= 4;
                id = 3 * (row * newWidth + col);
                
                result[id + 2] = r;
                result[id + 1] = g;
                result[id + 0] = b;
            }
        }
        return result;
    },
    
    getColor: function(vector, center){
        var cooridantes = this.getCoordinates(vector, center);

        var hight = this.mipmap[this.index].header.height; 
        var width =  this.mipmap[this.index].header.width;
        var col = Math.ceil(width * cooridantes[0]);
        var row = Math.ceil(hight * cooridantes[1]);
        
        //var id = 3 * (col * myTexture.header.width + row);
        var id = 3 * (row * width + col);
        var r = this.mipmap[this.index].image[id + 2] / 255.0;
		var g = this.mipmap[this.index].image[id + 1] / 255.0;
		var b = this.mipmap[this.index].image[id + 0] / 255.0;
        
        var res = $V(r,g, b);
        return res;
        
    },
    getNormal: function(vector, center, globalNormal) {
        var cooridantes = this.getCoordinates(vector, center);
        var hight = this.TGA.header.height; 
        var width =  this.TGA.header.width;
        var col = Math.ceil(width * cooridantes[0]);
        var row = Math.ceil(hight * cooridantes[1]);
        
        //var id = 3 * (col * myTexture.header.width + row);
        var id = 3 * (row * width + col);
        var red = this.NORM.image[id + 2] ;
		var green = this.NORM.image[id + 1];
		var blue = this.NORM.image[id + 0];
        red /= 255.0;
        green /= 255.0;
        blue /= 255.0;
        var t = 2.0 * red - 1.0;
        var b = 2.0 * green -1.0;
        var n = 2.0 * blue -1.0;
        //var normTang = $V(t, b, n);
        var normTang = $M([[t],[b], [n]]);
        // convert the normal from the tangent space coordinates to the world coordinates
        var globalTangent = globalNormal.cross($V(1, 0, 0));
        var biTangens = globalNormal.cross(globalTangent);
        biTangens.toUnitVectorN();
        globalTangent.toUnitVectorN();
        // trans the normal from tangent space to global space
        var Base =   $M([[globalTangent.e(1), globalTangent.e(2), globalTangent.e(3)],
                         [biTangens.e(1), biTangens.e(2), biTangens.e(3)], 
                         [globalNormal.e(1), globalNormal.e(2), globalNormal.e(3)]]);
        var invBase = Base.inverse();
        /*var nx = normTang.dot(globalTangent);
        var ny = normTang.dot(biTangens);
        var nz = normTang.dot(globalNormal);*/
        var mRes = invBase.multiply(normTang);
        
        //var res = $V(nx, ny, nz);
        var res = $V(mRes.e(1, 1), mRes.e(2, 1), mRes.e(3, 1));
        res.toUnitVectorN();
        return res;
    },
    
    getCoordinates: function(vector, center){
        var P = vector.subtract(center);
        var u = 0;
        var v = 0;
        P.toUnitVectorN();
        //u = 0.5 + (Math.atan2(P.e(3), P.e(1))) /(2* Math.PI );
        //v = 0.5 - (Math.asin(P.e(2))) /( Math.PI );
        
        //u = Math.acos(P.e(2));
        //u = u / Math.PI;
        //v = Math.atan2(-P.e(3), P.e(1));
        //v = v / (2 * Math.PI);
        u = ((Math.atan(P.e(1) / P.e(3))/ Math.PI) + 1.0) * 0.5;
        v = (Math.asin(P.e(2)) / Math.PI) + 0.5;

        return [u, v];
    }
};
  
// Constructor function
Texture.create = function(tga, norm) {
    var Tex = new Texture();
    Tex.setTGA(tga, norm);
    return Tex;
};

// Utility functions
var $Tex = Texture.create;

