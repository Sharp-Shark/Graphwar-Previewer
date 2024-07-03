class draw {
    static width = 1;
    static color = 'black';
    static font = '"Lucida Console", "Courier New", monospace'
    static images = {};
    static clear () {
        ctx.clearRect(0, 0, screen.width, screen.height);
        //ctx.beginPath();
    };
    static circle (vector, radius) {
        ctx.arc(vector.x, vector.y, radius, 0, Math.PI*2);
    };
    static circleStroke (vector, radius) {
        ctx.lineWidth = this.width;
        ctx.strokeStyle = this.color;
        ctx.beginPath();
        this.circle(vector, radius);
        ctx.stroke()
    };
    static circleFill (vector, radius) {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        this.circle(vector, radius);
        ctx.fill();
    };
    static line (vectorStart, vectorEnd) {
        ctx.moveTo(vectorStart.x, vectorStart.y);
        ctx.lineTo(vectorEnd.x, vectorEnd.y);
    };
    static lineStroke (vectorStart, vectorEnd, cap=false) {
        ctx.lineWidth = this.width;
        ctx.strokeStyle = this.color;
        ctx.beginPath();
        this.line(vectorStart, vectorEnd);
        ctx.stroke();
        if(cap) {
            this.circleFill(vectorStart, this.width/2);
            this.circleFill(vectorEnd, this.width/2);
        };
    };
    static fillText (text, size, align, vector) {
        ctx.beginPath();
        ctx.fillStyle = this.color;
        ctx.font = (size || 24) + 'px ' + this.font;
        ctx.textAlign = align || 'left';
        ctx.fillText(text, vector.x, vector.y);
    };
    static loadImage (name, src) {
        let image = new Image();
        image.src = src;
        this.images[name] = image;
    };
    static drawImage (name, pos, size) {
        ctx.drawImage(this.images[name], pos.x - size.x / 2, pos.y - size.y / 2, size.x, size.y);
    };
};

draw.loadImage('screenshot', 'screenshot.png');