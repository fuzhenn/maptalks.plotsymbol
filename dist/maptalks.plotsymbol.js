//version:0.1.0
(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function (global){
'use strict';

var maptalks = (typeof window !== "undefined" ? window['maptalks'] : typeof global !== "undefined" ? global['maptalks'] : null);

maptalks.StraightArrow = require('./src/StraightArrow');
maptalks.DiagonalArrow = require('./src/DiagonalArrow');
maptalks.DoveTailDiagonalArrow = require('./src/DoveTailDiagonalArrow');

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./src/DiagonalArrow":3,"./src/DoveTailDiagonalArrow":4,"./src/StraightArrow":6}],2:[function(require,module,exports){
'use strict';

module.exports = Point;

/**
 * A standalone point geometry with useful accessor, comparison, and
 * modification methods.
 *
 * @class Point
 * @param {Number} x the x-coordinate. this could be longitude or screen
 * pixels, or any other sort of unit.
 * @param {Number} y the y-coordinate. this could be latitude or screen
 * pixels, or any other sort of unit.
 * @example
 * var point = new Point(-77, 38);
 */
function Point(x, y) {
    this.x = x;
    this.y = y;
}

Point.prototype = {

    /**
     * Clone this point, returning a new point that can be modified
     * without affecting the old one.
     * @return {Point} the clone
     */
    clone: function() { return new Point(this.x, this.y); },

    /**
     * Add this point's x & y coordinates to another point,
     * yielding a new point.
     * @param {Point} p the other point
     * @return {Point} output point
     */
    add:     function(p) { return this.clone()._add(p); },

    /**
     * Subtract this point's x & y coordinates to from point,
     * yielding a new point.
     * @param {Point} p the other point
     * @return {Point} output point
     */
    sub:     function(p) { return this.clone()._sub(p); },

    /**
     * Multiply this point's x & y coordinates by point,
     * yielding a new point.
     * @param {Point} p the other point
     * @return {Point} output point
     */
    multByPoint:    function(p) { return this.clone()._multByPoint(p); },

    /**
     * Divide this point's x & y coordinates by point,
     * yielding a new point.
     * @param {Point} p the other point
     * @return {Point} output point
     */
    divByPoint:     function(p) { return this.clone()._divByPoint(p); },

    /**
     * Multiply this point's x & y coordinates by a factor,
     * yielding a new point.
     * @param {Point} k factor
     * @return {Point} output point
     */
    mult:    function(k) { return this.clone()._mult(k); },

    /**
     * Divide this point's x & y coordinates by a factor,
     * yielding a new point.
     * @param {Point} k factor
     * @return {Point} output point
     */
    div:     function(k) { return this.clone()._div(k); },

    /**
     * Rotate this point around the 0, 0 origin by an angle a,
     * given in radians
     * @param {Number} a angle to rotate around, in radians
     * @return {Point} output point
     */
    rotate:  function(a) { return this.clone()._rotate(a); },

    /**
     * Rotate this point around p point by an angle a,
     * given in radians
     * @param {Number} a angle to rotate around, in radians
     * @param {Point} p Point to rotate around
     * @return {Point} output point
     */
    rotateAround:  function(a,p) { return this.clone()._rotateAround(a,p); },

    /**
     * Multiply this point by a 4x1 transformation matrix
     * @param {Array<Number>} m transformation matrix
     * @return {Point} output point
     */
    matMult: function(m) { return this.clone()._matMult(m); },

    /**
     * Calculate this point but as a unit vector from 0, 0, meaning
     * that the distance from the resulting point to the 0, 0
     * coordinate will be equal to 1 and the angle from the resulting
     * point to the 0, 0 coordinate will be the same as before.
     * @return {Point} unit vector point
     */
    unit:    function() { return this.clone()._unit(); },

    /**
     * Compute a perpendicular point, where the new y coordinate
     * is the old x coordinate and the new x coordinate is the old y
     * coordinate multiplied by -1
     * @return {Point} perpendicular point
     */
    perp:    function() { return this.clone()._perp(); },

    /**
     * Return a version of this point with the x & y coordinates
     * rounded to integers.
     * @return {Point} rounded point
     */
    round:   function() { return this.clone()._round(); },

    /**
     * Return the magitude of this point: this is the Euclidean
     * distance from the 0, 0 coordinate to this point's x and y
     * coordinates.
     * @return {Number} magnitude
     */
    mag: function() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    },

    /**
     * Judge whether this point is equal to another point, returning
     * true or false.
     * @param {Point} other the other point
     * @return {boolean} whether the points are equal
     */
    equals: function(other) {
        return this.x === other.x &&
               this.y === other.y;
    },

    /**
     * Calculate the distance from this point to another point
     * @param {Point} p the other point
     * @return {Number} distance
     */
    dist: function(p) {
        return Math.sqrt(this.distSqr(p));
    },

    /**
     * Calculate the distance from this point to another point,
     * without the square root step. Useful if you're comparing
     * relative distances.
     * @param {Point} p the other point
     * @return {Number} distance
     */
    distSqr: function(p) {
        var dx = p.x - this.x,
            dy = p.y - this.y;
        return dx * dx + dy * dy;
    },

    /**
     * Get the angle from the 0, 0 coordinate to this point, in radians
     * coordinates.
     * @return {Number} angle
     */
    angle: function() {
        return Math.atan2(this.y, this.x);
    },

    /**
     * Get the angle from this point to another point, in radians
     * @param {Point} b the other point
     * @return {Number} angle
     */
    angleTo: function(b) {
        return Math.atan2(this.y - b.y, this.x - b.x);
    },

    /**
     * Get the angle between this point and another point, in radians
     * @param {Point} b the other point
     * @return {Number} angle
     */
    angleWith: function(b) {
        return this.angleWithSep(b.x, b.y);
    },

    /*
     * Find the angle of the two vectors, solving the formula for
     * the cross product a x b = |a||b|sin(θ) for θ.
     * @param {Number} x the x-coordinate
     * @param {Number} y the y-coordinate
     * @return {Number} the angle in radians
     */
    angleWithSep: function(x, y) {
        return Math.atan2(
            this.x * y - this.y * x,
            this.x * x + this.y * y);
    },

    _matMult: function(m) {
        var x = m[0] * this.x + m[1] * this.y,
            y = m[2] * this.x + m[3] * this.y;
        this.x = x;
        this.y = y;
        return this;
    },

    _add: function(p) {
        this.x += p.x;
        this.y += p.y;
        return this;
    },

    _sub: function(p) {
        this.x -= p.x;
        this.y -= p.y;
        return this;
    },

    _mult: function(k) {
        this.x *= k;
        this.y *= k;
        return this;
    },

    _div: function(k) {
        this.x /= k;
        this.y /= k;
        return this;
    },

    _multByPoint: function(p) {
        this.x *= p.x;
        this.y *= p.y;
        return this;
    },

    _divByPoint: function(p) {
        this.x /= p.x;
        this.y /= p.y;
        return this;
    },

    _unit: function() {
        this._div(this.mag());
        return this;
    },

    _perp: function() {
        var y = this.y;
        this.y = this.x;
        this.x = -y;
        return this;
    },

    _rotate: function(angle) {
        var cos = Math.cos(angle),
            sin = Math.sin(angle),
            x = cos * this.x - sin * this.y,
            y = sin * this.x + cos * this.y;
        this.x = x;
        this.y = y;
        return this;
    },

    _rotateAround: function(angle, p) {
        var cos = Math.cos(angle),
            sin = Math.sin(angle),
            x = p.x + cos * (this.x - p.x) - sin * (this.y - p.y),
            y = p.y + sin * (this.x - p.x) + cos * (this.y - p.y);
        this.x = x;
        this.y = y;
        return this;
    },

    _round: function() {
        this.x = Math.round(this.x);
        this.y = Math.round(this.y);
        return this;
    }
};

/**
 * Construct a point from an array if necessary, otherwise if the input
 * is already a Point, or an unknown type, return it unchanged
 * @param {Array<Number>|Point|*} a any kind of input value
 * @return {Point} constructed point, or passed-through value.
 * @example
 * // this
 * var point = Point.convert([0, 1]);
 * // is equivalent to
 * var point = new Point(0, 1);
 */
Point.convert = function (a) {
    if (a instanceof Point) {
        return a;
    }
    if (Array.isArray(a)) {
        return new Point(a[0], a[1]);
    }
    return a;
};

},{}],3:[function(require,module,exports){
(function (global){
'use strict';

var maptalks = (typeof window !== "undefined" ? window['maptalks'] : typeof global !== "undefined" ? global['maptalks'] : null);
var Point = require('point-geometry');
var PlotUtils = require('./PlotUtils');
var StraightArrow = require('./StraightArrow');

/**
 * @classdesc Curve style LineString
 * @class
 * @category geometry
 * @extends {maptalks.LineString}
 * @param {maptalks.Coordinate[]|Number[][]} coordinates - coordinates of the line string
 * @param {Object} [options=null]   - construct options defined in [maptalks.DiagonalArrow]{@link maptalks.DiagonalArrow#options}
 * @example
 * var curve = new maptalks.DiagonalArrow(
 *     [
 *         [121.47083767181408,31.214448123476995],
 *         [121.4751292062378,31.215475523000404],
 *         [121.47869117980943,31.211916269810335]
 *     ],
 *     {
 *         symbol : {
 *             'lineWidth' : 5
 *         }
 *     }
 * ).addTo(layer);
 */
var DiagonalArrow = module.exports = maptalks.StraightArrow.extend(/** @lends maptalks.DiagonalArrow.prototype */{
    /**
     * @property {Object} options
     */
    options:{
        'widthRatio' : 0.20,
        'arrowStyle' : []
    },

    _toJSON:function (options) {
        return {
            'feature' : this.toGeoJSON(options),
            'subType' : 'DiagonalArrow'
        };
    },

    _getPaintParams: function () {
        var points = this._getPath2DPoints(this._getPrjCoordinates());
        if (points.length <= 1) {
            return null;
        }
        var length = this._get2DLength();
        var lineWidth = length * this.options['widthRatio'];

        var arrowPairs = PlotUtils.getArrowBody(points, lineWidth, this.getMap(), 0.15, length);
        var h1 = arrowPairs[0][arrowPairs[0].length - 1],
            h2 = arrowPairs[1][arrowPairs[1].length - 1];
        var arrowHead = this._getArrowHead(h1, h2, points[points.length - 1], lineWidth * 0.3, 2);
        var t1 = arrowPairs[0][0],
            t2 = arrowPairs[1][0];
        var plots = [];
        plots.push.apply(plots, arrowPairs[0]);
        plots.push.apply(plots, arrowHead);
        for (var i = arrowPairs[1].length - 1; i >= 0; i--) {
            plots.push(arrowPairs[1][i]);
        }
        // arrowPairs.push(arrowHead);
        return [plots, [arrowPairs[0].length, arrowHead.length, arrowPairs[1].length]];
    }

});

DiagonalArrow.fromJSON = function (json) {
    var feature = json['feature'];
    var arrow = new maptalks.DiagonalArrow(feature['geometry']['coordinates'], json['options']);
    arrow.setProperties(feature['properties']);
    return arrow;
};

maptalks.DrawTool.registerMode('DiagonalArrow', {
    'action' : 'clickDblclick',
    'create' : function (path) {
        return new maptalks.DiagonalArrow(path);
    },
    'update' : function (path, geometry) {
        geometry.setCoordinates(path);
    },
    'generate' : function (geometry) {
        return geometry;
    }
});

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./PlotUtils":5,"./StraightArrow":6,"point-geometry":2}],4:[function(require,module,exports){
(function (global){
'use strict';

var maptalks = (typeof window !== "undefined" ? window['maptalks'] : typeof global !== "undefined" ? global['maptalks'] : null);
var Point = require('point-geometry');
var PlotUtils = require('./PlotUtils');
var DiagonalArrow = require('./DiagonalArrow');

/**
 * @classdesc Curve style LineString
 * @class
 * @category geometry
 * @extends {maptalks.LineString}
 * @param {maptalks.Coordinate[]|Number[][]} coordinates - coordinates of the line string
 * @param {Object} [options=null]   - construct options defined in [maptalks.DoveTailDiagonalArrow]{@link maptalks.DoveTailDiagonalArrow#options}
 * @example
 * var curve = new maptalks.DoveTailDiagonalArrow(
 *     [
 *         [121.47083767181408,31.214448123476995],
 *         [121.4751292062378,31.215475523000404],
 *         [121.47869117980943,31.211916269810335]
 *     ],
 *     {
 *         symbol : {
 *             'lineWidth' : 5
 *         }
 *     }
 * ).addTo(layer);
 */
var DoveTailDiagonalArrow = module.exports = maptalks.DiagonalArrow.extend(/** @lends maptalks.DoveTailDiagonalArrow.prototype */{
    /**
     * @property {Object} options
     */
    options:{
        'widthRatio' : 0.20,
        'arrowStyle' : []
    },

    _toJSON:function (options) {
        return {
            'feature' : this.toGeoJSON(options),
            'subType' : 'DoveTailDiagonalArrow'
        };
    },

    _closeArrow: function (ctx, last, first) {
        var t1 = new Point(last.x, last.y);
        var t2 = new Point(first.x, first.y);
        var m = new Point(t1.x + t2.x, t1.y + t2.y).mult(1 / 2);
        var dist = t1.dist(t2);
        var normal = t1.sub(t2)._unit()._perp();
        var xc = m.x + dist * 0.618 * normal.x,
            yc = m.y + dist * 0.618 * normal.y;
        ctx.lineTo(xc, yc);
        ctx.closePath();
    }

});

DoveTailDiagonalArrow.fromJSON = function (json) {
    var feature = json['feature'];
    var arrow = new maptalks.DoveTailDiagonalArrow(feature['geometry']['coordinates'], json['options']);
    arrow.setProperties(feature['properties']);
    return arrow;
};

maptalks.DrawTool.registerMode('DoveTailDiagonalArrow', {
    'action' : 'clickDblclick',
    'create' : function (path) {
        return new maptalks.DoveTailDiagonalArrow(path);
    },
    'update' : function (path, geometry) {
        geometry.setCoordinates(path);
    },
    'generate' : function (geometry) {
        return geometry;
    }
});

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./DiagonalArrow":3,"./PlotUtils":5,"point-geometry":2}],5:[function(require,module,exports){
(function (global){
'use strict';

var maptalks = (typeof window !== "undefined" ? window['maptalks'] : typeof global !== "undefined" ? global['maptalks'] : null);
var Point = require('point-geometry');

module.exports = {
    /**
     * Get arrow body for given vertexes.
     * @param  {maptalks.Coordinate[]} vertexes    - input vertexes
     * @param  {[type]} lineWidth [description]
     * @param  {[type]} map       [description]
     * @param  {[type]} ratio     [description]
     * @return {[type]}           [description]
     */
    getArrowBody: function (vertexes, lineWidth, map, ratio, arrowLength) {
        lineWidth /= 2;
        var arrowWidth;
        var currentLen = 0;
        var upPlots = [],
            downPlots = [],
            pair;
        var dx, dy;
        var current, prev, next;
        var normal, currentNormal, nextNormal;
        for (var i = 1, l = vertexes.length; i < l; i++) {
            current = new Point(vertexes[i].x, vertexes[i].y);
            prev = new Point(vertexes[i - 1].x, vertexes[i - 1].y);
            if (ratio && arrowLength) {
                currentLen += current.dist(prev);
                arrowWidth = (1 - (1 - ratio) * currentLen / arrowLength) * lineWidth;
            } else {
                arrowWidth = lineWidth;
            }

            if (i < l - 1) {
                next = new Point(vertexes[i + 1].x, vertexes[i + 1].y);
            } else {
                next = null;
            }
            normal = current.sub(prev)._unit()._perp();
            if (i === 1) {
                pair = this._getPlotPair(vertexes[i - 1], normal, lineWidth, map);
                upPlots.push(pair[0]);
                downPlots.push(pair[1]);
            }
            if (next) {
                nextNormal = next.sub(current)._unit()._perp();
                currentNormal = this._getJoinNormal(normal, nextNormal);
            } else {
                currentNormal = normal;
            }
            pair = this._getPlotPair(vertexes[i], currentNormal, arrowWidth, map);
            upPlots.push(pair[0]);
            downPlots.push(pair[1]);
        }
        return [upPlots, downPlots];
    },

    /**
     *                  nextNormal
     *    currentVertex    ↑
     *                .________. nextVertex
     *                |\
     *     normal  ←  | \ joinNormal
     *                |
     *     prevVertex !
     *
     * get join normal between 2 line segments
     * @param  {[type]} normal     [description]
     * @param  {[type]} nextNormal [description]
     * @return {[type]}            [description]
     */
    _getJoinNormal: function (normal, nextNormal) {
        var joinNormal = normal.add(nextNormal)._unit();
        var cosHalfAngle = joinNormal.x * nextNormal.x + joinNormal.y * nextNormal.y;
        var miterLength = 1 / cosHalfAngle;
        return joinNormal._mult(miterLength);
    },

    _getPlotPair: function (vertex, normal, lineWidth, map) {
        // first plot pair
        var dx = normal.x * lineWidth;
        var dy = normal.y * lineWidth;
        var p1 = vertex.add(dx, dy);
        var p2 = vertex.add(-dx, -dy);
        return [p1, p2];
    }
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"point-geometry":2}],6:[function(require,module,exports){
(function (global){
'use strict';

var maptalks = (typeof window !== "undefined" ? window['maptalks'] : typeof global !== "undefined" ? global['maptalks'] : null);
var Point = require('point-geometry');
var PlotUtils = require('./PlotUtils');

/**
 * @classdesc Curve style LineString
 * @class
 * @category geometry
 * @extends {maptalks.LineString}
 * @param {maptalks.Coordinate[]|Number[][]} coordinates - coordinates of the line string
 * @param {Object} [options=null]   - construct options defined in [maptalks.StraightArrow]{@link maptalks.StraightArrow#options}
 * @example
 * var curve = new maptalks.StraightArrow(
 *     [
 *         [121.47083767181408,31.214448123476995],
 *         [121.4751292062378,31.215475523000404],
 *         [121.47869117980943,31.211916269810335]
 *     ],
 *     {
 *         symbol : {
 *             'lineWidth' : 5
 *         }
 *     }
 * ).addTo(layer);
 */
var StraightArrow = module.exports = maptalks.Curve.extend(/** @lends maptalks.StraightArrow.prototype */{
    /**
     * @property {Object} options
     */
    options:{
        'widthRatio' : 0.10,
        'arrowStyle' : []
    },

    _toJSON:function (options) {
        return {
            'feature' : this.toGeoJSON(options),
            'subType' : 'StraightArrow'
        };
    },

    _getPaintParams: function () {
        var points = this._getPath2DPoints(this._getPrjCoordinates());
        if (points.length <= 1) {
            return null;
        }
        var length = this._get2DLength();
        var lineWidth = length * this.options['widthRatio'];

        var arrowPairs = PlotUtils.getArrowBody(points, lineWidth, this.getMap());
        var h1 = arrowPairs[0][arrowPairs[0].length - 1],
            h2 = arrowPairs[1][arrowPairs[1].length - 1];
        var arrowHead = this._getArrowHead(h1, h2, points[points.length - 1], lineWidth);
        var t1 = arrowPairs[0][0],
            t2 = arrowPairs[1][0];
        var plots = [];
        plots.push.apply(plots, arrowPairs[0]);
        plots.push.apply(plots, arrowHead);
        for (var i = arrowPairs[1].length - 1; i >= 0; i--) {
            plots.push(arrowPairs[1][i]);
        }
        // arrowPairs.push(arrowHead);
        return [plots, [arrowPairs[0].length, arrowHead.length, arrowPairs[1].length]];
    },

    _paintOn: function (ctx, points, segs, lineOpacity, fillOpacity, lineDasharray) {
        ctx.beginPath();
        var l = segs[0];
        var seg;
        //draw body upside
        var i = 0;
        ctx.moveTo(points[0].x, points[0].y);
        seg = points.slice(0, segs[0]);
        this._quadraticCurve(ctx, seg);
        //draw head
        i += segs[0];
        maptalks.Canvas._path(ctx, points.slice(i, i + segs[1]), lineDasharray, lineOpacity);
        //draw body downside
        i += segs[1];
        ctx.lineTo(points[i].x, points[i].y);
        seg = points.slice(i, i + segs[2]);
        this._quadraticCurve(ctx, seg);
        this._closeArrow(ctx, points[points.length - 1], points[0]);
        maptalks.Canvas._stroke(ctx, lineOpacity);
        maptalks.Canvas.fillCanvas(ctx, fillOpacity, points[0].x, points[0].y);
    },

    _closeArrow: function (ctx) {
        ctx.closePath();
    },

    /**
     * Get points of arrow head
     * @param  {maptalks.Coordinate} h1   - head point 1
     * @param  {maptalks.Coordinate} h2   - head point 2
     * @param  {maptalks.Coordinate} vertex - head vertex
     * @param  {Number} lineWidth         - line width
     * @return {maptalks.Coordinate[]}
     */
    _getArrowHead: function (h1, h2, vertex, lineWidth, hScale) {
        if (!hScale) {
            hScale = 1;
        }
        h1 = new Point(h1.x, h1.y);
        h2 = new Point(h2.x, h2.y);
        var normal = h1.sub(h2)._unit();
        var head0 = vertex.add(lineWidth * normal.x, lineWidth * normal.y);
        var head2 = vertex.add(lineWidth * -normal.x, lineWidth * -normal.y);
        normal._perp()._mult(-1);
        var head1 = vertex.add(hScale * lineWidth * normal.x, hScale * lineWidth * normal.y);
        return [head0, head1, head2]
    }

});

StraightArrow.fromJSON = function (json) {
    var feature = json['feature'];
    var StraightArrow = new maptalks.StraightArrow(feature['geometry']['coordinates'], json['options']);
    StraightArrow.setProperties(feature['properties']);
    return StraightArrow;
};

maptalks.DrawTool.registerMode('StraightArrow', {
    'action' : 'clickDblclick',
    'create' : function (path) {
        return new maptalks.StraightArrow(path);
    },
    'update' : function (path, geometry) {
        geometry.setCoordinates(path);
    },
    'generate' : function (geometry) {
        return geometry;
    }
});

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./PlotUtils":5,"point-geometry":2}]},{},[1]);
