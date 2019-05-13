/*!
 * maptalks.plotsymbol v0.3.0
 * LICENSE : MIT
 * (c) 2016-2019 maptalks.org
 */
/*!
 * requires maptalks@>=0.44.0 
 */
import { Canvas, Curve, DrawTool } from 'maptalks';

var pointGeometry = Point;

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
    clone: function clone() {
        return new Point(this.x, this.y);
    },

    /**
     * Add this point's x & y coordinates to another point,
     * yielding a new point.
     * @param {Point} p the other point
     * @return {Point} output point
     */
    add: function add(p) {
        return this.clone()._add(p);
    },

    /**
     * Subtract this point's x & y coordinates to from point,
     * yielding a new point.
     * @param {Point} p the other point
     * @return {Point} output point
     */
    sub: function sub(p) {
        return this.clone()._sub(p);
    },

    /**
     * Multiply this point's x & y coordinates by point,
     * yielding a new point.
     * @param {Point} p the other point
     * @return {Point} output point
     */
    multByPoint: function multByPoint(p) {
        return this.clone()._multByPoint(p);
    },

    /**
     * Divide this point's x & y coordinates by point,
     * yielding a new point.
     * @param {Point} p the other point
     * @return {Point} output point
     */
    divByPoint: function divByPoint(p) {
        return this.clone()._divByPoint(p);
    },

    /**
     * Multiply this point's x & y coordinates by a factor,
     * yielding a new point.
     * @param {Point} k factor
     * @return {Point} output point
     */
    mult: function mult(k) {
        return this.clone()._mult(k);
    },

    /**
     * Divide this point's x & y coordinates by a factor,
     * yielding a new point.
     * @param {Point} k factor
     * @return {Point} output point
     */
    div: function div(k) {
        return this.clone()._div(k);
    },

    /**
     * Rotate this point around the 0, 0 origin by an angle a,
     * given in radians
     * @param {Number} a angle to rotate around, in radians
     * @return {Point} output point
     */
    rotate: function rotate(a) {
        return this.clone()._rotate(a);
    },

    /**
     * Rotate this point around p point by an angle a,
     * given in radians
     * @param {Number} a angle to rotate around, in radians
     * @param {Point} p Point to rotate around
     * @return {Point} output point
     */
    rotateAround: function rotateAround(a, p) {
        return this.clone()._rotateAround(a, p);
    },

    /**
     * Multiply this point by a 4x1 transformation matrix
     * @param {Array<Number>} m transformation matrix
     * @return {Point} output point
     */
    matMult: function matMult(m) {
        return this.clone()._matMult(m);
    },

    /**
     * Calculate this point but as a unit vector from 0, 0, meaning
     * that the distance from the resulting point to the 0, 0
     * coordinate will be equal to 1 and the angle from the resulting
     * point to the 0, 0 coordinate will be the same as before.
     * @return {Point} unit vector point
     */
    unit: function unit() {
        return this.clone()._unit();
    },

    /**
     * Compute a perpendicular point, where the new y coordinate
     * is the old x coordinate and the new x coordinate is the old y
     * coordinate multiplied by -1
     * @return {Point} perpendicular point
     */
    perp: function perp() {
        return this.clone()._perp();
    },

    /**
     * Return a version of this point with the x & y coordinates
     * rounded to integers.
     * @return {Point} rounded point
     */
    round: function round() {
        return this.clone()._round();
    },

    /**
     * Return the magitude of this point: this is the Euclidean
     * distance from the 0, 0 coordinate to this point's x and y
     * coordinates.
     * @return {Number} magnitude
     */
    mag: function mag() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    },

    /**
     * Judge whether this point is equal to another point, returning
     * true or false.
     * @param {Point} other the other point
     * @return {boolean} whether the points are equal
     */
    equals: function equals(other) {
        return this.x === other.x && this.y === other.y;
    },

    /**
     * Calculate the distance from this point to another point
     * @param {Point} p the other point
     * @return {Number} distance
     */
    dist: function dist(p) {
        return Math.sqrt(this.distSqr(p));
    },

    /**
     * Calculate the distance from this point to another point,
     * without the square root step. Useful if you're comparing
     * relative distances.
     * @param {Point} p the other point
     * @return {Number} distance
     */
    distSqr: function distSqr(p) {
        var dx = p.x - this.x,
            dy = p.y - this.y;
        return dx * dx + dy * dy;
    },

    /**
     * Get the angle from the 0, 0 coordinate to this point, in radians
     * coordinates.
     * @return {Number} angle
     */
    angle: function angle() {
        return Math.atan2(this.y, this.x);
    },

    /**
     * Get the angle from this point to another point, in radians
     * @param {Point} b the other point
     * @return {Number} angle
     */
    angleTo: function angleTo(b) {
        return Math.atan2(this.y - b.y, this.x - b.x);
    },

    /**
     * Get the angle between this point and another point, in radians
     * @param {Point} b the other point
     * @return {Number} angle
     */
    angleWith: function angleWith(b) {
        return this.angleWithSep(b.x, b.y);
    },

    /*
     * Find the angle of the two vectors, solving the formula for
     * the cross product a x b = |a||b|sin(θ) for θ.
     * @param {Number} x the x-coordinate
     * @param {Number} y the y-coordinate
     * @return {Number} the angle in radians
     */
    angleWithSep: function angleWithSep(x, y) {
        return Math.atan2(this.x * y - this.y * x, this.x * x + this.y * y);
    },

    _matMult: function _matMult(m) {
        var x = m[0] * this.x + m[1] * this.y,
            y = m[2] * this.x + m[3] * this.y;
        this.x = x;
        this.y = y;
        return this;
    },

    _add: function _add(p) {
        this.x += p.x;
        this.y += p.y;
        return this;
    },

    _sub: function _sub(p) {
        this.x -= p.x;
        this.y -= p.y;
        return this;
    },

    _mult: function _mult(k) {
        this.x *= k;
        this.y *= k;
        return this;
    },

    _div: function _div(k) {
        this.x /= k;
        this.y /= k;
        return this;
    },

    _multByPoint: function _multByPoint(p) {
        this.x *= p.x;
        this.y *= p.y;
        return this;
    },

    _divByPoint: function _divByPoint(p) {
        this.x /= p.x;
        this.y /= p.y;
        return this;
    },

    _unit: function _unit() {
        this._div(this.mag());
        return this;
    },

    _perp: function _perp() {
        var y = this.y;
        this.y = this.x;
        this.x = -y;
        return this;
    },

    _rotate: function _rotate(angle) {
        var cos = Math.cos(angle),
            sin = Math.sin(angle),
            x = cos * this.x - sin * this.y,
            y = sin * this.x + cos * this.y;
        this.x = x;
        this.y = y;
        return this;
    },

    _rotateAround: function _rotateAround(angle, p) {
        var cos = Math.cos(angle),
            sin = Math.sin(angle),
            x = p.x + cos * (this.x - p.x) - sin * (this.y - p.y),
            y = p.y + sin * (this.x - p.x) + cos * (this.y - p.y);
        this.x = x;
        this.y = y;
        return this;
    },

    _round: function _round() {
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

var PlotUtils = {
    /**
     * Get arrow body for given vertexes.
     * @param  {maptalks.Coordinate[]} vertexes    - input vertexes
     * @param  {[type]} lineWidth [description]
     * @param  {[type]} map       [description]
     * @param  {[type]} ratio     [description]
     * @return {[type]}           [description]
     */
    getArrowBody: function getArrowBody(vertexes, lineWidth, map, ratio, arrowLength) {
        lineWidth /= 2;
        var arrowWidth;
        var currentLen = 0;
        var upPlots = [],
            downPlots = [];
        var pair;
        var dx, dy;
        var current, prev, next;
        var normal, currentNormal, nextNormal;
        for (var i = 1, l = vertexes.length; i < l; i++) {
            current = new pointGeometry(vertexes[i].x, vertexes[i].y);
            prev = new pointGeometry(vertexes[i - 1].x, vertexes[i - 1].y);
            if (ratio && arrowLength) {
                currentLen += current.dist(prev);
                arrowWidth = (1 - (1 - ratio) * currentLen / arrowLength) * lineWidth;
            } else {
                arrowWidth = lineWidth;
            }

            if (i < l - 1) {
                next = new pointGeometry(vertexes[i + 1].x, vertexes[i + 1].y);
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
    _getJoinNormal: function _getJoinNormal(normal, nextNormal) {
        var joinNormal = normal.add(nextNormal)._unit();
        var cosHalfAngle = joinNormal.x * nextNormal.x + joinNormal.y * nextNormal.y;
        var miterLength = 1 / cosHalfAngle;
        return joinNormal._mult(miterLength);
    },
    _getPlotPair: function _getPlotPair(vertex, normal, lineWidth, map) {
        // first plot pair
        var dx = normal.x * lineWidth;
        var dy = normal.y * lineWidth;
        var p1 = vertex.add(dx, dy);
        var p2 = vertex.add(-dx, -dy);
        return [p1, p2];
    }
};

function _defaults(obj, defaults) { var keys = Object.getOwnPropertyNames(defaults); for (var i = 0; i < keys.length; i++) { var key = keys[i]; var value = Object.getOwnPropertyDescriptor(defaults, key); if (value && value.configurable && obj[key] === undefined) { Object.defineProperty(obj, key, value); } } return obj; }











var classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};











var inherits = function (subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
  }

  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
  if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : _defaults(subClass, superClass);
};











var possibleConstructorReturn = function (self, call) {
  if (!self) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return call && (typeof call === "object" || typeof call === "function") ? call : self;
};

/**
 * @property {Object} options
 */
var options = {
    'widthRatio': 0.10,
    'arrowStyle': []
};

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

var StraightArrow = function (_maptalks$Curve) {
    inherits(StraightArrow, _maptalks$Curve);

    function StraightArrow() {
        classCallCheck(this, StraightArrow);
        return possibleConstructorReturn(this, _maptalks$Curve.apply(this, arguments));
    }

    StraightArrow.fromJSON = function fromJSON(json) {
        var feature = json['feature'];
        var arrow = new StraightArrow(feature['geometry']['coordinates'], json['options']);
        arrow.setProperties(feature['properties']);
        return arrow;
    };

    StraightArrow.prototype._toJSON = function _toJSON(options) {
        return {
            'feature': this.toGeoJSON(options),
            'subType': 'StraightArrow'
        };
    };

    StraightArrow.prototype._getPaintParams = function _getPaintParams() {
        var map = this.getMap();
        var zoomScale = map.getGLScale();
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
        var plots = [];
        plots.push.apply(plots, arrowPairs[0]);
        plots.push.apply(plots, arrowHead);
        for (var i = arrowPairs[1].length - 1; i >= 0; i--) {
            plots.push(arrowPairs[1][i]);
        }
        // convert to point in maxZoom
        plots = plots.map(function (p) {
            return p.multi(zoomScale);
        });
        return [plots, [arrowPairs[0].length, arrowHead.length, arrowPairs[1].length]];
    };

    StraightArrow.prototype._paintOn = function _paintOn(ctx, points, segs, lineOpacity, fillOpacity, lineDasharray) {
        ctx.beginPath();
        var seg;
        //draw body upside
        var i = 0;
        ctx.moveTo(points[0].x, points[0].y);
        seg = points.slice(0, segs[0]);
        this._quadraticCurve(ctx, seg);
        //draw head
        i += segs[0];
        Canvas._path(ctx, points.slice(i, i + segs[1]), lineDasharray, lineOpacity);
        //draw body downside
        i += segs[1];
        ctx.lineTo(points[i].x, points[i].y);
        seg = points.slice(i, i + segs[2]);
        this._quadraticCurve(ctx, seg);
        this._closeArrow(ctx, points[points.length - 1], points[0]);
        Canvas._stroke(ctx, lineOpacity);
        Canvas.fillCanvas(ctx, fillOpacity, points[0].x, points[0].y);
    };

    StraightArrow.prototype._closeArrow = function _closeArrow(ctx) {
        ctx.closePath();
    };

    /**
     * Get points of arrow head
     * @param  {maptalks.Coordinate} h1   - head point 1
     * @param  {maptalks.Coordinate} h2   - head point 2
     * @param  {maptalks.Coordinate} vertex - head vertex
     * @param  {Number} lineWidth         - line width
     * @return {maptalks.Coordinate[]}
     */


    StraightArrow.prototype._getArrowHead = function _getArrowHead(h1, h2, vertex, lineWidth, hScale) {
        if (!hScale) {
            hScale = 1;
        }
        h1 = new pointGeometry(h1.x, h1.y);
        h2 = new pointGeometry(h2.x, h2.y);
        var normal = h1.sub(h2)._unit();
        var head0 = vertex.add(lineWidth * normal.x, lineWidth * normal.y);
        var head2 = vertex.add(lineWidth * -normal.x, lineWidth * -normal.y);
        normal._perp()._mult(-1);
        var head1 = vertex.add(hScale * lineWidth * normal.x, hScale * lineWidth * normal.y);
        return [head0, head1, head2];
    };

    return StraightArrow;
}(Curve);

StraightArrow.mergeOptions(options);

StraightArrow.registerJSONType('StraightArrow');

DrawTool.registerMode('StraightArrow', {
    action: ['click', 'mousemove', 'dblclick'],
    create: function create(path) {
        return new StraightArrow(path);
    },
    update: function update(path, geometry) {
        geometry.setCoordinates(path);
    },
    generate: function generate(geometry) {
        return geometry;
    }
});

/**
 * @property {Object} options
 */
var options$1 = {
    'widthRatio': 0.20,
    'arrowStyle': []
};

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

var DiagonalArrow = function (_StraightArrow) {
    inherits(DiagonalArrow, _StraightArrow);

    function DiagonalArrow() {
        classCallCheck(this, DiagonalArrow);
        return possibleConstructorReturn(this, _StraightArrow.apply(this, arguments));
    }

    DiagonalArrow.fromJSON = function fromJSON(json) {
        var feature = json['feature'];
        var arrow = new DiagonalArrow(feature['geometry']['coordinates'], json['options']);
        arrow.setProperties(feature['properties']);
        return arrow;
    };

    DiagonalArrow.prototype._toJSON = function _toJSON(options) {
        return {
            'feature': this.toGeoJSON(options),
            'subType': 'DiagonalArrow'
        };
    };

    DiagonalArrow.prototype._getPaintParams = function _getPaintParams() {
        var points = this._getPath2DPoints(this._getPrjCoordinates());
        if (points.length <= 1) {
            return null;
        }
        var zoomScale = this.getMap().getGLScale();
        var length = this._get2DLength();
        var lineWidth = length * this.options['widthRatio'];

        var arrowPairs = PlotUtils.getArrowBody(points, lineWidth, this.getMap(), 0.15, length);
        var h1 = arrowPairs[0][arrowPairs[0].length - 1],
            h2 = arrowPairs[1][arrowPairs[1].length - 1];
        var arrowHead = this._getArrowHead(h1, h2, points[points.length - 1], lineWidth * 0.3, 2);
        var plots = [];
        plots.push.apply(plots, arrowPairs[0]);
        plots.push.apply(plots, arrowHead);
        for (var i = arrowPairs[1].length - 1; i >= 0; i--) {
            plots.push(arrowPairs[1][i]);
        }
        // convert to point in maxZoom
        plots = plots.map(function (p) {
            return p.multi(zoomScale);
        });
        return [plots, [arrowPairs[0].length, arrowHead.length, arrowPairs[1].length]];
    };

    return DiagonalArrow;
}(StraightArrow);

DiagonalArrow.mergeOptions(options$1);

DiagonalArrow.registerJSONType('DiagonalArrow');

DrawTool.registerMode('DiagonalArrow', {
    'action': ['click', 'mousemove', 'dblclick'],
    'create': function create(path) {
        return new DiagonalArrow(path);
    },
    'update': function update(path, geometry) {
        geometry.setCoordinates(path);
    },
    'generate': function generate(geometry) {
        return geometry;
    }
});

/**
 * @property {Object} options
 */
var options$2 = {
    'widthRatio': 0.20,
    'arrowStyle': []
};

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

var DoveTailDiagonalArrow = function (_DiagonalArrow) {
    inherits(DoveTailDiagonalArrow, _DiagonalArrow);

    function DoveTailDiagonalArrow() {
        classCallCheck(this, DoveTailDiagonalArrow);
        return possibleConstructorReturn(this, _DiagonalArrow.apply(this, arguments));
    }

    DoveTailDiagonalArrow.fromJSON = function fromJSON(json) {
        var feature = json['feature'];
        var arrow = new DoveTailDiagonalArrow(feature['geometry']['coordinates'], json['options']);
        arrow.setProperties(feature['properties']);
        return arrow;
    };

    DoveTailDiagonalArrow.prototype._toJSON = function _toJSON(options) {
        return {
            'feature': this.toGeoJSON(options),
            'subType': 'DoveTailDiagonalArrow'
        };
    };

    DoveTailDiagonalArrow.prototype._closeArrow = function _closeArrow(ctx, last, first) {
        var t1 = new pointGeometry(last.x, last.y);
        var t2 = new pointGeometry(first.x, first.y);
        var m = new pointGeometry(t1.x + t2.x, t1.y + t2.y).mult(1 / 2);
        var dist = t1.dist(t2);
        var normal = t1.sub(t2)._unit()._perp();
        var xc = m.x + dist * 0.618 * normal.x,
            yc = m.y + dist * 0.618 * normal.y;
        ctx.lineTo(xc, yc);
        ctx.closePath();
    };

    return DoveTailDiagonalArrow;
}(DiagonalArrow);

DoveTailDiagonalArrow.mergeOptions(options$2);

DoveTailDiagonalArrow.registerJSONType('DoveTailDiagonalArrow');

DrawTool.registerMode('DoveTailDiagonalArrow', {
    'action': ['click', 'mousemove', 'dblclick'],
    'create': function create(path) {
        return new DoveTailDiagonalArrow(path);
    },
    'update': function update(path, geometry) {
        geometry.setCoordinates(path);
    },
    'generate': function generate(geometry) {
        return geometry;
    }
});

export { StraightArrow, DiagonalArrow, DoveTailDiagonalArrow };

typeof console !== 'undefined' && console.log('maptalks.plotsymbol v0.3.0, requires maptalks@>=0.44.0.');
