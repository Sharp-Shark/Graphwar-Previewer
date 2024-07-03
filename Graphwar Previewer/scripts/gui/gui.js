class Gbase {
    constructor (name, offset, scale) {
        this.guiType = 'base';
        this.name = name;
        this.offset = offset;
        this.scale = scale;
        this.parent = undefined;

        this.data = {};

        this.elements = [];

        this.active = true;
    };
    get pos () {
        if(this.parent == undefined) {
            return new Vector(screen.width/2, screen.height/2);
        };
        return this.parent.pos.translate(this.parent.pos.scaleByVector(this.offset));
    };
    set pos (vector) {
        if(this.parent == undefined) {
            return this;
        };
        this.offset.x = (vector.x - this.parent.pos.x) / this.parent.pos.x;
        this.offset.y = (vector.y - this.parent.pos.y) / this.parent.pos.y;
        return this;
    };
    get size () {
        if(this.parent == undefined) {
            return new Vector(screen.width, screen.height);
        };
        return this.parent.size.scaleByVector(this.scale);
    };
    set size (vector) {
        if(this.parent == undefined) {
            return this;
        };
        this.scale.x = vector.x / this.parent.size.x;
        this.scale.y = vector.y / this.parent.size.y;
        return this;
    };
    get index () {
        for(let index in this.parent.elements) {
            if(this == this.parent.elements[index]) {
                return index;
            };
        };
        return undefined;
    };
    get activeElements () {
        let elements = [];
        for(let element of this.elements) {
            if(element.active) {
                elements.push(element);
            };
        };
        return elements
    };
    update (delta) {
        if(!this.active) {return;};
        this.updateLogic(delta);
        this.render(delta);
        for(let element of this.elements) {
            element.parent = this;
            element.update(delta);
        };
    };
    updateLogic (delta) {
    };
    render (delta) {
    };
    findElementByName (name) {
        if(this.name == name) {
            return this;
        } else {
            for(let index in this.elements) {
                let element = this.elements[index].findElementByName(name);
                if(element != undefined) {
                    return element;
                };
            };
        };
        return undefined;
    };
};

class Gbox extends Gbase {
    constructor (name, offset, scale) {
        super(Gbase);
        this.guiType = 'box';
        this.name = name;
        this.offset = offset;
        this.scale = scale;
        this.parent = undefined;

        this.data = {};

        this.elements = [];

        this.active = true;
    };
    render (delta) {
        ctx.fillStyle = this.data.color;
        ctx.beginPath();
        ctx.rect(this.pos.x - this.size.x/2, this.pos.y - this.size.y/2, this.size.x, this.size.y);
        ctx.fill();
    };
};

class Gtext extends Gbase {
    constructor (name, offset, scale) {
        super(Gbase);
        this.guiType = 'text';
        this.name = name;
        this.offset = offset;
        this.scale = scale;
        this.parent = undefined;

        this.data = {};

        this.elements = [];

        this.active = true;
    };
    updateLogic (delta) {
        this.pos = new Vector(this.parent.pos.x - this.parent.size.x * (1 / 2.05), this.parent.pos.y - this.parent.size.y / 2 + this.parent.size.y * (this.index / this.parent.elements.length));
        this.data.textSize = 24 * (screen.height / 943);
    };
    render (delta) {
        draw.fillText(this.data.text, this.data.textSize, this.textAlign, this.pos.translate(new Vector(0, this.data.textSize * 1.25)));
    };
};

let gui = new Gbase('gui', new Vector(0, 0), new Vector(1, 1));

let gui_textBox = new Gbox('textBox', new Vector(-0.8, -0.9), new Vector(0.2, 0.1))
gui_textBox.data.color = 'rgba(255, 255, 255, 0.2)';
gui.elements.push(gui_textBox);

let gui_text = new Gtext('textQuadtree', new Vector(-0.95, -0.5), new Vector(0, 0))
gui_text.data.text = 'lorem ipsum';
gui_text.data.textSize = 24;
gui_text.textAlign = 'left';
gui_textBox.elements.push(gui_text);

gui.active = false;