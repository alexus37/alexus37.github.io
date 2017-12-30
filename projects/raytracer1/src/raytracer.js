

// you can declare global variables here
var localEpsilon = 0.001;
var obj = new Array();

var lights = new Array();
var camera = $V(0, 0, 10);
// dof
var focalLength = 5;
var cntRaysPix = 16;


var globalAmbientIntensity = 0.2;
var viewDirection = $V(0, 0, -1);
var canvasHightDirc = $V(0, -1, 0);
var canvasWidthDirc = $V(1, 0, 0);
var viewAngle = 40;
var canvasOffset = 1.5;
var canvasStart = $V(0, 0, 0);
var iters = 3;
var cntSamples = 16;

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


// 0. set up the scene described in the exercise sheet (this is called before the rendering loop)
function loadScene() {
    if(ModuleId.B3) {
        //var h = Number.MAX_VALUE;
        var h = 1000000.0;
        //scale
        var S            = $M([[1/2.0 , 0   , 0  , 0   ],
                               [0   , 0   , 0  , 0   ],
                               [0   , 0   , 1  , 0   ],
                               [0   , 0   , 0  , -1.0 ]]);

        //scale
        var S2           = $M([[1/0.25  , 0   , 0  , 0   ],
                               [0   , 1/0.75   , 0  , 0   ],
                               [0   , 0   , 1/0.5  , 0   ],
                               [0   , 0   , 0  , -1.0 ]]);
        

        var redSphere  = $E(S);
        redSphere.setCenter($V(0, 0, 0));
        redSphere.setRadi($V(2, h, 1))
        var blueSphere = $E(S2);
        blueSphere.setCenter($V(1.25, 1.25, 3));
        blueSphere.setRadi($V(0.25, 0.75, 0.5))
      
        
    } else {
        var redSphere = $S($V(0, 0, 0), 2);
        var blueSphere = $S($V(1.25, 1.25, 3), 0.5);
        
    }
        //create first sphere (big red one)

    redSphere.setDiffuseMaterialColors($V(1, 0, 0));
    redSphere.setAmbientMaterialColors($V(0.75, 0, 0));
    redSphere.setSpecularMaterialColors($V(1, 1, 1));
    redSphere.setSpecularExponent(32.0);
    redSphere.setRefractionIndex(1.5);

    //create seconde sphere (small blue one)

    blueSphere.setDiffuseMaterialColors($V(0, 0, 1));
    blueSphere.setAmbientMaterialColors($V(0, 0, 0.75));
    blueSphere.setSpecularMaterialColors($V(0.5, 0.5, 1));
    blueSphere.setSpecularExponent(16.0);
    //blueSphere.setRefractionIndex(1.5);
    blueSphere.setRefractionIndex(-1);


    /*var greenSphere = $S($V(2, 2, -3.5), 3);
    greenSphere.setDiffuseMaterialColors($V(0, 1, 0));
    greenSphere.setAmbientMaterialColors($V(0, 0.75, 0));
    greenSphere.setSpecularMaterialColors($V(0.5, 0.5, 0.5));
    greenSphere.setSpecularExponent(32.0);
    greenSphere.setRefractionIndex(-1);*/
    
    if(ModuleId.B4){
        redSphere.setDiffuseMaterialColors($V(1, 1, 0));
        redSphere.setAmbientMaterialColors($V(1, 1, 0));
        blueSphere.setDiffuseMaterialColors($V(0, 1, 1));
        blueSphere.setAmbientMaterialColors($V(0, 1, 1));
        
    }



        //put the two elements in the objects array
        obj[0] = redSphere;
        obj[1] = blueSphere;
        //obj[0] = blueSphere;
        //obj[1] = greenSphere;
    

    // add the lights
    var fstLight = $L($V(10, 10, 10), $V(1, 1, 1));
    fstLight.setAmbient(0);
    fstLight.setDiffuse(1);
    fstLight.setSpecular(1);
    
    lights[0] = fstLight;

	calcCanvasDimensions();
}

// the purpose of this function ist to get the vector with hitpoint in the mesh
function getPosition(pixelX, pixelY) {
	var pos = canvasStart.add(canvasWidthDirc.multiply(pixelX * pixelHeight));
	pos.addN(canvasHightDirc.multiply(pixelY * pixelHeight));
	return pos;
}

function checkObjsIntersection(ray, viewPoint, IExcept) {
    var distance = 0;
    var curSmallestDist = Number.MAX_VALUE;
	var iObjectNr = -1;
    
    for (var i = 0; i < obj.length; i++) {
		// check if object is infornt of the camera
        if(ModuleId.B3) {
            var MtrsOrigin = $M([[ray.getOrigin().e(1)],
                                 [ray.getOrigin().e(2)],
                                 [ray.getOrigin().e(3)],
                                 [1.0]]);
            var MtrsDirc = $M([[ray.getDirection().e(1)],
                               [ray.getDirection().e(2)],
                               [ray.getDirection().e(3)],
                               [1.0]]);
            MtrsOrigin = transformations[i].multiply(MtrsOrigin);
            MtrsDirc = transformations[i].multiply(MtrsDirc);
            var vecTrsOrigin = $V(MtrsOrigin.e(1,1), MtrsOrigin.e(2,1), MtrsOrigin.e(3,1));
            var vecTrsDirc = $V(MtrsDirc.e(1,1), MtrsDirc.e(2,1), MtrsDirc.e(3,1));
            
            var center = obj[i].getCenter();
            var distVec = center.subtract(vecTrsOrigin);
            distance = distVec.dot(vecTrsDirc);
            var dist = distVec.modulus();


            if(distance > 0) {
                var orthoVec = distVec.cross(vecTrsDirc);
                var distRayCenter = orthoVec.modulus() / vecTrsDirc.modulus(); 

                //check if the sphere is hit by the ray
                if(distRayCenter < obj[i].getRadius()) {
                    if(dist < curSmallestDist) {
                        if(IExcept != i) {
                           curSmallestDist = dist;
                           iObjectNr = i;
                        }
                    }

                }
            }
            
            
        } else {
            var center = obj[i].getCenter();
            var distVec = center.subtract(viewPoint);
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
                        if(IExcept != i) {
                           curSmallestDist = dist;
                           iObjectNr = i;
                        }
                    }

                }
            }
        }
        
	}
    return iObjectNr;
}
// trace a pixel with the death of flied effect
function traceDOF(color, curPixelX, curPixelY) {
    var totalColor = $V(0,0,0);
    var hitPoint = getPosition(curPixelX, curPixelY);
    var vecRayDirection = hitPoint.subtract(camera)
    var begray = $R(camera, vecRayDirection.toUnitVector());
    // pointAimed is the position of pixel on focal plane in specified ray
    var pointAimed = begray.getOrigin().add(begray.getDirection().multiply(focalLength));
    
    for (var i = 0; i < cntRaysPix; i++) {
        var phi = Math.random() * 2 * Math.PI;
        var theta = Math.random() * Math.PI;
        var r = 0.1;
        
        var xValue = r * Math.sin(theta) * Math.cos(phi);
        var yValue = r * Math.sin(theta) * Math.sin(phi);
        var zValue = r * Math.cos(theta);
        
        var camPoint = camera.add($V(xValue, yValue, zValue));
        var rayDirc = pointAimed.subtract(camPoint);
        rayDirc.toUnitVectorN();
        
        var ray = $R(camPoint, rayDirc);
        
        var localColor = color.dup();
        // get the nearest intersecting object
        var iObjectNr = checkObjsIntersection(ray, camPoint);
        //compute color only if a object was hit by the ray
        if (-1 < iObjectNr) {

            // the vector of the hit point of the sphere
            var vecHitPoint = calcIntersectionPointFast(ray, obj[iObjectNr], -1);
            // 3. check if the intersection point is illuminated by each light source
            var scdRay = $R(lights[0].getPosition(), (vecHitPoint.subtract(lights[0].getPosition())).toUnitVector());
            var iShadowObj = checkObjsIntersection(scdRay, lights[0].getPosition(), -1);


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
                        if(ModuleId.B1){
                            localColor.multiplyN(0.5);
                        }
                    }

                } else {
                    // 4. shade the intersection point using the meterial attributes and the lightings

                    // get the vector from the hit point to the viewer
                    var vecViewer = ray.getDirection().multiply(-1);
                    // the vector from the hit point to the ligth source
                    var vecLight = getLightVec(vecHitPoint, lights[0]);
                    // get the sphere normal at the hit point
                    var vecSphereNormal = getNormal(vecHitPoint, obj[iObjectNr]);

                    localColor = calcLightPhong(obj[iObjectNr], vecLight, vecSphereNormal, vecViewer);


            }
        }
        
        totalColor.addN(localColor);
    }
    localColor = totalColor.multiply(1 / cntRaysPix);
    // 5. set the pixel color into the image buffer using the computed shading 
	color.setElements(localColor.e(1),localColor.e(2), localColor.e(3));
    
}


function traceStereoscopic (color, pixelX, pixelY) {

    //left eye
    camera.setElements( - 0.01, camera.e(2), camera.e(3));
    var  RGBL = color.dup();
    trace(RGBL, pixelX, pixelY);
    // right eye
    camera.setElements(0.01, camera.e(2), camera.e(3));
    var  RGBR = color.dup();
    trace(RGBR, pixelX, pixelY);
    var locRed = 0.11 * RGBL.e(1) + 0.59 * RGBL.e(2) + 0.3 * RGBL.e(3);
    var locGreen = RGBR.e(2);
    var locBlue = RGBR.e(3);
    color.setElements(locRed, locGreen, locBlue);
    
}

function trace(color, pixelX, pixelY) {
    var totalColor = $V(0,0,0);
    if(!ModuleId.B2) {
        cntSamples = 1;
    }
    for(var i = 0; i < cntSamples; i++) {
	   // 1. shoot a ray determined from the camera parameters and the pixel position in the image
        var hitPoint = getPosition(pixelX, pixelY);
        if(ModuleId.B2) {
            //use the random method the achiv anti aliasing 
            var xOffset = pixelHeight * Math.random();
            var yOffset = pixelHeight * Math.random();
        
            hitPoint.addN(canvasWidthDirc.multiply(xOffset));
            hitPoint.addN(canvasHightDirc.multiply(yOffset));
        }
            
            
        
        var vecRayDirection = hitPoint.subtract(camera)
        var ray = $R(camera, vecRayDirection.toUnitVector());
        // copy the given backgroud color
        var localColor = color.dup();
        if(ModuleId.B3) {
            // get the nearest intersecting object (ellipsoid)
            //var iObjectNr = checkElipIntersection(ray, -1);
            var iObjectNr = checkQuadricIntersection(ray, -1);
            
        } else {
            // get the nearest intersecting object
            var iObjectNr = checkObjsIntersection(ray, camera);
        }
        //compute color only if a object was hit by the ray
        if (-1 < iObjectNr) {
            if(ModuleId.B3) {
                //TODO add shadows
                
                //var vecHitPoint = calcIntersectionPointEllip(ray, obj[iObjectNr]);
                var vecHitPoint = calcIntersectionPointQuadric(ray, obj[iObjectNr]);
                var scdRay = $R(lights[0].getPosition(), (vecHitPoint.subtract(lights[0].getPosition())).toUnitVector());
                var iShadowObj = checkQuadricIntersection(ray, -1);
                if (iShadowObj != iObjectNr && iShadowObj != -1) {
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
                
                    // get the vector from the hit point to the viewer
                    var vecViewer = ray.getDirection().multiply(-1);
                    // the vector from the hit point to the ligth source
                    var vecLight = getLightVec(vecHitPoint, lights[0]);
                    // get the sphere normal at the hit point
                    var vecSphereNormal = getNormalEllip(vecHitPoint, obj[iObjectNr]);


                    //localColor =  calcLight(obj[iObjectNr]);
                    localColor = calcLightPhong(obj[iObjectNr], vecLight, vecSphereNormal, vecViewer);
                }
            } else {
                // the vector of the hit point of the sphere
                var vecHitPoint = calcIntersectionPointFast(ray, obj[iObjectNr]);
                // 3. check if the intersection point is illuminated by each light source
                var scdRay = $R(lights[0].getPosition(), (vecHitPoint.subtract(lights[0].getPosition())).toUnitVector());
                var iShadowObj = checkObjsIntersection(scdRay, lights[0].getPosition(), -1);


                    if (iShadowObj != iObjectNr) {
                        if(obj[iObjectNr] instanceof Sphere) {
                            var vecDistFst = obj[iObjectNr].getCenter().subtract(lights[0].getPosition());
                            var distFst = vecDistFst.modulus();
                            var vecDistScd = obj[iShadowObj].getCenter().subtract(lights[0].getPosition());
                            var distScd = vecDistScd.modulus();
                            if (distScd < distFst) {
                                var kax = obj[iObjectNr].getAmbientMaterialColors().e(1) * globalAmbientIntensity;
                                var kay = obj[iObjectNr].getAmbientMaterialColors().e(2) * globalAmbientIntensity;
                                var kaz = obj[iObjectNr].getAmbientMaterialColors().e(3) * globalAmbientIntensity;
                                localColor.setElements(kax, kay, kaz);  
                                if(ModuleId.B1){
                                    localColor.multiplyN(0.5);
                                }
                            }
                        } else if (obj[iObjectNr] instanceof Cylinder) {

                        } else {

                        }
                    } else {
                        // 4. shade the intersection point using the meterial attributes and the lightings

                        // get the vector from the hit point to the viewer
                        var vecViewer = ray.getDirection().multiply(-1);
                        // the vector from the hit point to the ligth source
                        var vecLight = getLightVec(vecHitPoint, lights[0]);
                        // get the sphere normal at the hit point
                        var vecSphereNormal = getNormal(vecHitPoint, obj[iObjectNr]);



                        if(ModuleId.B1){
                            // Specular reflection and specular refraction
                            localColor = calcColorRR(iObjectNr, vecLight, vecSphereNormal, vecViewer, vecHitPoint, iters, color);

                        } else {
                            // calc the color by the phong lighting model
                            localColor = calcLightPhong(obj[iObjectNr], vecLight, vecSphereNormal, vecViewer);
                        }

                }
            }
        }
        totalColor.addN(localColor);
    }
    localColor = totalColor.multiply(1 / cntSamples);
    // 5. set the pixel color into the image buffer using the computed shading 
	color.setElements(localColor.e(1),localColor.e(2), localColor.e(3));

}


function calcColorRR(iObjectNr, vecLight, vecNormal, vecViewer, vecHitPoint, i, color) {
    // color at that point
    var E = calcLightPhong(obj[iObjectNr], vecLight, vecNormal, vecViewer);
    //recursion anker
    if(i == 0) {
        return E;
    }
    //use the half of the local light
    E.multiplyN(0.5);
    
    
    // the reflection light
    var LS = $V(0, 0, 0);
    //var LS = color.dup();
    //calc the refection direction
    var scalar = 2 * vecViewer.dot(vecNormal);
    var vecModiNormal = vecNormal.multiply(scalar);
    var vecReflection = vecModiNormal.subtract(vecViewer);
    // shoot a ray in the reflected direction
    var scdRay = $R(vecHitPoint, vecReflection.toUnitVector());
    
    var iScdObject = checkObjsIntersection(scdRay, vecHitPoint, iObjectNr);
    // check if there was in intersection
    if(-1  < iScdObject && iScdObject != iObjectNr) {
        var vecScdHitPoint = calcIntersectionPointFast(scdRay, obj[iScdObject]);
        
        var shadowRay = $R(lights[0].getPosition(), vecScdHitPoint.subtract(lights[0].getPosition()));
        var iShadowObj = checkObjsIntersection(shadowRay, lights[0].getPosition(), -1);

            if (iShadowObj != iScdObject) {
                var vecDistFst = obj[iScdObject].getCenter().subtract(lights[0].getPosition());
                var distFst = vecDistFst.modulus();
                var vecDistScd = obj[iShadowObj].getCenter().subtract(lights[0].getPosition());
                var distScd = vecDistScd.modulus();
                if (distScd < distFst) {
                    var kax = obj[iScdObject].getAmbientMaterialColors().e(1) * globalAmbientIntensity;
                    var kay = obj[iScdObject].getAmbientMaterialColors().e(2) * globalAmbientIntensity;
                    var kaz = obj[iScdObject].getAmbientMaterialColors().e(3) * globalAmbientIntensity;
                    LS.setElements(kax, kay, kaz);  
                }
            } else {
                // the reflection is at a hitpoint with no shadows
                var vecScdViewer = scdRay.getDirection().multiply(-1);
                var vecScdLight = getLightVec(vecScdHitPoint, lights[0]);
                var vecScdSphereNormal = getNormal(vecScdHitPoint, obj[iScdObject]);
                LS = calcColorRR(iScdObject, vecScdLight, vecScdSphereNormal, vecScdViewer, vecScdHitPoint, i - 1, color);
            }
    }
    

    // the refraction light
    //var LT = color.dup();
    var LT = $V(0, 0, 0);
    if (obj[iObjectNr].getRefractionIndex() == -1) {
        // no refraction
        LT = LS.dup();
    } else {
        var incident = vecViewer.multiply(-1);
        //calc the correct n1 and n2 depending on the incident vector's direction relative to the normal
        var cosI = incident.dot(vecNormal);
        var n1 = obj[iObjectNr].getRefractionIndex();
        var n2 = 1.0;

        if (cosI > 0) {
            var n1 = obj[iObjectNr].getRefractionIndex();
            var n2 = 1.0;
            // Flip the normal around
            var normal = vecNormal.multiply(-1);
        } else {
            //incident and normal have opposite directions, so the ray is outside the material
            var n2 = obj[iObjectNr].getRefractionIndex();
            var n1 = 1.0;
            
            var normal = vecNormal;
            cosI = -cosI;
        }
        
        var cosT = 1.0 - Math.pow(n1 / n2, 2.0) * (1.0 - Math.pow(cosI, 2.0));
        
        if (cosT < 0) {
            console.log("Total internal reflection occurred");
            var scalar = 2 * incident.dot(normal);
    		var vecModiNormal = normal.multiply(scalar);
    		var refracDirc = vecModiNormal.subtract(incident);
        } else {
            cosT = Math.sqrt(cosT);

            var origin = vecHitPoint.add(normal.multiply(- localEpsilon));
            var refracDirc = incident.multiply(n1 / n2)
            refracDirc.addN(normal.multiply((n1 / n2) * cosI - cosT));
        }
        
        // shoot ray inside of the sphere

        
        var insRay = $R(origin,refracDirc.toUnitVector());
        
        var iExObj = checkObjsIntersection(insRay, origin, -1);
        
        if (iExObj != -1) {
            // get exiting point
            var exPoint = calcIntersectionPointFast(insRay, obj[iExObj], -1);

            // calc the color at the hit point inside
            var vecScdViewer = insRay.getDirection().multiply(-1);
            var vecScdLight = getLightVec(exPoint, lights[0]);
            var vecScdSphereNormal = getNormal(exPoint, obj[iExObj]);
            //vecScdSphereNormal.multiply(-1);
            LT = calcColorRR(iExObj, vecScdLight, vecScdSphereNormal, vecScdViewer, exPoint, i - 1, color);
        }
    }
    
    /*if(obj[iObjectNr].getRefractionIndex() != -1) {
        var result = LS.add(LT);
    } else {
        var RR = LS.add(LT);
        //var result = E.add(RR.multiply(0.5));
        var result = E.multiply(2);
    }*/
    var RR = LS.add(LT);
    var result = E.add(RR.multiply(0.5));
    return result;

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
// return the normal unit vector at a given point of a object
function getNormalEllip(hitPoint, object) {
    var alpha = object.getRadi().e(1);
    var beta = object.getRadi().e(2);
    var gamma = object.getRadi().e(3);
    // the hit point coordinates
    var x = hitPoint.e(1);
    var y = hitPoint.e(2);
    var z = hitPoint.e(3);

    // get the spherecenter coordinates
    var cx = object.getCenter().e(1);
    var cy = object.getCenter().e(2);
    var cz = object.getCenter().e(3);

    var result =  $V((x - cx) / alpha, (y - cy) / beta, (z - cz) / gamma);


    return result.toUnitVectorN(); 
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


function calcIntersectionPointQuadric(ray, obj) {
  /*  var center   = obj.getCenter();
    var p        = $M([[ray.getOrigin().e(1)],
                         [ray.getOrigin().e(2)],
                         [ray.getOrigin().e(3)],
                         [1.0]]);
    var u        = $M([[ray.getDirection().e(1)],
                       [ray.getDirection().e(2)],
                       [ray.getDirection().e(3)],
                       [0.0]]); 
    var Q        = obj.getBasis();
    
    
    var Ma = u.transpose().multiply(Q).multiply(u);
    var a = Ma.e(1, 1);
    var PTran       = $M([[ray.getOrigin().e(1) - center.e(1)],
                         [ray.getOrigin().e(2) - center.e(2)],
                         [ray.getOrigin().e(3) - center.e(3)],
                         [1.0]]);
    var Mb = u.transpose().multiply(Q).multiply(PTran);
    var b = 2 * Mb.e(1, 1);
    var Mc = p.transpose().multiply(Q).multiply(p);
    var c = Mc.e(1, 1);*/
     // get the coordinates from the ray direction
    var dx = ray.getDirection().e(1);
    var dy = ray.getDirection().e(2);
    var dz = ray.getDirection().e(3);

    // get the camera (viewer) coordinates
    var x0 = ray.getOrigin().e(1);
    var y0 = ray.getOrigin().e(2);
    var z0 = ray.getOrigin().e(3);

    // get the spherecenter coordinates
    var cx = obj.getCenter().e(1);
    var cy = obj.getCenter().e(2);
    var cz = obj.getCenter().e(3);
    // get the radi
    var alpha = obj.getRadi().e(1);
    var beta = obj.getRadi().e(2);
    var gamma = obj.getRadi().e(3);
    
    var a = Math.pow(dx, 2) / alpha + Math.pow(dy, 2) / beta + Math.pow(dz, 2) / gamma;
    var b = 2 * dx * (x0 - cx) / alpha + 2 * dy * (y0 - cy) / beta + 2 * dz * (z0 - cz) / gamma;
    var c = Math.pow(x0 - cx, 2) /alpha + Math.pow(y0 - cy, 2) / beta + Math.pow(z0 - cz, 2) / gamma - 1;
    
    if (Math.pow(b, 2) - 4 * a * c < 0) {
            console.log("Error the ray don't hits the sphere");
            return;
        } else {
            var t0 = (- b - Math.sqrt(Math.pow(b, 2) - 4 * a * c)) / (2 * a);
            if(t0 < 0) {
                // ray inside a sphere
                t0 = (- b + Math.sqrt(Math.pow(b, 2) - 4 * a * c)) / (2 * a);
            }

            var result = ray.getOrigin().add(ray.getDirection().multiply(t0));
            return result;
        }
}


//calculate the intersection point with a sphere and a ray and return the the vector 
function calcIntersectionPointEllip(ray, object) {
    var MtrsOrigin = $M([[ray.getOrigin().e(1)],
                         [ray.getOrigin().e(2)],
                         [ray.getOrigin().e(3)],
                         [1.0]]);
    var MtrsDirc = $M([[ray.getDirection().e(1)],
                       [ray.getDirection().e(2)],
                       [ray.getDirection().e(3)],
                       [1.0]]);
    var tmpMtrsOrigin = object.getInverse().multiply(MtrsOrigin);
    var tmpMtrsDirc = object.getInverse().multiply(MtrsDirc);
    var vecTrsOrigin = $V(tmpMtrsOrigin.e(1,1), tmpMtrsOrigin.e(2,1), tmpMtrsOrigin.e(3,1));
    var vecTrsDirc = $V(tmpMtrsDirc.e(1,1), tmpMtrsDirc.e(2,1), tmpMtrsDirc.e(3,1));
    vecTrsDirc.toUnitVectorN();
    
    var transRay = $R(vecTrsOrigin, vecTrsDirc);
    
    var hitPoint = calcIntersectionPointFast(transRay, $S($V(0, 0, 0), 1));
    var MhitPoint = $M([[hitPoint.e(1)], [hitPoint.e(2)], [hitPoint.e(3)], [1]]);
    var MBackTransHitPoint = object.getBasis().multiply(MhitPoint);
    
    var resHitPoint = $V(MBackTransHitPoint.e(1, 1), MBackTransHitPoint.e(2, 1), MBackTransHitPoint.e(3, 1))
    return resHitPoint;
}


//calculate the intersection point with a sphere and a ray and return the the vector 
function calcIntersectionPointFast(ray, object) {
    if (object instanceof Sphere) {
        // get the coordinates from the ray direction
        var dx = ray.getDirection().e(1);
        var dy = ray.getDirection().e(2);
        var dz = ray.getDirection().e(3);

        // get the camera (viewer) coordinates
        var x0 = ray.getOrigin().e(1);
        var y0 = ray.getOrigin().e(2);
        var z0 = ray.getOrigin().e(3);

        // get the spherecenter coordinates
        var cx = object.getCenter().e(1);
        var cy = object.getCenter().e(2);
        var cz = object.getCenter().e(3);

        // get the sphere radius
        var R = object.getRadius();

        var a = Math.pow(dx, 2) + Math.pow(dy, 2) + Math.pow(dz, 2);
        var b = 2 * dx * (x0 - cx) + 2 * dy * (y0 - cy) + 2 * dz * (z0 - cz);
        var c = Math.pow(cx, 2) + Math.pow(cy, 2) + Math.pow(cz, 2) + 
                Math.pow(x0, 2) + Math.pow(y0, 2) + Math.pow(z0, 2) -
                2 * (cx * x0 + cy * y0 + cz * z0) - Math.pow(R, 2);
        if (Math.pow(b, 2) - 4 * a * c < 0) {
            console.log("Error the ray don't hits the sphere");
            return;
        } else {
            var t0 = (- b - Math.sqrt(Math.pow(b, 2) - 4 * a * c)) / (2 * a);
            if(t0 < 0) {
                // ray inside a sphere
                t0 = (- b + Math.sqrt(Math.pow(b, 2) - 4 * a * c)) / (2 * a);
            }
            var resX = x0 + t0 * dx;
            var resY = y0 + t0 * dy;
            var resZ = z0 + t0 * dz;
            var result = $V(resX, resY, resZ);
            return result;
        }
    } else if (object instanceof Cylinder) {
    // check for cylinder
            
    } else {
    // check ellipsoid
        
    }
    
}

// calc the simple color with no shadows
function calcLight (sphere) {
    return sphere.getDiffuseMaterialColors();
    
}





function checkQuadricIntersection(ray, IExcept) {
    var dist = 0;
    var vecDist
    var curSmallestDist = Number.MAX_VALUE;
	var iObjectNr = -1;
    
        // TODO check if object is infornt of the camera


    
    for (var i = 0; i < obj.length; i++) {
        var hitPt = calcIntersectionPointQuadric(ray, obj[i]);
        if (hitPt) {
            vecDist = ray.getOrigin().subtract(hitPt);
            dist = vecDist.modulus();
                if(dist < curSmallestDist) {
                    if(IExcept != i) {
                       curSmallestDist = dist;
                       iObjectNr = i;
                    }
                }
        }
    }
    return iObjectNr;
}


function checkElipIntersection(ray, IExcept) {
    var distance = 0;
    var curSmallestDist = Number.MAX_VALUE;
	var iObjectNr = -1;
    
        // check if object is infornt of the camera

    var MtrsOrigin = $M([[ray.getOrigin().e(1)],
                         [ray.getOrigin().e(2)],
                         [ray.getOrigin().e(3)],
                         [1.0]]);
    var MtrsDirc = $M([[ray.getDirection().e(1)],
                       [ray.getDirection().e(2)],
                       [ray.getDirection().e(3)],
                       [1.0]]);
    
    for (var i = 0; i < obj.length; i++) {

        var tmpMtrsOrigin = obj[i].getInverse().multiply(MtrsOrigin);
        var tmpMtrsDirc = obj[i].getInverse().multiply(MtrsDirc);
        var vecTrsOrigin = $V(tmpMtrsOrigin.e(1,1), tmpMtrsOrigin.e(2,1), tmpMtrsOrigin.e(3,1));
        var vecTrsDirc = $V(tmpMtrsDirc.e(1,1), tmpMtrsDirc.e(2,1), tmpMtrsDirc.e(3,1));
        vecTrsDirc.toUnitVectorN();
        var center = obj[i].getSphere().getCenter();

        
        var distVec = center.subtract(vecTrsOrigin);
        //var distVec = center.subtract(vecTrsOrigin);
        distance = distVec.dot(vecTrsDirc);
        var dist = distVec.modulus();


        if(distance > 0) {
            var orthoVec = distVec.cross(vecTrsDirc);
            var distRayCenter = orthoVec.modulus() / vecTrsDirc.modulus(); 

            //check if the sphere is hit by the ray
            if(distRayCenter < obj[i].getSphere().getRadius()) {
                if(dist < curSmallestDist) {
                    if(IExcept != i) {
                       curSmallestDist = dist;
                       iObjectNr = i;
                    }
                }
            }
        }
        
    }
        
	
    return iObjectNr;
}