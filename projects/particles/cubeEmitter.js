function cubeEmitter() {}
cubeEmitter.prototype = {
    //set the elements of the particle
    init: function() {
        this.MinWidth = -10;
        this.MaxWidth = 10;
        this.MaxMass = 1;
        this.MinMass = 1000;
        
        this.MinHeight = -10;
        this.MaxHeight = 10;
        
        this.MinDepth = -10;
        this.MaxDepth = 10;
        
        this.MinSpeed = 25;
        this.MaxSpeed = 75;
        this.MinLifetime = 3;
        this.MaxLifetime = 10;
        this.Origin = new THREE.Vector3(0.0, 0.0, 0.0);

        return this;
    },  
  
    
    EmitParticle: function() {
        var particle = $P();
        
        var speed = THREE.Math.randFloat( this.MinSpeed, this.MaxSpeed );
        var lifetime = THREE.Math.randFloat( this.MinLifetime, this.MaxLifetime );

        
        var X = THREE.Math.randFloat( this.MinWidth, this.MaxWidth );
        var Y = THREE.Math.randFloat( this.MinHeight, this.MaxHeight );
        var Z = THREE.Math.randFloat( this.MinDepth, this.MaxDepth );

        var vector = new THREE.Vector3( X, Y, Z );

        particle.m_Position.addVectors(this.Origin.clone(), vector.clone());
        particle.m_Velocity = vector.clone().multiplyScalar(speed);

        particle.m_fLifeTime = lifetime;
        particle.m_fAge = 0;
        particle.m_mass = THREE.Math.randFloat(this.MinMass , this.MaxMass);
    
        return particle;
    },
    
    EmitParticles: function(numberOfParitcles) {
        var paricles = new Array(numberOfParitcles); 
        
        for(var i = 0; i < numberOfParitcles; i++) {
            paricles[i] = this.EmitParticle();
        }
        
        return paricles;
    }

};
  
// Constructor function
cubeEmitter.create = function()  {
    var CE = new cubeEmitter();
    CE.init()
    return CE;
};

// Utility functions
var $CE = cubeEmitter.create;