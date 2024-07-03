let screen = document.getElementById('screen');
screen.x = screen.getBoundingClientRect().left;
screen.y = screen.getBoundingClientRect().top;
let ctx = screen.getContext("2d");

function lerp (n, min=0, max=1) {
    return min*(1-n) + max*(n);
};
function invLerp (n, min=0, max=1) {
    return (n-min)/(max-min);
};

// range [0, 2*Math.PI[
function limitAngle (angle) {
    return (angle < 0 ? Math.PI - angle : angle) % (Math.PI * 2);
};

function triangleIK (length1, length2, target, direction) {
    // length1 is the length of the first line segment
    // length2 is the length of the second line segment
    let distance = Math.max(Math.min(target.scaler, length1 + length2), Math.abs(length1 - length2));
    let angle = Math.acos((length1**2 + distance**2 - length2**2) / (2 * length1 * distance)) // a² = b² + c² - 2 * b * c * cos(x)
    let midpoint = new Vector(length1);
    // direction defines which way the midpoint bends
    midpoint = midpoint.rotate(target.angle + angle * direction);
    // to calculate endpoint do "midpoint.moveTowards(target, length2)"
    return midpoint;
};

function resizeCanvas (mode) {
    if(mode == 'default' || mode == undefined) {
        screen.width = document.documentElement.clientWidth - 4;
        screen.height = document.documentElement.clientHeight - 4;
        document.getElementById('debug').style.display = 'none';
    } else if(mode == 'debug') {
        screen.width = document.documentElement.clientWidth - 4;
        screen.height = document.documentElement.clientHeight * 4 / 5 - 4;
        document.getElementById('debug').style.display = 'initial';
    };
};

function submitImage(event) {
    /*
	let image = document.getElementById('debugImage').src;
    draw.loadImage('barodev', image);
    */
    var selectedFile = event.target.files[0];
    var reader = new FileReader();

    var imgtag = new Image();
    imgtag.title = selectedFile.name;

    reader.onload = function(event) {
        imgtag.src = event.target.result;
    };

    reader.readAsDataURL(selectedFile);
    draw.images['screenshot'] = imgtag;
};

// Optimizations
let useQuadtree = true;
let useCulling = true;

// Debugging
let drawQuadtree = false;
let drawColliders = true;
let canvasSize = 'default';
let imageSmoothing = false;
resizeCanvas(canvasSize);

// Define entityManager
let entityManager = new EntityManager();

// Define camera
let cam = new Camera(new Vector());
let space = new Vector(1_000, 600);

// Stops main loop
let noLoop = false;
let windowWasOutOfFocus = false;

// Time keeping
let paused = false;
let previousTime = 0;
let frame = 0;
let delta = 0;
let deltaMultiplier = 1;

// Line creation
let lineStartPosEntity = undefined;
let lines = [];
let moveOffset = undefined;

// Main function
function main (time) {
    if(time - previousTime > 1000) {
        windowWasOutOfFocus = true;
    };
    if(windowWasOutOfFocus) {
        previousTime = time - 1/60;
        windowWasOutOfFocus = false;
        requestAnimationFrame(main);
        return;
    };
    delta = time - previousTime;
    delta = delta * deltaMultiplier;
    previousTime = time;

    // clear screen
    ctx.clearRect(0, 0, screen.width, screen.height);
    // disable anti-aliasing for pixelated look on lowres images
    ctx.imageSmoothingEnabled = imageSmoothing;
    // screenshot render
    draw.drawImage('screenshot', new Vector().worldToScreen(cam), space.scale(cam.zoom));

    cam.update();

    input.updateWorldMouse();

    // Draw line
    let lineIndex = 0;
    for(let line of lines) {
        draw.color = '#FF00FF';
        if(lineIndex + 1 == lines.length) {
            draw.color = '#FFAAFF';
        };
        draw.width = 5 * cam.zoom;
        draw.lineStroke(line.pos.worldToScreen(cam), line.endPos.worldToScreen(cam), true);
        draw.color = 'black';
        let v = new Vector(lerp(0.5, line.pos.x, line.endPos.x), lerp(0.5, line.pos.y, line.endPos.y) - 8);
        draw.fillText(lineIndex + 1, 18 * cam.zoom, 'center', v.worldToScreen(cam));
        lineIndex++;
    };
    if(lineStartPosEntity != undefined && input.mouse.closestEntity != undefined) {
        draw.color = 'yellow';
        draw.width = 5 * cam.zoom;
        draw.lineStroke(lineStartPosEntity.pos.worldToScreen(cam), input.mouse.closestEntity.pos.worldToScreen(cam), true);
    };

    if(!paused) {
        entityManager.updateEntities();
    };
    entityManager.renderEntities(cam);

    // Get closest entity to cursor
    if(!input.getBindState('movePoint') || input.mouse.closestEntity == undefined) {
        moveOffset = undefined;
        input.mouse.closestEntity = undefined;
        for(let entity of entityManager.entities) {
            if(entity == lineStartPosEntity) {continue;};
            if(lineStartPosEntity != undefined && lineStartPosEntity.pos.x > entity.pos.x) {continue;};
            if(input.mouse.closestEntity == undefined) {
                input.mouse.closestEntity = entity;
            } else if(entity.pos.getDistTo(input.mouse.worldPos) < input.mouse.closestEntity.pos.getDistTo(input.mouse.worldPos)) {
                input.mouse.closestEntity = entity;
            };
        };
    } else {
        if(moveOffset == undefined) {
            moveOffset = input.mouse.closestEntity.pos.subtract(input.mouse.worldPos);
        };
        // Move entity
        input.mouse.closestEntity.pos = input.mouse.worldPos.translate(moveOffset);
    };
    // Draw yellow outline for selected
    if(input.mouse.closestEntity != undefined) {
        draw.color = 'yellow';
        draw.width = 4 * cam.zoom;
        draw.circleStroke(input.mouse.closestEntity.pos.worldToScreen(cam), input.mouse.closestEntity.radius * cam.zoom);
    };
    // Draw yellow outline for line start position entity
    if(lineStartPosEntity != undefined) {
        draw.color = 'orange';
        draw.width = 4 * cam.zoom;
        draw.circleStroke(lineStartPosEntity.pos.worldToScreen(cam), lineStartPosEntity.radius * cam.zoom);
    };

    if(drawQuadtree) {
        entityManager.collisionBlock.render(cam);
    };

    // Cursor
    if(input.mouse.down) {
        draw.color = 'yellow';
        draw.circleFill(input.mouse.pos, 6);
        draw.color = 'black';
        draw.circleFill(input.mouse.pos, 4);
    } else {
        draw.color = 'black';
        draw.circleFill(input.mouse.pos, 6);
        draw.color = 'yellow';
        draw.circleFill(input.mouse.pos, 4);
    };

    // Text
    draw.color = 'white';
    draw.fillText('Graphwar Previewer by Sharp-Shark!', 24 * cam.zoom, 'left', new Vector(space.x / -2, space.y / 2 + 8).worldToScreen(cam));
    draw.fillText('Press [H] for Help. Press [T] for Settings.', 24 * cam.zoom, 'left', new Vector(space.x / -2, space.y / -2 - 24).worldToScreen(cam));

    gui.update();

    frame++;
    if(!noLoop) {requestAnimationFrame(main);};
};

input.onBindDown['help'] = function () {
    windowWasOutOfFocus = true;
    let text = '';
    for(let index in input.keyBinds) {
        if(index != '') {
            text = text + '[' + input.keyBinds[index] + '] = ' + index + ';\n';
        };
    };
    window.alert(text);
};

input.onBindDown['toggleCanvasSize'] = function () {
    if(canvasSize == 'default') {
        canvasSize = 'debug';
    } else {
        canvasSize = 'default';
    };
    resizeCanvas(canvasSize);
};

input.onBindDown['addPoint'] = function () {
    let entity = new Entity(input.mouse.worldPos, 10);
    entityManager.initEntity(entity);
};

input.onBindDown['deletePoint'] = function () {
    if(input.mouse.closestEntity != undefined) {
        entityManager.deleteEntity(input.mouse.closestEntity);
        input.mouse.closestEntity = undefined;
    };
};

input.onBindDown['deleteAll'] = function () {
    input.mouse.closestEntity = undefined;
    lineStartPosEntity = undefined;
    entityManager.entities = [];
    lines = [];
};

input.onBindDown['togglePoint'] = function () {
    if(input.mouse.closestEntity != undefined) {
        input.mouse.closestEntity.isDead = !input.mouse.closestEntity.isDead;
    };
};

input.onBindDown['labelPoint'] = function () {
    if(input.mouse.closestEntity != undefined) {
        let prompt = window.prompt();
        input.mouse.closestEntity.name = prompt;
        if(prompt == '') {
            input.mouse.closestEntity.name = undefined;
        };
    };
};

input.onBindDown['addLine'] = function () {
    if(input.getBindState('movePoint')) {return;};
    if(input.mouse.closestEntity == undefined) {return;};
    if(lineStartPosEntity == undefined) {
        lineStartPosEntity = input.mouse.closestEntity;
    } else {
        let line = new Line(lineStartPosEntity.pos, input.mouse.closestEntity.pos);
        lines.push(line);
        lineStartPosEntity = undefined;
    };
};

input.onBindDown['undoLine'] = function () {
    if(lineStartPosEntity == undefined) {
        lines.pop();
    } else {
        lineStartPosEntity = undefined;
    };
};

input.onBindDown['toggleImageSmoothing'] = function () {
    imageSmoothing = !imageSmoothing;
};

// Generate function subfunctions
function fLerp (a, b, c) {
    return '({a}(1-({c}))+{b}{c})'.replace('{a}', a).replace('{b}', b).replace('{c}', c).replace('{c}', c);
};
function fLogistical (n) {
    return '(1/(1+exp(-25({n}))))'.replace('{n}', n);
};
function fLineRaw (o, p, k) {
    let a = '{k}(x-{o})'.replace('{k}', k).replace('{o}', o);
    let b = '{k}({p}-{o})'.replace('{k}', k).replace('{o}', o).replace('{p}', p);;
    let c = fLogistical('x-{p}'.replace('{p}', p));
    let lerp = fLerp(a, b, c);
    return lerp + fLogistical('x-{o}'.replace('{o}', o));
};
function fLine (px, py, tx, ty) {
    let k = '({ty}-{py})/({tx}-{px})'.replace('{px}', px).replace('{py}', py).replace('{tx}', tx).replace('{ty}', ty);
    return '('+fLineRaw(px, tx, k)+')';
};
function fCustom (x1, y1, x2, y2) {
    let px = Math.round(x1 / space.x * 25 * 200) / 100;
    let py = Math.round(y1 / space.y * 15 * 200) / 100;
    let tx = Math.round(x2 / space.x * 25 * 200) / 100;
    let ty = Math.round(y2 / space.y * 15 * 200) / 100;
    return fLine(px, py, tx, ty);
};
// Generate main function
input.onBindDown['generateFunction'] = function () {
    if(lines.length < 1) {
        window.alert('Atleast 1 line is needed to generate a function.');
        return;
    };

    let output = '';
    for(let index in lines) {
        output = output + fCustom(lines[index].pos.x, lines[index].pos.y, lines[index].endPos.x, lines[index].endPos.y) + '+';
    };
    output = output.slice(0, output.length - 1);

    while(output.includes('--')) {
        output = output.replace('--', '+');
    };

    window.alert(output);
};

window.onresize = () => {
    resizeCanvas(canvasSize);
};

window.addEventListener('keydown', (event) => {
    if(event.code == 'Space') {
        input.setKeyDown(event.code);
    } else {
        input.setKeyDown(event.key);
    };
});

window.addEventListener('keyup', (event) => {
    if(event.code == 'Space') {
        input.setKeyUp(event.code);
    } else {
        input.setKeyUp(event.key);
    };
});

window.addEventListener('mousedown', (event) => {
    input.setKeyDown('mouse');
});

window.addEventListener('mouseup', (event) => {
    input.setKeyUp('mouse');
});

window.addEventListener('mousemove', (event) => {
    input.mouse.oldPos = input.mouse.pos;
    input.updateMouse(event);
    if(input.mouse.down) {
        cam.pos = cam.pos.translate(input.mouse.worldPos.subtract(input.mouse.oldPos.screenToWorld(cam)));
    };
});

window.addEventListener('wheel', (event) => {
    cam.zoomVel += (cam.zoom/200) * event.deltaY * -0.02;

    input.updateMouse(event);
});

window.addEventListener("visibilitychange", (event) => {
    if(document.hidden) {
        noLoop = true;
    } else {
        noLoop = false;
        windowWasOutOfFocus = true;
        requestAnimationFrame(main);
    };
});

requestAnimationFrame(main);