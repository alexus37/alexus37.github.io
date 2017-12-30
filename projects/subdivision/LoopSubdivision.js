/*
 *	@author Romain Prévost (ETH Zürich / Disney Research Zürich)
 *  Original code by zz85 / http://twitter.com/blurspline / http://www.lab4games.net/zz85/blog
 */

LoopSubdivisionModifier = function ( subdivisions ) {

	this.subdivisions = (subdivisions === undefined ) ? 1 : subdivisions;

};

// Applies the "modify" pattern
LoopSubdivisionModifier.prototype.modify = function ( geometry ) {

	var repeats = this.subdivisions;

	while ( repeats-- > 0 ) {
		this.smooth( geometry );
	}

	delete geometry.__tmpVertices;

	geometry.computeFaceNormals();
	geometry.computeVertexNormals();

};

// Performs one iteration of Subdivision
LoopSubdivisionModifier.prototype.smooth = function ( geometry ) {

	function hashEdge( a, b ) {
		return Math.min( a, b ) + "_" + Math.max( a, b );
	}
	function getEdge( a, b, map ) {
		var key = hashEdge(a,b);
		return map[ key ];
	}
	function newFace( faces, a, b, c ) {
		faces.push( new THREE.Face3( a, b, c ) );
	}
	function oppositeVertex( face, a, b ) {
		if(face.a != a && face.a != b) return face.a;
		if(face.b != a && face.b != b) return face.b;
		if(face.c != a && face.c != b) return face.c;
		console.log('Error: the opposite vertex couldn\'t be found');
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
	for ( i = 0, il = oldVertices.length; i < il; i++ ) {
		vvMap[ i ] = [];
	}

	var face;
	for ( i = 0, il = oldFaces.length; i < il; i++ ) {
		face = oldFaces[ i ];
		processEdge( face.a, face.b, oldEdges, i, vvMap );
		processEdge( face.b, face.c, oldEdges, i, vvMap );
		processEdge( face.c, face.a, oldEdges, i, vvMap );
	}

	/******************************************************
	 *
	 *	For each edge, create a new Edge Vertex
	 *
	 *******************************************************/
	var newEdgeVertices = [];
    var edgeVertexCnt = 0;
    
    var curEdge;
    var edgeVertex;
    
    
    var debug = false;
    //loop over all edges
    for(i in oldEdges){
        var weightEven = 3 / 8;
        var weightOdd = 1 / 8;
        curEdge = oldEdges[i];
        
        // check if the current edge is on the border
        if(curEdge.faces.length != 2) {
            //alter the weights because edge is at the border
            weightEven = 0.5;
            weightOdd = 0;
            if(curEdge.faces.length != 1) {
                console.log('Error edge is not conected to a one or two faces');
            }
        }
        
        // first part weight the even verticies
        edgeVertex = new THREE.Vector3();
        edgeVertex.addVectors(oldVertices[curEdge.a], oldVertices[curEdge.b]);
        edgeVertex.multiplyScalar(weightEven);

        if(weightOdd != 0) {
            //get the other vertex of the touched faces
            for(var j = 0; j < curEdge.faces.length; j++) {
                //get the index of the current face
                var faceIndex = curEdge.faces[j];
                //get the touched face
                var curFace = oldFaces[faceIndex];
                // get the optosit vertex index
                var oppVtxIndex = oppositeVertex(curFace, curEdge.a, curEdge.b);
                // get the vertex
                var oppVtx = oldVertices[oppVtxIndex];
                //orig
                var cpyOppVtx = new THREE.Vector3();
                cpyOppVtx.copy(oppVtx);
                //multiply with the odd weight
                cpyOppVtx.multiplyScalar(weightOdd);
                //add to the edge
                edgeVertex.add(cpyOppVtx);
            }
        }
        
        
        //add the new vertex    
        newEdgeVertices[edgeVertexCnt] = edgeVertex;
        curEdge.newVertex = edgeVertexCnt;
        edgeVertexCnt++;
    }



	/******************************************************
	 *
	 *	Reposition each source vertices.
	 *
	 *******************************************************/

	var newSourceVertices = [];
    var sVtxCnt = 0;
    var loop = true;

    //loop over all old source verticies

    for(var i = 0; i < oldVertices.length; i++) {
        var curVertex = oldVertices[i];

        //check the valenz
        //get the connected verticies
        var connVtx = vvMap[i];
        var n = connVtx.length;
        var beta;
        var oneMinusBeta;
        //regular case 3 verticies (midle of the mesh)
        if(n == 3) {
            beta = 3 / 16;
        } else if(n == 2) {
            beta = 1 / 8;
        } else {
            //irregular case
            //loops method
            if(loop) {
                beta = (1 / n) * ((5 / 8) - Math.pow((3 / 8) + (1 / 4) * Math.cos(2 * Math.PI / n), 2));
            } else {
                //warrens method
                if(n > 3) {
                    beta = 3 / (8 * n);
                } else {
                    console.log('Error only one connected vertex');
                }
            }
        }
        oneMinusBeta = 1 - (n * beta);
        // weight all neightbouring nodes
        var val = new THREE.Vector3();
        for(var k = 0; k < connVtx.length; k++){
            val.add(oldVertices[connVtx[k]]);
        }
        val.multiplyScalar(beta);
        //weight the source vertex
        var curVertexWeight = new THREE.Vector3();
        curVertexWeight.copy(curVertex);
        curVertexWeight.multiplyScalar(oneMinusBeta);
        val.add(curVertexWeight);
        // add the new value
        newSourceVertices[sVtxCnt] = val;
        sVtxCnt++;

    }



	var newVertices = newSourceVertices.concat(newEdgeVertices);
						   
	/******************************************************
	 *
	 *	Generate the faces
	 *
	 *******************************************************/

	var newFaces = [];
    var face;
    var il = oldFaces.length;
    var offset = newSourceVertices.length;
	for (var i = 0; i < il; i++ ) {
		face = oldFaces[ i ];
        //get the old edges
        var e1 = getEdge(face.a, face.b, oldEdges);
        var e2 = getEdge(face.b, face.c, oldEdges);
        var e3 = getEdge(face.c, face.a, oldEdges);
        var newE1 = e1.newVertex + offset;
        var newE2 = e2.newVertex + offset;
        var newE3 = e3.newVertex + offset;
        // for each face add 4 new faces
        newFace(newFaces, face.a, newE1, newE3);
        newFace(newFaces, face.b, newE2, newE1);
        newFace(newFaces, face.c, newE3, newE2);
        //midle face
        newFace(newFaces, newE1, newE2, newE3);
	}


	// Overwrite old arrays
	geometry.vertices = newVertices;
	geometry.faces = newFaces;

};

