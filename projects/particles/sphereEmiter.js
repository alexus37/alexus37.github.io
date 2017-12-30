function SphereEmitter() {}
SphereEmitter.prototype = {
    //set the elements of the particle
    init: function() {
        this.MinimumRadius = 45;
        this.MaximumRadius = 50;
        this.MaxMass = 1;
        this.MinMass = 1000;
        
        this.MinInclination = 0;
        this.MaxInclination = 180;
        
        this.MinAzimuth = 0;
        this.MaxAzimuth = 360;
        
        this.MinSpeed = 25;
        this.MaxSpeed = 75;
        this.MinLifetime = 3;
        this.MaxLifetime = 10;
        this.Origin = new THREE.Vector3(0.0, 0.0, 0.0);

        return this;
    },
    setRadius: function(radius) {
        this.MaximumRadius = radius;
        return this;
    },
    setOrigin: function(origin) {
        this.Origin = origin;
        return this;
    },
    getRadius: function() {
        return this.MaximumRadius;
    },
    getOrigin: function() {
        return this.Origin;
    },
    
    
    
    EmitParticle: function() {
        var particle = $P();
        var inclination = THREE.Math.degToRad(THREE.Math.randFloat(this.MinInclination, this.MaxInclination));
        var azimuth = THREE.Math.degToRad( THREE.Math.randFloat(this.MinAzimuth, this.MaxAzimuth ) );

        var radius = THREE.Math.randFloat( this.MinimumRadius, this.MaximumRadius );
        var speed = THREE.Math.randFloat( this.MinSpeed, this.MaxSpeed );
        var lifetime = THREE.Math.randFloat( this.MinLifetime, this.MaxLifetime );
        

        var sInclination = Math.sin( inclination );

        var X = sInclination * Math.cos( azimuth );
        var Y = sInclination * Math.sin( azimuth );
        var Z = Math.cos( inclination );

        var vector = new THREE.Vector3( X, Y, Z );

        particle.m_Position.addVectors(this.Origin.clone(), (vector.clone().multiplyScalar(radius)));
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
SphereEmitter.create = function()  {
    var SE = new SphereEmitter();
    SE.init()
    return SE;
};

// Utility functions
var $SE = SphereEmitter.create;