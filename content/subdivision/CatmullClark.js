/*
 *	@author Romain Prévost (ETH Zürich / Disney Research Zürich)
 *  Original code by zz85 / http://twitter.com/blurspline / http://www.lab4games.net/zz85/blog
 */

CatmullClarkModifier = function( subdivisions ) {
	
	this.subdivisions = (subdivisions === undefined ) ? 1 : subdivisions;
	
};

CatmullClarkModifier.prototype.constructor = CatmullClarkModifier;

// Applies the "modify" pattern
CatmullClarkModifier.prototype.modify = function ( geometry ) {
	
	var repeats = this.subdivisions;
	
	while ( repeats-- > 0 ) {
		this.smooth( geometry );
	}

	/*
	 * THREE doesn't support Quad meshes anymore, so when the subdivision is done
	 * I convert the Quad faces to 2 Triangular faces
	 */
	var triFaces = [];
	for ( i = 0, il = geometry.faces.length; i < il; i++ ) {
		face = geometry.faces[ i ];
		if ( face instanceof THREE.Face3 ) {
			triFaces.push(face);
		}
		else if( face instanceof THREE.Face4 ) {
			triFaces.push(new THREE.Face3(face.a,face.b,face.c));
			triFaces.push(new THREE.Face3(face.c,face.d,face.a));
		}
	}
	geometry.faces = triFaces;
	/*
	 * done...
	 */

	delete geometry.__tmpVertices;

	geometry.computeFaceNormals();
	geometry.computeVertexNormals();
};

// Performs an iteration of Catmull-Clark Subdivision
CatmullClarkModifier.prototype.smooth = function ( geometry ) {

	function hashEdge( a, b ) {
		return Math.min( a, b ) + "_" + Math.max( a, b );
	}
	function getEdge( a, b, map ) {
		var key = hashEdge(a,b);
		return map[ key ];
	}
	function newFace( faces, a, b, c, d ) {
		faces.push( new THREE.Face4( a, b, c, d ) );
	}

    function oppositeVerticies(face, a, b ) {
        if ( face instanceof THREE.Face3 ) {
			if(face.a != a && face.a != b) return [face.a];
            if(face.b != a && face.b != b) return [face.b];
            if(face.c != a && face.c != b) return [face.c];
            console.log('Error: the opposite vertex couldn\'t be found');
		}
		else if( face instanceof THREE.Face4 ) {
            if(face.a == a && face.b == b || face.a == b && face.b == a ) return [face.c, face.d];
            if(face.b == a && face.c == b || face.b == b && face.c == a ) return [face.d, face.a];
            if(face.c == a && face.d == b || face.c == b && face.d == a ) return [face.a, face.b];
            if(face.d == a && face.a == b || face.d == b && face.a == a ) return [face.b, face.c];
            console.log('Error: the opposite vertex couldn\'t be found');
        }
	}
    function getLastVertex(face, x, y, z) {
        var vtx = [x , y , z];
        if(vtx.indexOf(face.a) == -1) return face.a;
        if(vtx.indexOf(face.b) == -1) return face.b;
        if(vtx.indexOf(face.c) == -1) return face.c;
        if(vtx.indexOf(face.d) == -1) return face.d;
        console.log('Error: the opposite vertex couldn\'t be found');
    }
    
	function computeCentroid( face, vertices ) {
		var centroid = new THREE.Vector3();
		centroid.set(0, 0, 0);

		if ( face instanceof THREE.Face3 ) {
			centroid.add( vertices[ face.a ] );
			centroid.add( vertices[ face.b ] );
			centroid.add( vertices[ face.c ] );
			centroid.divideScalar( 3 );
		} else if ( face instanceof THREE.Face4 ) {
			centroid.add( vertices[ face.a ] );
			centroid.add( vertices[ face.b ] );
			centroid.add( vertices[ face.c ] );
			centroid.add( vertices[ face.d ] );
			centroid.divideScalar( 4 );
		}

		return centroid;
	}

	function processEdge( vA, vB, edgeMap, faceId, vvMap ) {

		var key = hashEdge(vA,vB);
		var edge;

		if ( key in edgeMap ) {
			edge = edgeMap[ key ];
		} else {

			edge = {
				a: vA, // oldVertex i
				b: vB, // oldVertex j
				newVertex: null, // use this know the new vertex index
				faces: [] // neighboring faces
			};

			edgeMap[ key ] = edge;
			vvMap[ vA ].push( vB );
			vvMap[ vB ].push( vA );
		}

		edge.faces.push( faceId );
	}

	var i, il;

	/******************************************************
	 *
	 * Preprocess Geometry to generate connectivity Lookup
	 *
	 *******************************************************/

	var oldVertices = geometry.vertices;
	var oldFaces = geometry.faces;
	var oldEdges = {}; // hash map storing information for each edge. for an edge between vertices i and j, the key is hashEdge(i,j) and the value is getEdge(oldEdges,i,j) == oldEdge[hashMap(i,j)]. see processEdge for details
	var vvMap = new Array( oldVertices.length ); // for each vertex i, vvMap[i] is an array with the neighboring vertices
	var vfMap = new Array( oldVertices.length ); // for each vertex i, vfMap[i] is an array with the neighboring faces
	for ( i = 0, il = oldVertices.length; i < il; i++ ) {
		vvMap[ i ] = [];
		vfMap[ i ] = [];
	}

	var face;
	for ( i = 0, il = oldFaces.length; i < il; i++ ) {
		face = oldFaces[ i ];
		if ( face instanceof THREE.Face3 ) {
			processEdge(face.a, face.b, oldEdges, i, vvMap);
			processEdge(face.b, face.c, oldEdges, i, vvMap);
			processEdge(face.c, face.a, oldEdges, i, vvMap);
			vfMap[face.a].push(i);
			vfMap[face.b].push(i);
			vfMap[face.c].push(i);
		}
		else if( face instanceof THREE.Face4 ) {
			processEdge(face.a, face.b, oldEdges, i, vvMap);
			processEdge(face.b, face.c, oldEdges, i, vvMap);
			processEdge(face.c, face.d, oldEdges, i, vvMap);
			processEdge(face.d, face.a, oldEdges, i, vvMap);
			vfMap[face.a].push(i);
			vfMap[face.b].push(i);
			vfMap[face.c].push(i);
			vfMap[face.d].push(i);
		}
	}

	/******************************************************
	 *
	 *	For each face, create a new Face Vertex
	 *
	 *******************************************************/
	var newFaceVertices = [];
    var newFaceVtxCnt = 0;
    var face;

    //loop over all faces
	for ( i = 0, il = oldFaces.length; i < il; i++ ) {
		face = oldFaces[ i ]; 
        // compute a point in the midle of the face
        newFaceVertices[newFaceVtxCnt] = computeCentroid(face, oldVertices);
        newFaceVtxCnt++;
    }

	/******************************************************
	 *
	 *	For each edge, create a new Edge Vertex
	 *
	 *******************************************************/

	var newEdgeVertices = [];
    var edgeVertexCnt = 0;
    
    var curEdge;
    var edgeVertex = new THREE.Vector3();
    var edgeVtxAVG = new THREE.Vector3();
    var centerVtxAVG = new THREE.Vector3();
    //loop over all edges
    for(i in oldEdges){
        //var weightEven = 3 / 8;
        //var weightOdd = 1 / 16;
        curEdge = oldEdges[i];
        //var NrVtx = 2 + curEdge.faces.length;
        
        // check if the current edge is on the border
        if(curEdge.faces.length != 2) {
            //alter the weights because edge is at the border
            //weightEven = 0.5;
            //weightOdd = 0;
            if(curEdge.faces.length != 1) {
                console.log('Error edge is not conected to a one or two faces');
            }
        }
        
        // first part weight the even verticies
        edgeVtxAVG.set( 0, 0, 0 );
        edgeVtxAVG.addVectors(oldVertices[curEdge.a], oldVertices[curEdge.b]);
        edgeVtxAVG.multiplyScalar(1 / 2);
   
        //get the other vertex of the touched faces
        centerVtxAVG.set( 0, 0, 0 );
        for(var j = 0; j < curEdge.faces.length; j++) {
            //get the index of the current face
            var faceIndex = curEdge.faces[j];
            //get the touched face
            var curFace = oldFaces[faceIndex];
            // get the two oposit vertex indices
            centerVtxAVG.add(computeCentroid(curFace, oldVertices));
        }
        centerVtxAVG.multiplyScalar(1 / curEdge.faces.length);
        
        edgeVertex.set( 0, 0, 0 );
        edgeVertex.addVectors(edgeVtxAVG, centerVtxAVG);
        edgeVertex.multiplyScalar(1 / 2);
        
        //add the new vertex
        newEdgeVertices[edgeVertexCnt] = edgeVertex.clone();
        curEdge.newVertex = edgeVertexCnt;
        edgeVertexCnt++;
    }
	
	/******************************************************
	 *
	 *	Reposition each source vertices.
	 *
	 *******************************************************/

	var newSourceVertices = [];
    var newSVtxCnt = 0;
    //loop over all old verticies
    for(var i = 0; i < oldVertices.length; i++) {
        vertex = oldVertices[i];
        // get the connected faces and verticies
        var connFaces = vfMap[i];
        var connVerticies = vvMap[i];
        //number of adjacent verticies and faces
        var n = connVerticies.length;
        var m = connFaces.length;
        var val = new THREE.Vector3();
        //var tmp = new THREE.Vector3();
        //args for triangles
        var Q = new THREE.Vector3();
        var R = new THREE.Vector3();
        var S = new THREE.Vector3();
        S.copy(vertex);
        S.multiplyScalar((n - 3) / n);
        
        //Q the average of the new face points of all faces adjacent to the old vertex point
        Q.set(0, 0, 0);
        for(var j = 0; j < m; j++) {
            face = oldFaces[connFaces[j]];
            Q.add(computeCentroid(face, oldVertices));
        }
        Q.multiplyScalar(1 / m);
        Q.multiplyScalar(1 / n);
        
        //R the average of the midpoints of all edges incident on the old vertex point
        R.set(0, 0, 0);
        for(var j = 0; j < n; j++) {
            var curEdge = getEdge(i, connVerticies[j], oldEdges);
            R.add(newEdgeVertices[curEdge.newVertex]);
        }
        R.multiplyScalar(1 / n);
        R.multiplyScalar(2 / n);
        
        
        //store the value
        val.set(0, 0, 0);
        val.addVectors(Q,R);
        val.add(S);
        newSourceVertices[newSVtxCnt] = val.clone();
        newSVtxCnt++; 
        
    }
    
	var newVertices = newSourceVertices.concat(newFaceVertices,newEdgeVertices);

	/******************************************************
	 *
	 *	Generate the faces
	 *
	 *******************************************************/

	var newFaces = [];
    var il = oldFaces.length;
    var offset1 = newSourceVertices.length;
    var offset2 = offset1 + newFaceVertices.length;
	for (var i = 0; i < il; i++ ) {
		face = oldFaces[ i ];
        //get the old edges
        if(face instanceof THREE.Face4) {
            var e1 = getEdge(face.a, face.b, oldEdges);
            var e2 = getEdge(face.b, face.c, oldEdges);
            var e3 = getEdge(face.c, face.d, oldEdges);
            var e4 = getEdge(face.d, face.a, oldEdges);
            var newE1 = e1.newVertex + offset2;
            var newE2 = e2.newVertex + offset2;
            var newE3 = e3.newVertex + offset2;
            var newE4 = e4.newVertex + offset2;
            var newF = offset1 + i;
            // for each face add 4 new faces
            newFace(newFaces, face.a, newE1, newF, newE4);
            newFace(newFaces, face.b, newE2, newF, newE1);
            newFace(newFaces, face.c, newE3, newF, newE2);
            newFace(newFaces, face.d, newE4, newF, newE3);
        } else {
            var e1 = getEdge(face.a, face.b, oldEdges);
            var e2 = getEdge(face.b, face.c, oldEdges);
            var e3 = getEdge(face.c, face.a, oldEdges);

            var newE1 = e1.newVertex + offset2;
            var newE2 = e2.newVertex + offset2;
            var newE3 = e3.newVertex + offset2;
            var newF = offset1 + i;
            // for each face add 4 new faces
            newFace(newFaces, face.a, newE1, newF, newE3);
            newFace(newFaces, face.b, newE2, newF, newE1);
            newFace(newFaces, face.c, newE3, newF, newE2);
            //newFaces.push( new THREE.Face3(newE1, newE2, newE3) );
        }
	}


	// Overwrite old arrays
	geometry.vertices = newVertices;
	geometry.faces = newFaces;
	
};
