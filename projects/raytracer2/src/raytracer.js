

// you can declare global variables here
var localEpsilon = 0.000000001;
// container for the object
var obj = new Array();
// container for the joint objects
var jointObj = new Array();
// ooctree for objects
var localOctree;
// container for all light points
var lights = new Array();
// tangents vector for light disk
var LightTan = $V(0, 0, 0);
// bitangents vector for light disk
var LightBiTan = $V(0, 0, 0);
// number of points for monte carlo integration
var MonteCarloSamples = 50;
// container for the points on the hemisphere
var hemiPoints = new Array();
// number of points in on the hemisphere
var hemiPointsCnt = 50;
// the radius of the hemisphere
var hemiRadius = 15.0;
// the viewpoint
var camera = $V(0, 0, 10);

var globalAmbientIntensity = 0.2;
// canvas attributes
var viewDirection = $V(0, 0, -1);
var canvasHightDirc = $V(0, -1, 0);
var canvasWidthDirc = $V(1, 0, 0);
var viewAngle = 40;
var canvasOffset = 1.5;
var canvasStart = $V(0, 0, 0);
var canvasHight;
var canvasWidth;
var pixelHeight;

// calculate the upper left point of the plane
function calcCanvasDimensions() {
	//the half height 
	//the angle in radians
	canvasHight = Math.tan(viewAngle * (Math.PI / 180)) / canvasOffset;
	//how many units has a Pixel in the coordinated system
	pixelHeight = 2 * canvasHight / height;
	// use the pixelheight to calc the width
	canvasWidth = (width * pixelHeight) / 2;
	// calc the point
	canvasStart = camera.add(viewDirection.multiply(canvasOffset));
	canvasStart.addN(canvasHightDirc.multiply(-canvasHight));
	canvasStart.addN(canvasWidthDirc.multiply(-canvasWidth));
	
}
// create a mipmapping for each texture
function loadMipMap(){
    for(var i = 0; i < obj.length; i++) {
        var tex = obj[i].getTexture();
        tex.initMipMapping();
        obj[i].setTexture(tex);
    }
}

// 0. set up the scene described in the exercise sheet (this is called before the rendering loop)
function loadScene() {
    if(ModuleId.C1) {
        var sphereA = $S($V(1.25, 1.25, 3.0), 0.5);
        var sphereB = $S($V(0.25, 1.25, 3.0), 1.0);
        sphereA.setAmbientMaterialColors($V(0, 0, 0.75));
        sphereA.setDiffuseMaterialColors($V(0, 0, 1));
        sphereA.setSpecularMaterialColors($V(0.5, 0.5, 1));
        sphereA.setSpecularExponent(16.0);
        sphereB.setAmbientMaterialColors($V(0, 0, 0.75));
        sphereB.setDiffuseMaterialColors($V(0, 0, 1));
        sphereB.setSpecularMaterialColors($V(0.5, 0.5, 1));
        sphereB.setSpecularExponent(16.0);
        var intersectObj = $BO(sphereA, sphereB, 0);
        jointObj[0] = intersectObj;
        obj[0] = sphereA;
        obj[1] = sphereB;
        //create hemisphere
        var hemiSphereOut = $S($V(0.0, 0.0, 0.0), 2.0);
        var pseudoSphere = $S($V(0, 0, 0), 0);
        hemiSphereOut.setAmbientMaterialColors($V(0.75, 0, 0));
        hemiSphereOut.setDiffuseMaterialColors($V(1, 0, 0));
        hemiSphereOut.setSpecularMaterialColors($V(1, 1, 1));
        hemiSphereOut.setSpecularExponent(32.0);
        pseudoSphere.setAmbientMaterialColors($V(0.75, 0.75, 0));
        pseudoSphere.setDiffuseMaterialColors($V(1, 1, 0));
        pseudoSphere.setSpecularMaterialColors($V(1, 1, 1));
        pseudoSphere.setSpecularExponent(32.0);
        var hemiSphere = $BO(hemiSphereOut, pseudoSphere, 1);
        obj[2] = hemiSphereOut;
        jointObj[1] = hemiSphere;
   
    }
    
    if(ModuleId.C2) {

        var tgaEarth = readTGA('./data/Earth.tga');
        var tgaEarth2 = readTGA('./data/Earth2.tga');
        var tgaEarth3 = readTGA('./data/Earth3.tga');
        var tgaEarth4 = readTGA('./data/Earth4.tga');
        var tgaEarth5 = readTGA('./data/Earth5.tga');
        var tgaEarthNorm = readTGA('./data/EarthNormal.tga');
        var tgaEarthNorm2 = readTGA('./data/EarthNormal2.tga');
        var tgaEarthNorm3 = readTGA('./data/EarthNormal3.tga');
        var tgaEarthNorm4 = readTGA('./data/EarthNormal4.tga');
        var tgaEarthNorm5 = readTGA('./data/EarthNormal5.tga');
        var texEarth = $Tex(tgaEarth, tgaEarthNorm);
        
        texEarth.setMipMap(0, tgaEarth);
        texEarth.setMipMap(1, tgaEarth2);
        texEarth.setMipMap(2, tgaEarth3);
        texEarth.setMipMap(3, tgaEarth4);
        texEarth.setMipMap(4, tgaEarth5);
        
        texEarth.setMipMapNorm(0, tgaEarthNorm);
        texEarth.setMipMapNorm(1, tgaEarthNorm2);
        texEarth.setMipMapNorm(2, tgaEarthNorm3);
        texEarth.setMipMapNorm(3, tgaEarthNorm4);
        texEarth.setMipMapNorm(4, tgaEarthNorm5);
        

        var earth = $S($V(0, 0, 0), 2);
        earth.setDiffuseMaterialColors($V(0, 0, 0)); // not used
        earth.setAmbientMaterialColors($V(0, 0, 0.5));
        earth.setSpecularMaterialColors($V(1, 1, 1));
        earth.setSpecularExponent(32.0);
        earth.setRefractionIndex(1.5); // not used
        texEarth.calcIndex(camera, earth.getCenter(), earth.getRadius());
        earth.setTexture(texEarth);
        obj[0] = earth;
        var tgaMoon = readTGA('./data/Moon.tga');
        var tgaMoon2 = readTGA('./data/Moon2.tga');
        var tgaMoon3 = readTGA('./data/Moon3.tga');
        var tgaMoon4 = readTGA('./data/Moon4.tga');
        var tgaMoon5 = readTGA('./data/Moon5.tga');
        var tgaMoonNorm = readTGA('./data/MoonNormal.tga');
        var tgaMoonNorm2 = readTGA('./data/MoonNormal2.tga');
        var tgaMoonNorm3 = readTGA('./data/MoonNormal3.tga');
        var tgaMoonNorm4 = readTGA('./data/MoonNormal4.tga');
        var tgaMoonNorm5 = readTGA('./data/MoonNormal5.tga');
        
        var texMoon = $Tex(tgaMoon, tgaMoonNorm);
        texMoon.setMipMap(0, tgaMoon);
        texMoon.setMipMap(1, tgaMoon2);
        texMoon.setMipMap(2, tgaMoon3);
        texMoon.setMipMap(3, tgaMoon4);
        texMoon.setMipMap(4, tgaMoon5);
        
        texMoon.setMipMapNorm(0, tgaMoonNorm);
        texMoon.setMipMapNorm(1, tgaMoonNorm2);
        texMoon.setMipMapNorm(2, tgaMoonNorm3);
        texMoon.setMipMapNorm(3, tgaMoonNorm4);
        texMoon.setMipMapNorm(4, tgaMoonNorm5);
        var moon = $S($V(1.25, 1.25, 3.0), 0.5);
        moon.setDiffuseMaterialColors($V(0, 0, 0)); // not used
        moon.setAmbientMaterialColors($V(0, 0, 0.2));
        moon.setSpecularMaterialColors($V(1, 1, 1));
        moon.setSpecularExponent(32.0);
        moon.setRefractionIndex(1.5); // not used
        texMoon.calcIndex(camera, moon.getCenter(), moon.getRadius());
        moon.setTexture(texMoon);
        obj[1] = moon;

    }
    
    if(ModuleId.C3) {
        //load file
        var myMesh = readOBJ('./data/sphere.obj');
        //var myMesh = readOBJ('./data/teapot.obj');
        //store in whitch faces the vertexes are used
        var pointsUsedTri = new Array(myMesh.V.length);
        var pointsUsedOrientation = new Array(myMesh.V.length);
        
        for (var j = 0; j < myMesh.V.length; j++) {
            pointsUsedTri[j] = new Array();
            pointsUsedOrientation[j] = new Array();
        }
        
        
        // create triangles
        for (var i = 0; i < myMesh.F.length; i++) {
            var curTri = myMesh.F[i];
            var Triangle = $T(myMesh.V[curTri.e(1)], myMesh.V[curTri.e(2)], myMesh.V[curTri.e(3)]);
            // store in triangles where the pvertexes are used
            pointsUsedTri[curTri.e(1)].push(i);
            pointsUsedOrientation[curTri.e(1)].push(0);
            pointsUsedTri[curTri.e(2)].push(i);
            pointsUsedOrientation[curTri.e(2)].push(1);
            pointsUsedTri[curTri.e(3)].push(i);
            pointsUsedOrientation[curTri.e(3)].push(2);
            
            Triangle.setDiffuseMaterialColors($V(0, 0, 1));
			Triangle.setAmbientMaterialColors($V(0, 0, 0.75));
			Triangle.setSpecularMaterialColors($V(0.5, 0.5, 1));
			Triangle.setSpecularExponent(16.0);
			Triangle.setRefractionIndex(-1);
            obj[i] = Triangle;
        }
        
        for (var j = 0; j < pointsUsedTri.length; j++) {
            var curNorm = $V(0, 0, 0);
            var curArray = pointsUsedTri[j];
            var curArrayPos = pointsUsedOrientation[j];
            //iterated over all used triangles
            for(var k = 0; k < curArray.length; k++) {
                var curTriNorm = obj[curArray[k]].getNormal();
                curNorm.addN(curTriNorm);
            }
            curNorm.toUnitVectorN();
            
            for(var k = 0; k < curArray.length; k++) {
                var numberPT = curArrayPos[k]
                switch(numberPT){
                        case 0:
                            obj[curArray[k]].setNormalP0(curNorm);
                            break;
                        case 1:
                            obj[curArray[k]].setNormalP1(curNorm);
                            break;
                        case 2:
                            obj[curArray[k]].setNormalP2(curNorm);
                            break;
                        default:
                            console.log("Error: Position not defined pos = " + j + " value = " + numberPT);
                }
            }
        }
        
    } 
    if (ModuleId.D1) {
        //load 1000 spheres
        var objCnt = 0;
        localOctree = $O($V(-1000, -1000, 1000), $V(1000, 1000, -1000), 25);
        for(var i = 0; i < 10; i++){
            for(var j = 0; j < 10; j++){
                for(var k = 0; k < 10; k++){
                    var sphere = $S($V(i - 4.5, j - 4.5, - Math.pow(k, 3)), 0.25);
                    //var sphere = $S($V(i - 1.5, j - 1.5,  Math.pow(- 2,k  )), 0.25);
                    sphere.setDiffuseMaterialColors($V(0, 0, 1));
                    sphere.setAmbientMaterialColors($V(0, 0, 0.75));
                    sphere.setSpecularMaterialColors($V(0.5, 0.5, 1));
                    sphere.setSpecularExponent(16.0);
                    sphere.setRefractionIndex(-1);
                    obj[objCnt] = sphere;
                    objCnt++;
                    // add to octree
                    localOctree.insertSphere(sphere);
                }
            }
        }
        
        
    }
    if(ModuleId.D2) {
        // Area lights
        var earth = $S($V(0, 0, 0), 2);
        earth.setDiffuseMaterialColors($V(0, 0, 1)); // not used
        earth.setAmbientMaterialColors($V(0, 0, 0.5));
        earth.setSpecularMaterialColors($V(1, 1, 1));
        earth.setSpecularExponent(32.0);
        earth.setRefractionIndex(1.5); // not used
        obj[0] = earth;
        var moon = $S($V(1.25, 1.25, 3.0), 0.5);
        moon.setDiffuseMaterialColors($V(1, 0, 0)); // not used
        moon.setAmbientMaterialColors($V(0.75, 0, 0));
        moon.setSpecularMaterialColors($V(1, 1, 1));
        moon.setSpecularExponent(32.0);
        moon.setRefractionIndex(1.5); // not used
        obj[1] = moon;
        
        
    }
    if(ModuleId.D3) {
        // created Hemisphere
        // store random view points from the hemisphere
        for(var i = 0; i < hemiPointsCnt; i++){
            
            var u = Math.random() * Math.PI;
            var v = Math.random() * Math.PI;
            
            var x = hemiRadius * Math.cos(u) * Math.sin(v);
            var y = hemiRadius * Math.sin(u) * Math.sin(v);
            var z = hemiRadius * Math.cos(v);
            hemiPoints[i] = $V(x , y, z);
        }
        
        
        //load triangle mesh
        var myMesh = readOBJ('./data/sphere.obj');
        
        //add ground plane
        var ground = $T($V(0, -2, 15), $V(10, 0, -10), $V(-10, 0, -10));
            ground.setDiffuseMaterialColors($V(0.75, 0.75, 0.75));
			ground.setAmbientMaterialColors($V(0.75, 0.75, 0.75));
			ground.setSpecularMaterialColors($V(1, 1, 1));
			ground.setSpecularExponent(16.0);
			ground.setRefractionIndex(-1);
        
        // add the triangles to objects
        for (var i = 0; i < myMesh.F.length; i++) {
            var curTri = myMesh.F[i];
            var Triangle = $T(myMesh.V[curTri.e(1)], myMesh.V[curTri.e(2)], myMesh.V[curTri.e(3)]);
            var r = Math.random();
            var g = Math.random();
            var b = Math.random();
            Triangle.setDiffuseMaterialColors($V(r, g, b));
			Triangle.setAmbientMaterialColors($V(r * 0.5, g * 0.5, b * 0.5));
			Triangle.setSpecularMaterialColors($V(1, 1, 1));
			Triangle.setSpecularExponent(32.0);
			Triangle.setRefractionIndex(-1);
            obj[i] = Triangle;
        }
        obj[obj.length] = ground;
        
    }
    
    // add the lights
    var fstLight = $L($V(10, 10, 10), $V(1, 1, 1));
    fstLight.setAmbient(0);
    fstLight.setDiffuse(1);
    fstLight.setSpecular(1);
    
    lights[0] = fstLight;
    
    if(ModuleId.D2) {
        //calc light tangengs and bitangengs
        LightTan =fstLight.getPosition().cross($V(1, 0, 0));
        LightBiTan = fstLight.getPosition().cross(LightTan);
        LightTan.toUnitVectorN();
        LightBiTan.toUnitVectorN();
    }

	calcCanvasDimensions();
}

// the purpose of this function ist to get the vector with hitpoint in the mesh
function getPosition(pixelX, pixelY) {
	var pos = canvasStart.add(canvasWidthDirc.multiply(pixelX * pixelHeight));
	pos.addN(canvasHightDirc.multiply(pixelY * pixelHeight));
	return pos;
}

function checkTriangleIntersect(ray) {
    var curSmallestDist = Number.MAX_VALUE;
	var iObjectNr = -1;
    
    for (var i = 0; i < obj.length; i++) {
		// check if object is infornt of the camera
        var res = obj[i].intersect(ray);
        if (res[3]) {
            if(res[2] < curSmallestDist && res[2] > 0) {
                iObjectNr = i;
                curSmallestDist = res[2];
            }
        }
        
	}
    return iObjectNr;
}



// trace triangles
function traceTri(color, pixelX, pixelY) {
    var totalColor = $V(0,0,0);

    // 1. shoot a ray determined from the camera parameters and the pixel position in the image
    var hitPoint = getPosition(pixelX, pixelY);    
    var vecRayDirection = hitPoint.subtract(camera)
    var ray = $R(camera, vecRayDirection.toUnitVector());
    // copy the given backgroud color
    var localColor = color.dup();

    var iObjectNr = checkTriangleIntersect(ray);
    
        //compute color only if a object was hit by the ray
        if (-1 < iObjectNr) {

                var res = obj[iObjectNr].intersect(ray);
                
                var vecHitPoint = ray.getOrigin().add(ray.getDirection().multiply(res[2]));
                var scdRay = $R(lights[0].getPosition(), (vecHitPoint.subtract(lights[0].getPosition())).toUnitVector());
                var iShadowObj = checkTriangleIntersect(scdRay);
                if (iShadowObj != iObjectNr && iShadowObj != -1) {
                    
                    var resShadow = obj[iShadowObj].intersect(scdRay);
                    var fstHitPt = scdRay.getOrigin().add(scdRay.getDirection().multiply(resShadow[2]));
                    var vecdistFst = (lights[0].getPosition().subtract(fstHitPt));
                    var distFst = vecdistFst.modulus();
                    var vecdistObj = (lights[0].getPosition().subtract(vecHitPoint));
                    var distObj = vecdistObj.modulus();
                    

                    if (distFst < distObj) {
                        var kax = obj[iObjectNr].getAmbientMaterialColors().e(1) * globalAmbientIntensity;
                        var kay = obj[iObjectNr].getAmbientMaterialColors().e(2) * globalAmbientIntensity;
                        var kaz = obj[iObjectNr].getAmbientMaterialColors().e(3) * globalAmbientIntensity;
                        localColor.setElements(kax, kay, kaz);  
                    } else {
                
                        // get the vector from the hit point to the viewer
                        var vecViewer = ray.getDirection().multiply(-1);
                        // the vector from the hit point to the ligth source
                        var vecLight = getLightVec(vecHitPoint, lights[0]);
                        // get the sphere normal at the hit point
                        //var vecNormal = obj[iObjectNr].getNormal();
                        var vecNormal = obj[iObjectNr].getNormalSmooth(res[0], res[1]);

                        //localColor =  calcLight(obj[iObjectNr]);
                        localColor = calcLightPhong(obj[iObjectNr], vecLight, vecNormal, vecViewer);
                    }
                } else {
                
                    // get the vector from the hit point to the viewer
                    var vecViewer = ray.getDirection().multiply(-1);
                    // the vector from the hit point to the ligth source
                    var vecLight = getLightVec(vecHitPoint, lights[0]);
                    // get the sphere normal at the hit point
                    //var vecNormal = obj[iObjectNr].getNormal();
                    var vecNormal = obj[iObjectNr].getNormalSmooth(res[0], res[1]);

                    //localColor =  calcLight(obj[iObjectNr]);
                    localColor = calcLightPhong(obj[iObjectNr], vecLight, vecNormal, vecViewer);
                }
            
        }
    
    // 5. set the pixel color into the image buffer using the computed shading 
	color.setElements(localColor.e(1),localColor.e(2), localColor.e(3));

}
// trace triangles and shade the objects with ambient occlusion
function traceAO(color, pixelX, pixelY) {
    var totalColor = $V(0,0,0);

    // 1. shoot a ray determined from the camera parameters and the pixel position in the image
    var hitPoint = getPosition(pixelX, pixelY);    
    var vecRayDirection = hitPoint.subtract(camera)
    var ray = $R(camera, vecRayDirection.toUnitVector());
    // copy the given backgroud color
    var localColor = color.dup();
        
    var iObjectNr = checkTriangleIntersect(ray);
    //compute color only if a object was hit by the ray
    if (-1 < iObjectNr) {

            var res = obj[iObjectNr].intersect(ray);

            var vecHitPoint = ray.getOrigin().add(ray.getDirection().multiply(res[2]));
            var vecNormal = obj[iObjectNr].getNormal();

            var sumVec = 0;
            //calc the Ambient occlusion
            for(var i = 0; i < hemiPointsCnt; i++) {
                // shoot a ray from outside to the hit point
                var rayOutIn = $R(hemiPoints[i], (vecHitPoint.subtract(hemiPoints[i])).toUnitVector());
                // get the id from the hit triangle
                var iHem = checkTriangleIntersect(rayOutIn);
                if(iHem != iObjectNr) {
                    //point is not hit
                    var visible = 0.0;
                } else {
                    var visible = 1.0;
                }

                sumVec += visible;
            }

            sumVec = sumVec / hemiPointsCnt;
            localColor.setElements(sumVec, sumVec, sumVec);

        }
    
    // 5. set the pixel color into the image buffer using the computed shading 
	color.setElements(localColor.e(1),localColor.e(2), localColor.e(3));

}
// trace a sphere with the octree structure
function traceSphere(color, pixelX, pixelY) {
	// 1. shoot a ray determined from the camera parameters and the pixel position in the image
    var hitPoint = getPosition(pixelX, pixelY);
        
    var vecRayDirection = hitPoint.subtract(camera)
    var ray = $R(camera, vecRayDirection.toUnitVector());
        // copy the given backgroud color
    var localColor = color.dup();
	// get the nearest intersection object
    var result = localOctree.intersectRay(ray)
        //compute color only if a object was hit by the ray
    if (result[0]) {

        //TODO add shadows
        var vecHitPoint = result[1];
        // 3. check if the intersection point is illuminated by each light source
        var scdRay = $R(lights[0].getPosition(), (vecHitPoint.subtract(lights[0].getPosition())).toUnitVector());
        var shadowResult = localOctree.intersectRay(scdRay)


        if (result[2] != shadowResult[2]) {
            var kax = result[2].getAmbientMaterialColors().e(1) * globalAmbientIntensity;
            var kay = result[2].getAmbientMaterialColors().e(2) * globalAmbientIntensity;
            var kaz = result[2].getAmbientMaterialColors().e(3) * globalAmbientIntensity;
            localColor.setElements(kax, kay, kaz);                 
        } else {
            // 4. shade the intersection point using the meterial attributes and the lightings

            // get the vector from the hit point to the viewer
            var vecViewer = ray.getDirection().multiply(-1);
            // the vector from the hit point to the ligth source
            var vecLight = getLightVec(result[1], lights[0]);
            // get the sphere normal at the hit point
            var vecSphereNormal = getNormal(result[1], result[2]);

            localColor = calcLightPhong(result[2], vecLight, vecSphereNormal, vecViewer);

        }
    }
    // 5. set the pixel color into the image buffer using the computed shading 
	color.setElements(localColor.e(1),localColor.e(2), localColor.e(3));

}
// trace a sphere and shade with texture
function traceSphereText(color, pixelX, pixelY){
    // 1. shoot a ray determined from the camera parameters and the pixel position in the image
    var hitPoint = getPosition(pixelX, pixelY);
        
    var vecRayDirection = hitPoint.subtract(camera)
    var ray = $R(camera, vecRayDirection.toUnitVector());
        // copy the given backgroud color
    var localColor = color.dup();
	var iObjectNr = checkObjsIntersection(ray);
        //compute color only if a object was hit by the ray
    if (-1 < iObjectNr) {
           // the vector of the hit point of the sphere
        var res = obj[iObjectNr].intersect(ray);
                
        var vecHitPoint = ray.getOrigin().add(ray.getDirection().multiply(res[2]));
                // 3. check if the intersection point is illuminated by each light source
        var scdRay = $R(lights[0].getPosition(), (vecHitPoint.subtract(lights[0].getPosition())).toUnitVector());
        var iShadowObj = checkObjsIntersection(scdRay);


            if (iShadowObj != iObjectNr) {
                var vecDistFst = obj[iObjectNr].getCenter().subtract(lights[0].getPosition());
                var distFst = vecDistFst.modulus();
                var vecDistScd = obj[iShadowObj].getCenter().subtract(lights[0].getPosition());
                var distScd = vecDistScd.modulus();
                if (distScd < distFst) {
                    var kax = obj[iObjectNr].getAmbientMaterialColors().e(1) * globalAmbientIntensity;
                    var kay = obj[iObjectNr].getAmbientMaterialColors().e(2) * globalAmbientIntensity;
                    var kaz = obj[iObjectNr].getAmbientMaterialColors().e(3) * globalAmbientIntensity;
                    localColor.setElements(kax, kay, kaz);  
                }
               
            } else {
                // 4. shade the intersection point using the meterial attributes and the lightings
                var curText = obj[iObjectNr].getTexture();
                // get the vector from the hit point to the viewer
                var vecViewer = ray.getDirection().multiply(-1);
                // the vector from the hit point to the ligth source
                var vecLight = getLightVec(vecHitPoint, lights[0]);
                // get the sphere normal at the hit point
                var vecglobalNormal = getNormal(vecHitPoint, obj[iObjectNr]);
                //var vecSphereNormal = getNormal(vecHitPoint, obj[iObjectNr]);
                var vecSphereNormal = curText.getNormal(vecHitPoint, obj[iObjectNr].center, vecglobalNormal);
                var TextColor = curText.getColor(vecHitPoint, obj[iObjectNr].center);

                localColor = calcLightPhongText(obj[iObjectNr], vecLight, vecSphereNormal, vecViewer, TextColor);
                
        }
    }
    // 5. set the pixel color into the image buffer using the computed shading 
	color.setElements(localColor.e(1),localColor.e(2), localColor.e(3));
}
// trace objects created by boolean operations
function traceImplict(color, pixelX, pixelY){
    // 1. shoot a ray determined from the camera parameters and the pixel position in the image
    var hitPoint = getPosition(pixelX, pixelY);
        
    var vecRayDirection = hitPoint.subtract(camera)
    var ray = $R(camera, vecRayDirection.toUnitVector());
        // copy the given backgroud color
    var localColor = color.dup();
    
	var iObjectNr = checkObjsIntersection(ray);
        //compute color only if a object was hit by the ray
    if (-1 < iObjectNr) {
        var curSmallestDist = Number.MAX_VALUE;
        var hit = false;
        var hitObj = null;
        var hitJointObj = null;
        var defaultNormal = false;
           // the vector of the hit point of the sphere
        for(var j = 0; j < jointObj.length; j++) {
            var res = jointObj[j].intersect(ray);
            // check if intersect was hit
            if(res[2]) {
                //check if nearest
                if(res[1] < curSmallestDist) {
                    hit = true;
                    curSmallestDist = res[1];
                    hitObj = res[0]
                    hitJointObj = jointObj[j];
                    defaultNormal = res[3];
                }
            }
        }
        if (hit) {
            // check for shadows
            var vecHitPoint = ray.getOrigin().add(ray.getDirection().multiply(curSmallestDist));
            
            var scdRay = $R(lights[0].getPosition(), (vecHitPoint.subtract(lights[0].getPosition())).toUnitVector());
            var iShadowObj = checkObjsIntersection(scdRay);
            var shadowObj = obj[iShadowObj];
            var shadowHit = false;
            //TODO improve shadows with the boolobj not only the source objects
            if (hitJointObj.getMode() == 0) {
                //intersection object
                
                if (shadowObj != hitJointObj.getSphere1() && shadowObj != hitJointObj.getSphere2()) {
                    var kax = hitObj.getAmbientMaterialColors().e(1) * globalAmbientIntensity;
                    var kay = hitObj.getAmbientMaterialColors().e(2) * globalAmbientIntensity;
                    var kaz = hitObj.getAmbientMaterialColors().e(3) * globalAmbientIntensity;
                    localColor.setElements(kax, kay, kaz);  
                    shadowHit = true;
                }
            } else if(hitJointObj.getMode() == 1) {
                if (shadowObj != hitJointObj.getSphere1() || !defaultNormal) {
                    var kax = hitObj.getAmbientMaterialColors().e(1) * globalAmbientIntensity;
                    var kay = hitObj.getAmbientMaterialColors().e(2) * globalAmbientIntensity;
                    var kaz = hitObj.getAmbientMaterialColors().e(3) * globalAmbientIntensity;
                    localColor.setElements(kax, kay, kaz);  
                    shadowHit = true;
                }
            }
            
            if(!shadowHit) {
                // get the vector from the hit point to the viewer
                var vecViewer = ray.getDirection().multiply(-1);
                // the vector from the hit point to the ligth source
                var vecLight = getLightVec(vecHitPoint, lights[0]);
                // get the sphere normal at the hit point
                var vecSphereNormal = hitObj.getNormal(vecHitPoint);
                if (!defaultNormal) {
                    vecSphereNormal.multiplyN(-1);
                }
                localColor = calcLightPhong(hitObj, vecLight, vecSphereNormal, vecViewer);
            }
        }        
        
    }
    // 5. set the pixel color into the image buffer using the computed shading 
	color.setElements(localColor.e(1),localColor.e(2), localColor.e(3));
}
// trace a sphere and create softshadows
function traceSphereSoft(color, pixelX, pixelY){
    // 1. shoot a ray determined from the camera parameters and the pixel position in the image
    var hitPoint = getPosition(pixelX, pixelY);
        
    var vecRayDirection = hitPoint.subtract(camera)
    var ray = $R(camera, vecRayDirection.toUnitVector());
        // copy the given backgroud color
    var localColor = color.dup();
    var totalColor = $V(0, 0, 0 );
	var iObjectNr = checkObjsIntersection(ray);
        //compute color only if a object was hit by the ray
    if (-1 < iObjectNr) {
           // the vector of the hit point of the sphere
        var res = obj[iObjectNr].intersect(ray);
        var vecHitPoint = ray.getOrigin().add(ray.getDirection().multiply(res[2]));
        
        for(var i = 0; i < MonteCarloSamples; i++) {
            // calc random point on the light source
            var r1 = Math.random() * 2 - 1;
            var r2 = Math.random() * 2 - 1;
            var curLightPoint = lights[0].getPosition().dup();
            curLightPoint.addN(LightTan.multiply(r1));
            curLightPoint.addN(LightBiTan.multiply(r2));
            // shoot a ray to the lightsource
            var scdRay = $R(curLightPoint, (vecHitPoint.subtract(curLightPoint)).toUnitVector());
            var iShadowObj = checkObjsIntersection(scdRay);
            if (iShadowObj == iObjectNr) {
                //point is illuminated
                var vecViewer = ray.getDirection().multiply(-1);
                //var vecLight = getLightVec(vecHitPoint, lights[0]);
                var vecLight = curLightPoint.subtract(vecHitPoint);
                vecLight.toUnitVectorN();
                var vecSphereNormal = getNormal(vecHitPoint, obj[iObjectNr]);
                var curColor = calcLightPhong(obj[iObjectNr], vecLight, vecSphereNormal, vecViewer);
                totalColor.addN(curColor);
            } else if(iShadowObj != -1) {
                var vecDistFst = obj[iObjectNr].getCenter().subtract(curLightPoint);
                var distFst = vecDistFst.modulus();
                var vecDistScd = obj[iShadowObj].getCenter().subtract(curLightPoint);
                var distScd = vecDistScd.modulus();
                if (distScd < distFst) {
                    var kax = obj[iObjectNr].getAmbientMaterialColors().e(1) * globalAmbientIntensity;
                    var kay = obj[iObjectNr].getAmbientMaterialColors().e(2) * globalAmbientIntensity;
                    var kaz = obj[iObjectNr].getAmbientMaterialColors().e(3) * globalAmbientIntensity;
                    var curColor = $V(kax, kay, kaz);
                    totalColor.addN(curColor); 
                }
            } else {
                totalColor.addN(localColor); 
            }
        }
        totalColor.multiplyN(1 / MonteCarloSamples);
        localColor = totalColor;
    }
    
    // 5. set the pixel color into the image buffer using the computed shading 
	color.setElements(localColor.e(1),localColor.e(2), localColor.e(3));
}

// the purpose of this function is to calc the out light based one the Phong lighting model for one lightsource
function calcLightPhongText (object, vecLight, vecNormal, vecViewer, TextColor) {
    
    
    // which is an ambient reflection constant, the ratio of reflection of the ambient term present in all points in the scene rendered
    var ka = object.getAmbientMaterialColors();
    // IAmbient depends one the gobal Ambieten intensity and the ambient term
    var IAmbient = ka.multiply(globalAmbientIntensity); 
    
    
    // which is a diffuse reflection constant, the ratio of reflection of the diffuse term of incoming light
    var kd = TextColor;
    // diffuse component of the light source
    var id = lights[0].getDiffuse();
    // dot product between light and normal
    var LN = vecNormal.dot(vecLight);
    
    // IDiffus depends on light intensity, the refectionkonstant and the angle between the object normal and the light ray
    var IDiffus = kd.multiply(Math.max(0,id * LN));
    var lightColor = lights[0].getColor();
    IDiffus.setElements(IDiffus.e(1) * lightColor.e(1), IDiffus.e(2) * lightColor.e(2), IDiffus.e(3) * lightColor.e(3));
    
    //which is a specular reflection constant, the ratio of reflection of the specular term of incoming light
    var ks = object.getSpecularMaterialColors();
    // which is a shininess constant for this material, which is larger for surfaces that are smoother and more mirror-like. 
    var alpha = object.getSpecularExponent();
    // which is the direction that a perfectly reflected ray of light would take from this point on the surface
    
    var scalar = 2 * vecLight.dot(vecNormal);
    var tempVec = vecNormal.multiply(scalar);
    //var r = tempVec.subtract(vecLight);
    var r = tempVec.subtract(vecLight);
    r.toUnitVectorN();
    // specular component of the light source
    var is = lights[0].getSpecular();
    // ISpecular depends on the light intensity Refextion konstant the light and the viewer vector 

    var ISpecular = ks.multiply(Math.pow(Math.max(0,r.dot(vecViewer)), alpha) * is);

    return IAmbient.add(IDiffus.add(ISpecular));
}
// the purpose of this function is to calc the out light based one the Phong lighting model for one lightsource
function calcLightPhong (object, vecLight, vecNormal, vecViewer) {
    
    
    // which is an ambient reflection constant, the ratio of reflection of the ambient term present in all points in the scene rendered
    var ka = object.getAmbientMaterialColors();
    // IAmbient depends one the gobal Ambieten intensity and the ambient term
    var IAmbient = ka.multiply(globalAmbientIntensity); 
    
    
    // which is a diffuse reflection constant, the ratio of reflection of the diffuse term of incoming light
    var kd = object.getDiffuseMaterialColors();
    // diffuse component of the light source
    var id = lights[0].getDiffuse();
    // dot product between light and normal
    var LN = vecNormal.dot(vecLight);
    
    // IDiffus depends on light intensity, the refectionkonstant and the angle between the object normal and the light ray
    var IDiffus = kd.multiply(Math.max(0,id * LN));
    var lightColor = lights[0].getColor();
    IDiffus.setElements(IDiffus.e(1) * lightColor.e(1), IDiffus.e(2) * lightColor.e(2), IDiffus.e(3) * lightColor.e(3));
    
    //which is a specular reflection constant, the ratio of reflection of the specular term of incoming light
    var ks = object.getSpecularMaterialColors();
    // which is a shininess constant for this material, which is larger for surfaces that are smoother and more mirror-like. 
    var alpha = object.getSpecularExponent();
    // which is the direction that a perfectly reflected ray of light would take from this point on the surface
    
    var scalar = 2 * vecLight.dot(vecNormal);
    var tempVec = vecNormal.multiply(scalar);
    //var r = tempVec.subtract(vecLight);
    var r = tempVec.subtract(vecLight);
    r.toUnitVectorN();
    // specular component of the light source
    var is = lights[0].getSpecular();
    // ISpecular depends on the light intensity Refextion konstant the light and the viewer vector 

    var ISpecular = ks.multiply(Math.pow(Math.max(0,r.dot(vecViewer)), alpha) * is);

    return IAmbient.add(IDiffus.add(ISpecular));
}


function getNormal(hitPoint, object) {

        // the hit point coordinates
        var x = hitPoint.e(1);
        var y = hitPoint.e(2);
        var z = hitPoint.e(3);

        // get the spherecenter coordinates
        var cx = object.getCenter().e(1);
        var cy = object.getCenter().e(2);
        var cz = object.getCenter().e(3);

        var result =  $V((x - cx), (y - cy), (z - cz));

        return result.toUnitVectorN(); 
}
// return the light unit vector at a given point and a light source
function getLightVec(hitPoint, lightPoint) {
    // the hit point coordinates
    var x = hitPoint.e(1);
    var y = hitPoint.e(2);
    var z = hitPoint.e(3);
    
    // get the spherecenter coordinates
    var Lx = lightPoint.getPosition().e(1);
    var Ly = lightPoint.getPosition().e(2);
    var Lz = lightPoint.getPosition().e(3);
    
    // get the sphere radius
    var result = $V(Lx - x, Ly - y, Lz - z);
    
    return result.toUnitVectorN();   
}







function checkObjsIntersection(ray) {
    var distance = 0;
    var curSmallestDist = Number.MAX_VALUE;
	var iObjectNr = -1;
    
    for (var i = 0; i < obj.length; i++) {
		// check if object is infornt of the camera
        var center = obj[i].getCenter();
        var distVec = center.subtract(ray.getOrigin());
        distance = distVec.dot(ray.getDirection());


        if(distance > 0) {
            var orthoVec = distVec.cross(ray.getDirection());
            var distRayCenter = orthoVec.modulus() / ray.getDirection().modulus();
            var dist = distVec.modulus();
            var DSquare = Math.pow(dist, 2) - Math.pow(distance, 2);

            //check if the sphere is hit by the ray
            //if(distRayCenter < obj[i].getRadius()) {
            if(DSquare < Math.pow(obj[i].getRadius(), 2)) {
                if(dist < curSmallestDist) {
                   curSmallestDist = dist;
                   iObjectNr = i;
                }

            }
        }
        
        
	}
    return iObjectNr;
}