class Vector {
    static zero = new Vector(0, 0);
    static up = new Vector(0, 1);
    static left = new Vector(-1, 0)
    static down = new Vector(0, -1);
    static right = new Vector(1, 0);
    constructor (x=0, y=0) {
        this.x = x;
        this.y = y;
    };
    set (vector) {
        this.x = vector.x;
        this.y = vector.y;
        return this;
    };
    get angle () {
        return Math.atan2(this.y, this.x);
    };
    set angle (angle) {
        this.set(this.rotate(angle - this.angle));
        return this;
    };
    setAngle (angle) {
        this.angle = angle;
        return this;
    };
    get scaler () {
        return Math.sqrt(this.x**2 + this.y**2);
    }
    set scaler (scaler) {
        if(this.scaler == 0) {return this;};
        this.set(this.scale(scaler / this.scaler));
        return this;
    };
    setScaler (scaler) {
        this.scaler = scaler;
        return this;
    };
    clamp (scaler) {
        if(this.scaler > scaler) {this.scaler = scaler};
        return this;
    };
    getDistTo (vector) {
        return this.translate(vector.reflect()).scaler;
    };
    lerp (vector, scaler) {
        return new Vector(Math.lerp(this.x, vector.x, scaler), Math.lerp(this.y, vector.y, scaler));
    };
    flipX () {
        return new Vector(0-this.x, this.y);
    };
    flipY () {
        return new Vector(this.x, 0-this.y);
    };
    reflect () {
        return this.scale(-1);
    };
    invert () {
        return new Vector(1 / this.x, 1 / this.y);
    };
    translate (vector) {
        return new Vector(this.x + vector.x, this.y + vector.y)
    };
    subtract (vector) {
        return this.translate(vector.reflect());
    };
    translatePolar (scaler, angle) {
        return this.translate(new Vector(scaler, 0).rotate(angle));
    };
    rotate (angle) {
        let scaler = this.scaler;
        let a = this.angle;
        return new Vector(Math.cos(a + angle) * scaler, Math.sin(a + angle) * scaler);
    };
    scale (scaler) {
        return new Vector(this.x * scaler, this.y * scaler);
    };
    scaleByVector (vector) {
        return new Vector(this.x * vector.x, this.y * vector.y);
    };
    dotProduct (vector) {
        return this.scaler * vector.scaler * Math.cos(this.angle - vector.angle);
    };
    moveTowards (vector, scaler) {
        return this.translate(vector.translate(this.reflect()).setScaler(scaler));
    };
    moveTowardsClamped (vector, scaler) {
        return this.moveTowards(vector, Math.min(scaler, this.getDistTo(vector)));
    };
    worldToScreen (cam) {
        return this.translate(cam.pos.reflect()).rotate(cam.angle).scale(cam.zoom).flipY().translate(new Vector(screen.width/2, screen.height/2));
    };
    screenToWorld (cam) {
        return this.translate(new Vector(screen.width/-2, screen.height/-2)).flipY().scale(1/cam.zoom).rotate(0-cam.angle).translate(cam.pos);
    };
};