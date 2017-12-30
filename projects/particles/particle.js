function Particle() {
    this.m_Position = new THREE.Vector3(0.0, 0.0, 0.0);
    this.m_Velocity = new THREE.Vector3(0.0, 0.0, 0.0);
    this.m_Acceleration = new THREE.Vector3(0.0, 0.0, 0.0);
    this.m_Color =  new THREE.Color("#00ff7f");
    this.m_fRotate = 0.0;
    this.m_fsize = 1.0;
    this.m_fAge = 0.0;
    this.m_fLifeTime = 1.0;
    this.m_mass = 1.0;
    this.m_alive = 1.0;
    
}
Particle.prototype = {
    //update the particle with delta time
    update: function(dt) {
        this.m_Position.add( this.m_Velocity.clone().multiplyScalar(dt) );
        this.m_Velocity.add( this.m_Acceleration.clone().multiplyScalar(dt) );
        
        this.m_fAge += dt;
        
        if  (this.m_fAge > this.m_fLifeTime) {
            this.m_alive = 0.0;
        }
        
    }
};
  
// Constructor function
Particle.create = function() {
    var P = new Particle();
    return P;
};

// Utility functions
var $P = Particle.create;

