class collision {
    static pointLine(point, line) {
        // Point-line collision taken from "https://www.jeffreythompson.org/collision-detection/line-point.php"
        let d1 = point.pos.getDistTo(line.pos);
        let d2 = point.pos.getDistTo(line.endPos);
        let len = line.pos.getDistTo(line.endPos);
      
        // since floats are so minutely accurate, add
        // a little buffer zone that will give collision
        let buffer = 0.1; // higher # = less accurate
      
        // if the two distances are equal to the line's
        // length, the point is on the line!
        // note we use the buffer here to give a range,
        // rather than one #
        if (d1 + d2 >= len - buffer && d1 + d2 <= len + buffer) {
          return true;
        }
        return false;
      }

    static lineLine (line1, line2) {
        // Line-line collision taken from "https://www.jeffreythompson.org/collision-detection/line-line.php"
        let x1 = line1.pos.x;
        let x2 = line1.endPos.x;
        let y1 = line1.pos.y;
        let y2 = line1.endPos.y;
        let x3 = line2.pos.x;
        let x4 = line2.endPos.x;
        let y3 = line2.pos.y;
        let y4 = line2.endPos.y;
        let uA = ((x4-x3)*(y1-y3) - (y4-y3)*(x1-x3)) / ((y4-y3)*(x2-x1) - (x4-x3)*(y2-y1));
        let uB = ((x2-x1)*(y1-y3) - (y2-y1)*(x1-x3)) / ((y4-y3)*(x2-x1) - (x4-x3)*(y2-y1));
        if (uA >= 0 && uA <= 1 && uB >= 0 && uB <= 1) {
            return true;
        };
        return false;
    };

    // Returns the point that a line intersects with a line
    static lineLineIntersection (line1, line2, alwaysReturnPosition=false) {
        let x1 = line1.pos.x;
        let x2 = line1.endPos.x;
        let y1 = line1.pos.y;
        let y2 = line1.endPos.y;
        let x3 = line2.pos.x;
        let x4 = line2.endPos.x;
        let y3 = line2.pos.y;
        let y4 = line2.endPos.y;
        let uA = ((x4-x3)*(y1-y3) - (y4-y3)*(x1-x3)) / ((y4-y3)*(x2-x1) - (x4-x3)*(y2-y1));
        let uB = ((x2-x1)*(y1-y3) - (y2-y1)*(x1-x3)) / ((y4-y3)*(x2-x1) - (x4-x3)*(y2-y1));
        if ((uA >= 0 && uA <= 1 && uB >= 0 && uB <= 1) || alwaysReturnPosition) {
            return new Vector(x1 + (uA * (x2-x1)), y1 + (uA * (y2-y1)));
        };
    };

    static pointRect (point, rect) {
        if(Math.abs(rect.pos.x - point.pos.x) < rect.size.x/2 &&
        Math.abs(rect.pos.y - point.pos.y) < rect.size.y/2) {
            return true;
        } else {
            return false;
        };
    };

    static lineRect (line, rect, fast=false) {
        let topLeft = rect.getRelative(new Vector(-1, 1));
        let topRight = rect.getRelative(new Vector(1, 1));
        let bottomRight = rect.getRelative(new Vector(1, -1));
        let bottomLeft = rect.getRelative(new Vector(-1, -1));
        // Do 4 line-line collisions with the rect's 4 edges
        if(collision.lineLine(line, new Line(topLeft, topRight))) {return true};
        if(collision.lineLine(line, new Line(topRight, bottomRight))) {return true};
        if(collision.lineLine(line, new Line(bottomRight, bottomLeft))) {return true};
        if(collision.lineLine(line, new Line(bottomLeft, topLeft))) {return true};
        if(!fast) {
            if(collision.pointRect(new Point(line.pos), rect)) {return true};
            if(collision.pointRect(new Point(line.endPos), rect)) {return true};
        };
        return false;
    };

    // Returns the point that a line intersects with a rect
    static lineRectIntersection (line, rect) {
        let topLeft = rect.getRelative(new Vector(-1, 1));
        let topRight = rect.getRelative(new Vector(1, 1));
        let bottomRight = rect.getRelative(new Vector(1, -1));
        let bottomLeft = rect.getRelative(new Vector(-1, -1));
        // Do 4 line-line collisions with the rect's 4 edges
        let closestPosDistance
        let closestPos
        let pos
        pos = collision.lineLineIntersection(line, new Line(topLeft, topRight));
        if((pos != undefined) && ((closestPos == undefined) || (line.pos.getDistTo(pos) < closestPosDistance))) {
            closestPosDistance = line.pos.getDistTo(pos);
            closestPos = pos;
        };
        pos = collision.lineLineIntersection(line, new Line(topRight, bottomRight));
        if((pos != undefined) && ((closestPos == undefined) || (line.pos.getDistTo(pos) < closestPosDistance))) {
            closestPosDistance = line.pos.getDistTo(pos);
            closestPos = pos;
        };
        pos = collision.lineLineIntersection(line, new Line(bottomRight, bottomLeft));
        if((pos != undefined) && ((closestPos == undefined) || (line.pos.getDistTo(pos) < closestPosDistance))) {
            closestPosDistance = line.pos.getDistTo(pos);
            closestPos = pos;
        };
        pos = collision.lineLineIntersection(line, new Line(bottomLeft, topLeft));
        if((pos != undefined) && ((closestPos == undefined) || (line.pos.getDistTo(pos) < closestPosDistance))) {
            closestPosDistance = line.pos.getDistTo(pos);
            closestPos = pos;
        };
        return closestPos;
    };

    static rectRect (rect1, rect2) {
        if(Math.abs(rect1.pos.x - rect2.pos.x) < (rect1.size.x + rect2.size.x)/2 &&
        Math.abs(rect1.pos.y - rect2.pos.y) < (rect1.size.y + rect2.size.y)/2) {
            return true;
        } else {
            return false;
        };
    };

    static pointCircle (point, circle) {
        return point.pos.getDistTo(circle.pos) < circle.radius;
    };

    static lineCircle (line, circle) {
        // Line-circle collision taken from "https://www.jeffreythompson.org/collision-detection/line-circle.php"
        let x1 = line.pos.x;
        let x2 = line.endPos.x;
        let y1 = line.pos.y;
        let y2 = line.endPos.y;
        let cx = circle.pos.x;
        let cy = circle.pos.y;
        if(circle.isColliding(new Point(line.pos)) || circle.isColliding(new Point(line.endPos))) {
            return true;
        };
        let len = line.pos.getDistTo(line.endPos);
        let dot = ( ((cx-x1)*(x2-x1)) + ((cy-y1)*(y2-y1)) ) / (len ** 2);
        let point = new Point(new Vector(x1 + (dot * (x2-x1)), y1 + (dot * (y2-y1))));
        return line.isColliding(point) && circle.isColliding(point);
    };

    static lineCircleIntersection (line, circle, raycast=false) {
        // Line-circle collision taken from "https://www.jeffreythompson.org/collision-detection/line-circle.php"
        let x1 = line.pos.x;
        let x2 = line.endPos.x;
        let y1 = line.pos.y;
        let y2 = line.endPos.y;
        let cx = circle.pos.x;
        let cy = circle.pos.y;

        let len = line.pos.getDistTo(line.endPos);
        let dot = ( ((cx-x1)*(x2-x1)) + ((cy-y1)*(y2-y1)) ) / (len ** 2);
        let point = new Point(new Vector(x1 + (dot * (x2-x1)), y1 + (dot * (y2-y1))));
        if(line.isColliding(point) || raycast) {
            // this raycast part is not in the Jeffrey Thompson example. My idea with it is to move the intersection point towards the line origin by value
            if(raycast) {
                let value = (circle.radius**2 - circle.pos.getDistTo(point.pos)**2)**0.5; // my pythagorean magic
                point.pos = point.pos.moveTowardsClamped(line.pos, value);
            };
            return point.pos;
        };
        
        let bool1 = circle.isColliding(new Point(line.pos));
        let bool2 = circle.isColliding(new Point(line.endPos));
        if(bool1) {
            return line.pos;
        } else if(bool2) {
            return line.endPos;
        };
    };

    static rectCircle (rect, circle) {
        let topEdge = rect.getRelative(new Vector(0, 1));
        let bottomEdge = rect.getRelative(new Vector(0, -1));
        let rightEdge = rect.getRelative(new Vector(1, 0));
        let leftEdge = rect.getRelative(new Vector(-1, 0));

        // Create a new vector and thus, for example, "pos.x = ..." won't override the circle's X position
        let pos = new Vector(circle.pos.x, circle.pos.y);
        if(pos.x > rightEdge.x) {
            pos.x = rightEdge.x;
        } else if(pos.x < leftEdge.x) {
            pos.x = leftEdge.x;
        };
        if(pos.y > topEdge.y) {
            pos.y = topEdge.y;
        } else if(pos.y < bottomEdge.y) {
            pos.y = bottomEdge.y;
        };

        if(circle.pos.getDistTo(pos) < circle.radius) {
            return true;
        };
        return false;
    };

    static circleCircle (circle1, circle2) {
        return circle1.pos.getDistTo(circle2.pos) < circle1.radius + circle2.radius;
    };

    static circleCircleIntersection (circle1, circle2) {
        return circle1.pos.translate(circle2.pos).scale(0.5);
    };

    static pointPolygon (point, polygon) {
        // Point-polygon collision taken from "https://www.jeffreythompson.org/collision-detection/poly-point.php"
        let bool = false;
        let px = point.pos.x;
        let py = point.pos.y;
        for(let index = 0; index < polygon.vertices.length; index++) {
            let vc = polygon.vertices[index].pos; // current vertex position
            let vn = polygon.vertices[(index + 1) % polygon.vertices.length].pos; // next vertex position
            if (((vc.y >= py && vn.y < py) || (vc.y < py && vn.y >= py)) &&
            (px < (vn.x-vc.x)*(py-vc.y) / (vn.y-vc.y)+vc.x)) {
                bool = !bool;
            };
        };
        return bool;
    };

    static linePolygon (line, polygon) {
        for(let index = 0; index < polygon.vertices.length; index++) {
            let vc = polygon.vertices[index].pos; // current vertex position
            let vn = polygon.vertices[(index + 1) % polygon.vertices.length].pos; // next vertex position
            let polygonLine = new Line(vc, vn);
            if(line.isColliding(polygonLine)) {
                return true;
            };
        };
        return false;
    };

    static rectPolygon (rect, polygon) {
        let rectPolygon = new Polygon(new Vector(), [
            new Point(rect.getRelative(new Vector(-1, 1))),
            new Point(rect.getRelative(new Vector(1, 1))),
            new Point(rect.getRelative(new Vector(1, -1))),
            new Point(rect.getRelative(new Vector(-1, -1)))
        ]);
        return collision.polygonPolygon(rectPolygon, polygon);
    };

    static circlePolygon (circle, polygon) {
        for(let index = 0; index < polygon.vertices.length; index++) {
            let vc = polygon.vertices[index].pos; // current vertex position
            let vn = polygon.vertices[(index + 1) % polygon.vertices.length].pos; // next vertex position
            let polygonLine = new Line(vc, vn);
            if(circle.isColliding(polygonLine)) {
                return true;
            };
        };
        return collision.pointPolygon(new Point(circle.pos), polygon);
    };

    static polygonPolygon (polygon1, polygon2) {
        for(let index = 0; index < polygon1.vertices.length; index++) {
            let vc = polygon1.vertices[index].pos; // current vertex position
            let vn = polygon1.vertices[(index + 1) % polygon1.vertices.length].pos; // next vertex position
            let polygonLine = new Line(vc, vn);
            if(polygon2.isColliding(polygonLine)) {
                return true;
            };
        };
        return polygon1.isColliding(polygon2.vertices[0]) || polygon2.isColliding(polygon1.vertices[0]);
    };
};

// NOTICE
// Lacks point-point since it is very niche
// If I ever need it, I could probably just make a circle at one of the point's position that has a very small radius
class Point {
    constructor (pos, parent) {
        this.type = 'point';
        this.relativeAngle = 0;
        this.relativePos = pos;
        this.relativeSize = new Vector(1, 1);
        this.parent = parent;
    };
    get angle () {
        if(this.parent != undefined) {
            let parentAngle = this.parent.angle;
            if(parentAngle == undefined) {parentAngle = 0;};
            return this.relativeAngle + parentAngle;
        } else {
            return this.relativeAngle;
        };
    };
    set angle (angle) {
        if(this.parent != undefined) {
            let parentAngle = this.parent.angle;
            if(parentAngle == undefined) {parentAngle = 0;};
            this.relativeAngle = angle - parentAngle;
        } else {
            this.relativeAngle = angle;
        };
        return this;
    };
    get pos () {
        if(this.parent != undefined) {
            let parentAngle = this.parent.angle;
            if(parentAngle == undefined) {parentAngle = 0;};
            let parentSize = this.parent.size || new Vector(1, 1);
            return this.relativePos.rotate(parentAngle).scaleByVector(parentSize).translate(this.parent.pos);
        } else {
            return this.relativePos;
        };
    };
    set pos (pos) {
        if(this.parent != undefined) {
            let parentAngle = this.parent.angle;
            if(parentAngle == undefined) {parentAngle = 0;};
            let parentSize = this.parent.size || new Vector(1, 1);
            this.relativePos = pos.subtract(this.parent.pos).scaleByVector(parentSize.invert()).rotate(0 - parentAngle);
        } else {
            this.relativePos = pos;
        };
        return this;
    };
    get size () {
        if(this.parent != undefined) {
            let parentSize = this.parent.size || new Vector(1, 1);
            return this.relativeSize.scaleByVector(parentSize);
        } else {
            return this.relativeSize;
        };
    };
    set size (size) {
        if(this.parent != undefined) {
            let parentSize = this.parent.size || new Vector(1, 1);
            this.relativeSize = size.scaleByVector(parentSize.invert());
        } else {
            this.relativeSize = size;
        };
        return this;
    };
    isColliding (other) {
        switch (other.type) {
            case 'line' : return collision.pointLine(this, other);
            case 'rect' : return collision.pointRect(this, other);
            case 'circle' : return collision.pointCircle(this, other);
            case 'polygon' : return other.isColliding(this);
            case 'set' : return other.isColliding(this);
            default : return false;
        };
    };
    render (cam, width=5, color='#FFFFFF') {
        draw.color = color;
        if(cam) {
            draw.circleFill(this.pos.worldToScreen(cam), width);
        } else {
            draw.circleFill(this.pos, width);
        };
    };
};

class Line extends Point {
    constructor (pos, endPos, parent) {
        super(Point);
        this.type = 'line';
        this.relativePos = pos;
        this.relativeEndPos = endPos;
        this.size = new Vector(1, 1);
        this.parent = parent;
    };
    get endPos () {
        if(this.parent != undefined) {
            let parentAngle = this.parent.angle;
            if(parentAngle == undefined) {parentAngle = 0;};
            let parentSize = this.parent.size || new Vector(1, 1);
            return this.relativeEndPos.rotate(parentAngle).scaleByVector(parentSize).translate(this.parent.pos);
        } else {
            return this.relativeEndPos;
        };
    };
    set endPos (pos) {
        if(this.parent != undefined) {
            let parentAngle = this.parent.angle;
            if(parentAngle == undefined) {parentAngle = 0;};
            let parentSize = this.parent.size || new Vector(1, 1);
            this.relativeEndPos = pos.subtract(this.parent.pos).scaleByVector(parentSize.invert()).rotate(0 - parentAngle);
        } else {
            this.relativeEndPos = pos;
        };
        return this;
    };
    isColliding (other, fast=false) {
        switch (other.type) {
            case 'point' : return collision.pointLine(other, this);
            case 'line' : return collision.lineLine(this, other);
            case 'rect' : return collision.lineRect(this, other, fast);
            case 'circle' : return collision.lineCircle(this, other);
            case 'polygon' : return other.isColliding(this);
            case 'set' : return other.isColliding(this);
            default : return false;
        };
    };
    getIntersection (other, raycast=false) {
        switch (other.type) {
            case 'line' : return collision.lineLineIntersection(this, other);
            case 'rect' : return collision.lineRectIntersection(this, other);
            case 'circle' : return collision.lineCircleIntersection(this, other, raycast);
            default : return undefined;
        };
    };
    render (cam, width=5, color='#FFFFFF', cap=true) {
        draw.width = width;
        draw.color = color;
        if(cam) {
            draw.lineStroke(this.pos.worldToScreen(cam), this.endPos.worldToScreen(cam), cap);
        } else {
            draw.lineStroke(this.pos, this.endPos, cap);
        };
    };
};

class Rect extends Point {
    constructor (pos, size, parent) {
        super(Point);
        this.type = 'rect';
        this.relativePos = pos;
        this.relativeSize = size;
        this.parent = parent;
    };
    getRelative (vector) {
        return this.pos.translate(this.size.scaleByVector(vector).scale(0.5));
    };
    isColliding (other, fast=false) {
        switch (other.type) {
            case 'point' : return collision.pointRect(other, this);
            case 'line' : return collision.lineRect(other, this, fast);
            case 'rect' : return collision.rectRect(this, other);
            case 'circle' : return collision.rectCircle(this, other);
            case 'polygon' : return other.isColliding(this);
            case 'set' : return other.isColliding(this);
            default : return false;
        };
    };
    render (cam, width=5, color='#FFFFFF', cap=true) {
        draw.width = width;
        draw.color = color;
        let topLeft;
        let topRight;
        let bottomRight;
        let bottomLeft;
        if(cam) {
            topLeft = this.getRelative(new Vector(-1, 1)).worldToScreen(cam);
            topRight = this.getRelative(new Vector(1, 1)).worldToScreen(cam);
            bottomRight = this.getRelative(new Vector(1, -1)).worldToScreen(cam);
            bottomLeft = this.getRelative(new Vector(-1, -1)).worldToScreen(cam);

        } else {
            topLeft = this.getRelative(new Vector(-1, 1));
            topRight = this.getRelative(new Vector(1, 1));
            bottomRight = this.getRelative(new Vector(1, -1));
            bottomLeft = this.getRelative(new Vector(-1, -1));
        };
        draw.lineStroke(topLeft, topRight, cap);
        draw.lineStroke(topRight, bottomRight, cap);
        draw.lineStroke(bottomRight, bottomLeft, cap);
        draw.lineStroke(bottomLeft, topLeft, cap);
    };
};

class Circle extends Point {
    constructor (pos, radius, parent) {
        super(Point);
        this.type = 'circle';
        this.relativePos = pos;
        this.relativeRadius = radius;
        this.parent = parent;
    };
    get radius () {
        if(this.parent != undefined) {
            let parentSize = this.parent.size || new Vector(1, 1);
            let parentRadius = this.parent.radius || (Math.min(parentSize.x, parentSize.y) / 2);
            return this.relativeRadius * parentRadius;
        } else {
            return this.relativeRadius;
        };
    };
    set radius (radius) {
        if(this.parent != undefined) {
            let parentSize = this.parent.size || new Vector(1, 1);
            let parentRadius = this.parent.radius || (Math.min(parentSize.x, parentSize.y) / 2);
            return this.relativeRadius / parentRadius;
        } else {
            this.relativeRadius = radius;
        };
        return this;
    };
    get relativeSize () {
        return new Vector(this.radius * 2, this.radius * 2);
    };
    set relativeSize (size) {
        this.relativeRadius = Math.min(size.x / 2, size.y / 2);
    };
    isColliding (other) {
        switch (other.type) {
            case 'point' : return collision.pointCircle(other, this);
            case 'line' : return collision.lineCircle(other, this);
            case 'rect' : return collision.rectCircle(other, this);
            case 'circle' : return collision.circleCircle(this, other);
            case 'polygon' : return other.isColliding(this);
            case 'set' : return other.isColliding(this);
            default : return false;
        };
    };
    getIntersection (other) {
        switch (other.type) {
            case 'line' : return collision.lineCircleIntersection(other, this);
            case 'circle' : return collision.circleCircleIntersection(this, other);
            default : return undefined;
        };
    };
    render (cam, width=5, color='#FFFFFF') {
        draw.width = width;
        draw.color = color;
        if(cam) {
            draw.circleStroke(this.pos.worldToScreen(cam), this.radius * cam.zoom);
        } else {
            draw.circleStroke(this.pos, this.radius * cam.zoom);
        };
    };
};

class Polygon extends Point {
    constructor (pos, vertices, parent) {
        super(Point);
        this.type = 'polygon';
        this.relativePos = pos;
        this.vertices = vertices || [];
        this.parent = parent;
        for(let index in this.vertices) {
            this.vertices[index].parent = this;
        };
    };
    isColliding (other) {
        switch (other.type) {
            case 'point' : return collision.pointPolygon(other, this);
            case 'line' : return collision.linePolygon(other, this);
            case 'rect' : return collision.rectPolygon(other, this);
            case 'circle' : return collision.circlePolygon(other, this);
            case 'polygon' : return collision.polygonPolygon(this, other);
            case 'set' : return other.isColliding(this);
            default : return false;
        };
    };
    render (cam, width=5, color='#FFFFFF', cap=true) {
        draw.width = width;
        draw.color = color;
        for(let index = 0; index < this.vertices.length; index++) {
            let vc = this.vertices[index].pos; // current vertex position
            let vn = this.vertices[(index + 1) % this.vertices.length].pos; // next vertex position
            if(cam) {
                draw.lineStroke(vc.worldToScreen(cam), vn.worldToScreen(cam), cap);
            } else {
                draw.lineStroke(vc, vn, cap);
            };
        };
    };
};

class ColliderSet extends Point {
    constructor (pos, colliders, parent) {
        super(Point);
        this.type = 'set';
        this.relativePos = pos;
        this.colliders = colliders || [];
        this.parent = parent;
        for(let index in this.colliders) {
            this.colliders[index].parent = this;
        };
    };
    isColliding (other) {
        for(let collider of this.colliders) {
            if(collider.isColliding(other)) {
                return true;
            };
        };
        return false;
    };
    render (cam, width=5, color='#FFFFFF', cap) {
        for(let collider of this.colliders) {
            collider.render(cam, width, color, cap);
        };
    };
};