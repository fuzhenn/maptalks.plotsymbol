/*!
 * maptalks.plotsymbol v0.3.0
 * LICENSE : MIT
 * (c) 2016-2019 maptalks.org
 */
/*!
 * requires maptalks@>=0.44.0 
 */
(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('maptalks')) :
	typeof define === 'function' && define.amd ? define(['exports', 'maptalks'], factory) :
	(factory((global.maptalks = global.maptalks || {}),global.maptalks));
}(this, (function (exports,maptalks) { 'use strict';

var pointGeometry = Point$1;

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
function Point$1(x, y) {
    this.x = x;
    this.y = y;
}

Point$1.prototype = {

    /**
     * Clone this point, returning a new point that can be modified
     * without affecting the old one.
     * @return {Point} the clone
     */
    clone: function clone() {
        return new Point$1(this.x, this.y);
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
Point$1.convert = function (a) {
    if (a instanceof Point$1) {
        return a;
    }
    if (Array.isArray(a)) {
        return new Point$1(a[0], a[1]);
    }
    return a;
};

var FITTING_COUNT = 100;
var HALF_PI = Math.PI / 2;
var ZERO_TOLERANCE = 0.0001;

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

var Coordinate$1 = maptalks.Coordinate;
var Canvas$1 = maptalks.Canvas;

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
function getJoinNormal(normal, nextNormal) {
    var joinNormal = normal.add(nextNormal)._unit();
    var cosHalfAngle = joinNormal.x * nextNormal.x + joinNormal.y * nextNormal.y;
    var miterLength = 1 / cosHalfAngle;
    return joinNormal._mult(miterLength);
}

function getPlotPair(vertex, normal, lineWidth) {
    // first plot pair
    var dx = normal.x * lineWidth;
    var dy = normal.y * lineWidth;
    var p1 = vertex.add(dx, dy);
    var p2 = vertex.add(-dx, -dy);
    return [p1, p2];
}

/**
   * Get arrow body for given vertexes.
   * @param  {maptalks.Coordinate[]} vertexes    - input vertexes
   * @param  {[type]} lineWidth [description]
   * @param  {[type]} map       [description]
   * @param  {[type]} ratio     [description]
   * @return {[type]}           [description]
   */
var getArrowBody = function getArrowBody(vertexes, lineWidth, map, ratio, arrowLength) {
    lineWidth /= 2;
    var arrowWidth = void 0;
    var currentLen = 0;
    var upPlots = [],
        downPlots = [];
    var pair = void 0;
    // let dx, dy;
    var current = void 0,
        prev = void 0,
        next = void 0;
    var normal = void 0,
        currentNormal = void 0,
        nextNormal = void 0;
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
            pair = getPlotPair(vertexes[i - 1], normal, lineWidth, map);
            upPlots.push(pair[0]);
            downPlots.push(pair[1]);
        }
        if (next) {
            nextNormal = next.sub(current)._unit()._perp();
            currentNormal = getJoinNormal(normal, nextNormal);
        } else {
            currentNormal = normal;
        }
        if (isNaN(currentNormal.x) || isNaN(currentNormal.y)) {
            continue;
        }
        pair = getPlotPair(vertexes[i], currentNormal, arrowWidth, map);
        upPlots.push(pair[0]);
        downPlots.push(pair[1]);
    }
    return [upPlots, downPlots];
};

/**
 * 计算两个坐标之间的距离
 * @param pnt1
 * @param pnt2
 * @returns {number}
 * @constructor
 */
var MathDistance = function MathDistance(pnt1, pnt2) {
    return Math.sqrt(Math.pow(pnt1[0] - pnt2[0], 2) + Math.pow(pnt1[1] - pnt2[1], 2));
};

/**
 * 计算距离
 * @param measurer
 * @param pnt1
 * @param pnt2
 * @returns {*}
 */
var pointDistance = function pointDistance(measurer, pnt1, pnt2) {
    return measurer.measureLength(Coordinate$1.toCoordinates(pnt1), Coordinate$1.toCoordinates(pnt2));
};
/**
 * 插值弓形线段点
 * @param measurer
 * @param center
 * @param radius
 * @param startAngle
 * @param endAngle
 * @param numberOfPoints
 * @returns {null}
 */
var getSectorPoints = function getSectorPoints(measurer, center, radius, startAngle, endAngle) {
    var numberOfPoints = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : 100;
    var dx = null,
        dy = null,
        angleDiff = endAngle - startAngle;

    var points = [];
    angleDiff = angleDiff < 0 ? angleDiff + Math.PI * 2 : angleDiff;
    for (var i = 0; i < numberOfPoints; i++) {
        var rad = angleDiff * i / numberOfPoints + startAngle;
        dx = radius * Math.cos(rad);
        dy = radius * Math.sin(rad);
        var vertex = measurer.locate({
            'x': center[0],
            'y': center[1]
        }, dx, dy);
        points.push([vertex['x'], vertex['y']]);
    }
    return points;
};
/**
 * 计算点集合的总距离
 * @param points
 * @returns {number}
 */
var wholeDistance = function wholeDistance(points) {
    var distance = 0;
    if (points && Array.isArray(points) && points.length > 0) {
        points.forEach(function (item, index) {
            if (index < points.length - 1) {
                distance += MathDistance(item, points[index + 1]);
            }
        });
    }
    return distance;
};
/**
 * 获取基础长度
 * @param points
 * @returns {number}
 */
var getBaseLength = function getBaseLength(points) {
    return Math.pow(wholeDistance(points), 0.99);
};

/**
 * 求取两个坐标的中间值
 * @param point1
 * @param point2
 * @returns {[*,*]}
 * @constructor
 */
var Mid = function Mid(point1, point2) {
    return [(point1[0] + point2[0]) / 2, (point1[1] + point2[1]) / 2];
};

/**
 * 获取交集的点
 * @param pntA
 * @param pntB
 * @param pntC
 * @param pntD
 * @returns {[*,*]}
 */


/**
 * 通过三个点确定一个圆的中心点
 * @param point1
 * @param point2
 * @param point3
 */


/**
 * 获取方位角（地平经度）
 * @param startPoint
 * @param endPoint
 * @returns {*}
 */
var getAzimuth = function getAzimuth(startPoint, endPoint) {
    var azimuth = void 0;
    var angle = Math.asin(Math.abs(endPoint[1] - startPoint[1]) / MathDistance(startPoint, endPoint));
    if (endPoint[1] >= startPoint[1] && endPoint[0] >= startPoint[0]) {
        azimuth = angle + Math.PI;
    } else if (endPoint[1] >= startPoint[1] && endPoint[0] < startPoint[0]) {
        azimuth = Math.PI * 2 - angle;
    } else if (endPoint[1] < startPoint[1] && endPoint[0] < startPoint[0]) {
        azimuth = angle;
    } else if (endPoint[1] < startPoint[1] && endPoint[0] >= startPoint[0]) {
        azimuth = Math.PI - angle;
    }
    return azimuth;
};

/**
 * 通过三个点获取方位角
 * @param pntA
 * @param pntB
 * @param pntC
 * @returns {number}
 */
var getAngleOfThreePoints = function getAngleOfThreePoints(pntA, pntB, pntC) {
    var angle = getAzimuth(pntB, pntA) - getAzimuth(pntB, pntC);
    return angle < 0 ? angle + Math.PI * 2 : angle;
};

/**
 * 判断是否是顺时针
 * @param pnt1
 * @param pnt2
 * @param pnt3
 * @returns {boolean}
 */
var isClockWise = function isClockWise(pnt1, pnt2, pnt3) {
    return (pnt3[1] - pnt1[1]) * (pnt2[0] - pnt1[0]) > (pnt2[1] - pnt1[1]) * (pnt3[0] - pnt1[0]);
};

/**
 * 获取立方值
 * @param t
 * @param startPnt
 * @param cPnt1
 * @param cPnt2
 * @param endPnt
 * @returns {[*,*]}
 */
var getCubicValue = function getCubicValue(t, startPnt, cPnt1, cPnt2, endPnt) {
    t = Math.max(Math.min(t, 1), 0);
    var tp = 1 - t,
        t2 = t * t;

    var t3 = t2 * t;
    var tp2 = tp * tp;
    var tp3 = tp2 * tp;
    var x = tp3 * startPnt[0] + 3 * tp2 * t * cPnt1[0] + 3 * tp * t2 * cPnt2[0] + t3 * endPnt[0];
    var y = tp3 * startPnt[1] + 3 * tp2 * t * cPnt1[1] + 3 * tp * t2 * cPnt2[1] + t3 * endPnt[1];
    return [x, y];
};

/**
 * 根据起止点和旋转方向求取第三个点
 * @param startPnt
 * @param endPnt
 * @param angle
 * @param distance
 * @param clockWise
 * @returns {[*,*]}
 */
var getThirdPoint = function getThirdPoint(startPnt, endPnt, angle, distance, clockWise) {
    var azimuth = getAzimuth(startPnt, endPnt);
    var alpha = clockWise ? azimuth + angle : azimuth - angle;
    var dx = distance * Math.cos(alpha);
    var dy = distance * Math.sin(alpha);
    return [endPnt[0] + dx, endPnt[1] + dy];
};

/**
 * 插值弓形线段点
 * @param center
 * @param radius
 * @param startAngle
 * @param endAngle
 * @returns {null}
 */


/**
 * 获取默认三点的内切圆
 * @param pnt1
 * @param pnt2
 * @param pnt3
 * @returns {[*,*]}
 */
var getNormal = function getNormal(pnt1, pnt2, pnt3) {
    var dX1 = pnt1[0] - pnt2[0];
    var dY1 = pnt1[1] - pnt2[1];
    var d1 = Math.sqrt(dX1 * dX1 + dY1 * dY1);
    dX1 /= d1;
    dY1 /= d1;
    var dX2 = pnt3[0] - pnt2[0];
    var dY2 = pnt3[1] - pnt2[1];
    var d2 = Math.sqrt(dX2 * dX2 + dY2 * dY2);
    dX2 /= d2;
    dY2 /= d2;
    var uX = dX1 + dX2;
    var uY = dY1 + dY2;
    return [uX, uY];
};

/**
 * getBisectorNormals
 * @param t
 * @param pnt1
 * @param pnt2
 * @param pnt3
 * @returns {[*,*]}
 */
var getBisectorNormals = function getBisectorNormals(t, pnt1, pnt2, pnt3) {
    var normal = getNormal(pnt1, pnt2, pnt3);
    var bisectorNormalRight = null,
        bisectorNormalLeft = null,
        dt = null,
        x = null,
        y = null;

    var dist = Math.sqrt(normal[0] * normal[0] + normal[1] * normal[1]);
    var uX = normal[0] / dist;
    var uY = normal[1] / dist;
    var d1 = MathDistance(pnt1, pnt2);
    var d2 = MathDistance(pnt2, pnt3);
    if (dist > ZERO_TOLERANCE) {
        if (isClockWise(pnt1, pnt2, pnt3)) {
            dt = t * d1;
            x = pnt2[0] - dt * uY;
            y = pnt2[1] + dt * uX;
            bisectorNormalRight = [x, y];
            dt = t * d2;
            x = pnt2[0] + dt * uY;
            y = pnt2[1] - dt * uX;
            bisectorNormalLeft = [x, y];
        } else {
            dt = t * d1;
            x = pnt2[0] + dt * uY;
            y = pnt2[1] - dt * uX;
            bisectorNormalRight = [x, y];
            dt = t * d2;
            x = pnt2[0] - dt * uY;
            y = pnt2[1] + dt * uX;
            bisectorNormalLeft = [x, y];
        }
    } else {
        x = pnt2[0] + t * (pnt1[0] - pnt2[0]);
        y = pnt2[1] + t * (pnt1[1] - pnt2[1]);
        bisectorNormalRight = [x, y];
        x = pnt2[0] + t * (pnt3[0] - pnt2[0]);
        y = pnt2[1] + t * (pnt3[1] - pnt2[1]);
        bisectorNormalLeft = [x, y];
    }
    return [bisectorNormalRight, bisectorNormalLeft];
};

/**
 * 获取左边控制点
 * @param controlPoints
 * @returns {[*,*]}
 */


/**
 * 获取右边控制点
 * @param controlPoints
 * @param t
 * @returns {[*,*]}
 */


/**
 * 插值曲线点
 * @param t
 * @param controlPoints
 * @returns {null}
 */


/**
 * 获取阶乘数据
 * @param n
 * @returns {number}
 */
var getFactorial = function getFactorial(n) {
    var result = 1;
    switch (n) {
        case n <= 1:
            result = 1;
            break;
        case n === 2:
            result = 2;
            break;
        case n === 3:
            result = 6;
            break;
        case n === 24:
            result = 24;
            break;
        case n === 5:
            result = 120;
            break;
        default:
            for (var i = 1; i <= n; i++) {
                result *= i;
            }
            break;
    }
    return result;
};

/**
 * 获取二项分布
 * @param n
 * @param index
 * @returns {number}
 */
var getBinomialFactor = function getBinomialFactor(n, index) {
    return getFactorial(n) / (getFactorial(index) * getFactorial(n - index));
};

/**
 * 贝塞尔曲线
 * @param points
 * @returns {*}
 */
var getBezierPoints = function getBezierPoints(points) {
    if (points.length <= 2) {
        return points;
    } else {
        var bezierPoints = [];
        var n = points.length - 1;
        for (var t = 0; t <= 1; t += 0.01) {
            var x = 0,
                y = 0;

            for (var index = 0; index <= n; index++) {
                var factor = getBinomialFactor(n, index);
                var a = Math.pow(t, index);
                var b = Math.pow(1 - t, n - index);
                x += factor * a * b * points[index][0];
                y += factor * a * b * points[index][1];
            }
            bezierPoints.push([x, y]);
        }
        bezierPoints.push(points[n]);
        return bezierPoints;
    }
};

/**
 * 得到二次线性因子
 * @param k
 * @param t
 * @returns {number}
 */


/**
 * 插值线性点
 * @param points
 * @returns {*}
 */






/**
     * 判断是否为对象
     * @param value
     * @returns {boolean}
     */




//和maptalks.Canvas.paintSmoothLine类似，只不过去掉了begainPath的逻辑
var paintSmoothLine = function paintSmoothLine(ctx, points, lineOpacity, smoothValue, draw, close, tailIdx, tailRatio) {
    //推算 cubic 贝塞尔曲线片段的起终点和控制点坐标
    //t0: 片段起始比例 0-1
    //t1: 片段结束比例 0-1
    //x1, y1, 曲线起点
    //bx1, by1, bx2, by2，曲线控制点
    //x2, y2  曲线终点
    //结果是曲线片段的起点，2个控制点坐标和终点坐标
    //https://stackoverflow.com/questions/878862/drawing-part-of-a-b%C3%A9zier-curve-by-reusing-a-basic-b%C3%A9zier-curve-function/879213#879213
    function interpolate(t0, t1, x1, y1, bx1, by1, bx2, by2, x2, y2) {
        var u0 = 1.0 - t0;
        var u1 = 1.0 - t1;

        var qxa = x1 * u0 * u0 + bx1 * 2 * t0 * u0 + bx2 * t0 * t0;
        var qxb = x1 * u1 * u1 + bx1 * 2 * t1 * u1 + bx2 * t1 * t1;
        var qxc = bx1 * u0 * u0 + bx2 * 2 * t0 * u0 + x2 * t0 * t0;
        var qxd = bx1 * u1 * u1 + bx2 * 2 * t1 * u1 + x2 * t1 * t1;

        var qya = y1 * u0 * u0 + by1 * 2 * t0 * u0 + by2 * t0 * t0;
        var qyb = y1 * u1 * u1 + by1 * 2 * t1 * u1 + by2 * t1 * t1;
        var qyc = by1 * u0 * u0 + by2 * 2 * t0 * u0 + y2 * t0 * t0;
        var qyd = by1 * u1 * u1 + by2 * 2 * t1 * u1 + y2 * t1 * t1;

        // const xa = qxa * u0 + qxc * t0;
        var xb = qxa * u1 + qxc * t1;
        var xc = qxb * u0 + qxd * t0;
        var xd = qxb * u1 + qxd * t1;

        // const ya = qya * u0 + qyc * t0;
        var yb = qya * u1 + qyc * t1;
        var yc = qyb * u0 + qyd * t0;
        var yd = qyb * u1 + qyd * t1;

        return [xb, yb, xc, yc, xd, yd];
    }

    //from http://www.antigrain.com/research/bezier_interpolation/
    function getCubicControlPoints(x0, y0, x1, y1, x2, y2, x3, y3, smoothValue, t) {
        // Assume we need to calculate the control
        // points between (x1,y1) and (x2,y2).
        // Then x0,y0 - the previous vertex,
        //      x3,y3 - the next one.
        var xc1 = (x0 + x1) / 2.0,
            yc1 = (y0 + y1) / 2.0;
        var xc2 = (x1 + x2) / 2.0,
            yc2 = (y1 + y2) / 2.0;
        var xc3 = (x2 + x3) / 2.0,
            yc3 = (y2 + y3) / 2.0;

        var len1 = Math.sqrt((x1 - x0) * (x1 - x0) + (y1 - y0) * (y1 - y0));
        var len2 = Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));
        var len3 = Math.sqrt((x3 - x2) * (x3 - x2) + (y3 - y2) * (y3 - y2));

        var k1 = len1 / (len1 + len2);
        var k2 = len2 / (len2 + len3);

        var xm1 = xc1 + (xc2 - xc1) * k1,
            ym1 = yc1 + (yc2 - yc1) * k1;

        var xm2 = xc2 + (xc3 - xc2) * k2,
            ym2 = yc2 + (yc3 - yc2) * k2;

        // Resulting control points. Here smoothValue is mentioned
        // above coefficient K whose value should be in range [0...1].
        var ctrl1X = xm1 + (xc2 - xm1) * smoothValue + x1 - xm1,
            ctrl1Y = ym1 + (yc2 - ym1) * smoothValue + y1 - ym1,
            ctrl2X = xm2 + (xc2 - xm2) * smoothValue + x2 - xm2,
            ctrl2Y = ym2 + (yc2 - ym2) * smoothValue + y2 - ym2;

        var ctrlPoints = [ctrl1X, ctrl1Y, ctrl2X, ctrl2Y];
        if (t < 1) {
            return interpolate(0, t, x1, y1, ctrl1X, ctrl1Y, ctrl2X, ctrl2Y, x2, y2);
        } else {
            return ctrlPoints;
        }
    }

    function path(ctx, points, lineOpacity, fillOpacity, lineDashArray) {
        if (!maptalks.Util.isArrayHasData(points)) {
            return;
        }
        Canvas$1._path(ctx, points, lineDashArray, lineOpacity);
        Canvas$1._stroke(ctx, lineOpacity);
    }

    if (!points) {
        return null;
    }
    if (points.length <= 2 || !smoothValue) {
        if (draw) {
            path(ctx, points, lineOpacity);
        }
        return null;
    }

    var count = points.length;
    var l = close ? count : count - 1;

    if (tailRatio !== undefined) l -= Math.max(l - tailIdx - 1, 0);
    var preCtrlPoints = void 0;
    for (var i = 0; i < l; i++) {
        var x1 = points[i].x,
            y1 = points[i].y;

        var x0 = void 0,
            y0 = void 0,
            x2 = void 0,
            y2 = void 0,
            x3 = void 0,
            y3 = void 0;
        if (i - 1 < 0) {
            if (!close) {
                x0 = points[i + 1].x;
                y0 = points[i + 1].y;
            } else {
                x0 = points[l - 1].x;
                y0 = points[l - 1].y;
            }
        } else {
            x0 = points[i - 1].x;
            y0 = points[i - 1].y;
        }
        if (i + 1 < count) {
            x2 = points[i + 1].x;
            y2 = points[i + 1].y;
        } else {
            x2 = points[i + 1 - count].x;
            y2 = points[i + 1 - count].y;
        }
        if (i + 2 < count) {
            x3 = points[i + 2].x;
            y3 = points[i + 2].y;
        } else if (!close) {
            x3 = points[i].x;
            y3 = points[i].y;
        } else {
            x3 = points[i + 2 - count].x;
            y3 = points[i + 2 - count].y;
        }

        var ctrlPoints = getCubicControlPoints(x0, y0, x1, y1, x2, y2, x3, y3, smoothValue, i === l - 1 ? tailRatio : 1);
        if (i === l - 1 && tailRatio >= 0 && tailRatio < 1) {
            if (ctx) {
                ctx.bezierCurveTo(ctrlPoints[0], ctrlPoints[1], ctrlPoints[2], ctrlPoints[3], ctrlPoints[4], ctrlPoints[5]);
            }
            points.splice(l - 1, count - (l - 1) - 1);
            var lastPoint = new pointGeometry(ctrlPoints[4], ctrlPoints[5]);
            lastPoint.prevCtrlPoint = new pointGeometry(ctrlPoints[2], ctrlPoints[3]);
            points.push(lastPoint);
            count = points.length;
        } else if (ctx) {
            ctx.bezierCurveTo(ctrlPoints[0], ctrlPoints[1], ctrlPoints[2], ctrlPoints[3], x2, y2);
        }
        points[i].nextCtrlPoint = ctrlPoints.slice(0, 2);
        points[i].prevCtrlPoint = preCtrlPoints ? preCtrlPoints.slice(2) : null;
        preCtrlPoints = ctrlPoints;
    }
    if (!close && points[1].prevCtrlPoint) {
        points[0].nextCtrlPoint = points[1].prevCtrlPoint;
        delete points[0].prevCtrlPoint;
    }
    if (!points[count - 1].prevCtrlPoint) {
        points[count - 1].prevCtrlPoint = points[count - 2].nextCtrlPoint;
    }
    if (draw) {
        Canvas$1._stroke(ctx, lineOpacity);
    }
    return points;
};

/**
 * @property {Object} options
 */
var options = {
    'widthRatio': 0.10,
    'arrowStyle': [],
    'tailWidthFactor': 0.1,
    'headWidthFactor': 1,
    'neckWidthFactor': 0.2,
    'headAngle': Math.PI / 8.5,
    'neckAngle': Math.PI / 13
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
 *             'lineWidth': 5
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

    StraightArrow.prototype.startEdit = function startEdit() {
        var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

        options.newVertexHandleSymbol = {
            opacity: 0
        };
        return _maptalks$Curve.prototype.startEdit.call(this, options);
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

        var arrowPairs = getArrowBody(points, lineWidth, this.getMap());
        var h1 = arrowPairs[0][arrowPairs[0].length - 1],
            h2 = arrowPairs[1][arrowPairs[1].length - 1];
        var arrowHead = this._getArrowHead(h1, h2, points, lineWidth, 1, 0.8, 1.4, 2.2, 0.7, 2.3);
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
        var seg = void 0;
        //draw body upside
        var i = 0;
        ctx.moveTo(points[0].x, points[0].y);
        seg = points.slice(0, segs[0]);
        // this._quadraticCurve(ctx, seg);
        paintSmoothLine(ctx, seg, lineOpacity, 0.7, true);
        //draw head
        i += segs[0];
        maptalks.Canvas._path(ctx, points.slice(i, i + segs[1]), lineDasharray, lineOpacity);
        //draw body downside
        i += segs[1];
        seg = points.slice(i, i + segs[2]);
        //this._quadraticCurve(ctx, seg);
        paintSmoothLine(ctx, seg, lineOpacity, 0.7, true);
        this._closeArrow(ctx, points[points.length - 1], points[0]);
        maptalks.Canvas._stroke(ctx, lineOpacity);
        maptalks.Canvas.fillCanvas(ctx, fillOpacity, points[0].x, points[0].y);
    };

    StraightArrow.prototype._closeArrow = function _closeArrow(ctx) {
        ctx.closePath();
    };

    /**
     * Get points of arrow head
     * @param  {maptalks.Point} h1   - head point 1
     * @param  {maptalks.Point} h2   - head point 2
     * @param  {maptalks.Point} points   - all points
     * @param  {Number} lineWidth    - line width
     * @return {maptalks.Point[]}
     */


    StraightArrow.prototype._getArrowHead = function _getArrowHead(h1, h2, points, lineWidth, lineRatio, f1, f2, hScale1, hScale2, h1h2Ration) {
        var arrowHead = this._getArrowHeadPoint(h1, h2, points[points.length - 1], lineWidth * lineRatio, f1, hScale1);
        var vertex01 = new maptalks.Point((arrowHead[0].x + arrowHead[1].x) / 2, (arrowHead[0].y + arrowHead[1].y) / 2);
        var head0 = this._getArrowHeadPoint(arrowHead[0], arrowHead[1], vertex01, lineWidth * lineRatio, f2, hScale2)[0];
        var vertex21 = new maptalks.Point((arrowHead[2].x + arrowHead[1].x) / 2, (arrowHead[2].y + arrowHead[1].y) / 2);
        var head2 = this._getArrowHeadPoint(arrowHead[2], arrowHead[1], vertex21, lineWidth * lineRatio, f2, hScale2)[0];
        if (points.length === 2) {
            arrowHead = [h1, head0, arrowHead[1], head2, h2];
        } else {
            var besierPoints = paintSmoothLine(null, points, null, 0.8, false);
            var controlPoint = new maptalks.Point(besierPoints[besierPoints.length - 1].prevCtrlPoint);
            //计算控制点与最后一个点构成的延长线上的某一点
            var lastPoint = points[points.length - 1];
            var sub = lastPoint.sub(controlPoint);
            if (!sub.x && !sub.y) {
                return null;
            }
            //const subLength = Math.sqrt(sub.x * sub.x + sub.y * sub.y);
            var h1h2Length = h1.distanceTo(h2);
            var direction = sub.unit();
            var headPoint = new maptalks.Point(lastPoint.x + direction.x * h1h2Length * h1h2Ration, lastPoint.y + direction.y * h1h2Length * h1h2Ration);
            arrowHead = [h1, head0, headPoint, head2, h2];
        }
        return arrowHead;
    };

    StraightArrow.prototype._getArrowHeadPoint = function _getArrowHeadPoint(h1, h2, vertex, lineWidth, f, hScale) {
        if (!hScale) {
            hScale = 1;
        }
        h1 = new pointGeometry(h1.x, h1.y);
        h2 = new pointGeometry(h2.x, h2.y);
        var normal = h1.sub(h2)._unit();
        var head0 = vertex.add(lineWidth * normal.x * f, lineWidth * normal.y * f);
        var head2 = vertex.add(lineWidth * -normal.x * f, lineWidth * -normal.y * f);
        normal._perp()._mult(-1);
        var head1 = vertex.add(hScale * lineWidth * normal.x, hScale * lineWidth * normal.y);
        return [head0, head1, head2];
    };

    return StraightArrow;
}(maptalks.Curve);

StraightArrow.mergeOptions(options);

StraightArrow.registerJSONType('StraightArrow');

maptalks.DrawTool.registerMode('StraightArrow', {
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

        var arrowPairs = getArrowBody(points, lineWidth, this.getMap(), 0.15, length);
        var h1 = arrowPairs[0][arrowPairs[0].length - 1],
            h2 = arrowPairs[1][arrowPairs[1].length - 1];
        var arrowHead = this._getArrowHead(h1, h2, points, lineWidth, 0.3, 0.6, 1.4, 2.2, 0.8, 3.3);
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

maptalks.DrawTool.registerMode('DiagonalArrow', {
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
        var pitch = this.getMap().getPitch();
        var t1 = new pointGeometry(last.x, last.y);
        var t2 = new pointGeometry(first.x, first.y);
        var m = new pointGeometry(t1.x + t2.x, t1.y + t2.y).mult(1 / 2);
        var dist = t1.dist(t2);
        var normal = t1.sub(t2)._unit()._perp();
        var max = 0.618;
        var min = 0.1;
        var maxPitch = 80; //map's default max pitch
        var ratio = max - pitch * (max - min) / maxPitch;
        var xc = m.x + dist * ratio * normal.x,
            yc = m.y + dist * ratio * normal.y;
        ctx.lineTo(xc, yc);
        ctx.closePath();
    };

    return DoveTailDiagonalArrow;
}(DiagonalArrow);

DoveTailDiagonalArrow.mergeOptions(options$2);

DoveTailDiagonalArrow.registerJSONType('DoveTailDiagonalArrow');

maptalks.DrawTool.registerMode('DoveTailDiagonalArrow', {
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

var InterpolationGeometry = function (_maptalks$Curve) {
    inherits(InterpolationGeometry, _maptalks$Curve);

    function InterpolationGeometry() {
        classCallCheck(this, InterpolationGeometry);
        return possibleConstructorReturn(this, _maptalks$Curve.apply(this, arguments));
    }

    InterpolationGeometry.prototype.startEdit = function startEdit() {
        var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

        options.newVertexHandleSymbol = {
            opacity: 0
        };
        return _maptalks$Curve.prototype.startEdit.call(this, options);
    };

    InterpolationGeometry.prototype._getPaintParams = function _getPaintParams() {
        var map = this.getMap();
        var zoomScale = map.getGLScale();
        var coordinates = this._generate();
        if (!coordinates) {
            return null;
        }
        var projection = this._getProjection();
        if (!projection) {
            return null;
        }
        this._verifyProjection();
        var prjCoords = this._projectCoords(coordinates);
        var points = this._getPath2DPoints(prjCoords);
        points = points.map(function (p) {
            return p.multi(zoomScale);
        });
        return [points, []];
    };

    InterpolationGeometry.prototype._paintOn = function _paintOn(ctx, points, segs, lineOpacity, fillOpacity) {
        if (points.length <= 0) {
            return;
        }
        ctx.strokeStyle = this.getSymbol()['lineColor'] || '#f00';
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        for (var i = 1; i < points.length; i++) {
            ctx.lineTo(points[i].x, points[i].y);
        }
        ctx.closePath();
        maptalks.Canvas._stroke(ctx, lineOpacity);
        maptalks.Canvas.fillCanvas(ctx, fillOpacity, points[0].x, points[0].y);
    };

    return InterpolationGeometry;
}(maptalks.Curve);

var _options = {
    headHeightFactor: 0.25,
    headWidthFactor: 0.3,
    neckHeightFactor: 0.85,
    neckWidthFactor: 0.15
};

var DoubleArrow = function (_InterprolationGeomet) {
    inherits(DoubleArrow, _InterprolationGeomet);

    function DoubleArrow(coordinates) {
        var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
        classCallCheck(this, DoubleArrow);

        var _this = possibleConstructorReturn(this, _InterprolationGeomet.call(this, coordinates, options));

        _this.type = 'DoubleArrow';
        _this.connetPoints = [];
        _this.symmetricalPoints = [];
        return _this;
    }

    /**
     * 处理插值
     */


    DoubleArrow.prototype._generate = function _generate() {
        var points = [];
        var coordinates = this.getCoordinates();
        var count = coordinates.length;
        var _points = maptalks.Coordinate.toNumberArrays(coordinates);
        if (count < 2) {
            return null;
        } else if (count === 2) {
            this.setCoordinates(coordinates);
            return null;
        } else {
            var _ref = [_points[0], _points[1], _points[2]],
                pnt1 = _ref[0],
                pnt2 = _ref[1],
                pnt3 = _ref[2];

            if (count === 3) {
                this.symmetricalPoints = DoubleArrow.getSymmetricalPoints(pnt1, pnt2, pnt3);
                this.connetPoints = Mid(pnt1, pnt2);
            } else if (count === 4) {
                this.symmetricalPoints = _points[3];
                this.connetPoints = Mid(pnt1, pnt2);
            } else if (count > 4) {
                this._drawTool.disable();
            }
            var leftArrowPoints = undefined,
                rightArrowPoints = undefined;

            if (isClockWise(pnt1, pnt2, pnt3)) {
                leftArrowPoints = DoubleArrow.getArrowPoints(pnt1, this.connetPoints, this.symmetricalPoints, false);
                rightArrowPoints = DoubleArrow.getArrowPoints(this.connetPoints, pnt2, pnt3, true);
            } else {
                leftArrowPoints = DoubleArrow.getArrowPoints(pnt2, this.connetPoints, pnt3, false);
                rightArrowPoints = DoubleArrow.getArrowPoints(this.connetPoints, pnt1, this.symmetricalPoints, true);
            }
            var m = leftArrowPoints.length;
            var t = (m - 5) / 2;
            var llBodyPoints = leftArrowPoints.slice(0, t);
            var lArrowPoints = leftArrowPoints.slice(t, t + 5);
            var lrBodyPoints = leftArrowPoints.slice(t + 5, m);
            var rlBodyPoints = rightArrowPoints.slice(0, t);
            var rArrowPoints = rightArrowPoints.slice(t, t + 5);
            var rrBodyPoints = rightArrowPoints.slice(t + 5, m);
            rlBodyPoints = getBezierPoints(rlBodyPoints);
            var bodyPoints = getBezierPoints(rrBodyPoints.concat(llBodyPoints.slice(1)));
            lrBodyPoints = getBezierPoints(lrBodyPoints);
            points = rlBodyPoints.concat(rArrowPoints, bodyPoints, lArrowPoints, lrBodyPoints);
            points = points.map(function (p) {
                return new maptalks.Coordinate(p);
            });
        }
        return points;
    };

    /**
     * 获取geom类型
     * @returns {string}
     */


    DoubleArrow.prototype.getPlotType = function getPlotType() {
        return this.type;
    };

    DoubleArrow.prototype._exportGeoJSONGeometry = function _exportGeoJSONGeometry() {
        var coordinates = maptalks.Coordinate.toNumberArrays([this.getShell()]);
        return {
            'type': 'Polygon',
            'coordinates': coordinates
        };
    };

    DoubleArrow.prototype._toJSON = function _toJSON(options) {
        var opts = maptalks.Util.extend({}, options);
        var coordinates = this.getCoordinates();
        opts.geometry = false;
        var feature = this.toGeoJSON(opts);
        feature['geometry'] = {
            'type': 'Polygon'
        };
        return {
            'feature': feature,
            'subType': 'DoubleArrow',
            'coordinates': coordinates
        };
    };

    /**
     * 插值箭形上的点
     * @param pnt1
     * @param pnt2
     * @param pnt3
     * @param clockWise
     * @returns {*[]}
     */


    DoubleArrow.getArrowPoints = function getArrowPoints(pnt1, pnt2, pnt3, clockWise) {
        var midPnt = Mid(pnt1, pnt2);
        var len = MathDistance(midPnt, pnt3);
        var midPnt1 = getThirdPoint(pnt3, midPnt, 0, len * 0.3, true);
        var midPnt2 = getThirdPoint(pnt3, midPnt, 0, len * 0.5, true);
        midPnt1 = getThirdPoint(midPnt, midPnt1, HALF_PI, len / 5, clockWise);
        midPnt2 = getThirdPoint(midPnt, midPnt2, HALF_PI, len / 4, clockWise);
        var points = [midPnt, midPnt1, midPnt2, pnt3];
        var arrowPnts = DoubleArrow._getArrowHeadPoints(points);
        if (arrowPnts && Array.isArray(arrowPnts) && arrowPnts.length > 0) {
            var _ref2 = [arrowPnts[0], arrowPnts[4]],
                neckLeftPoint = _ref2[0],
                neckRightPoint = _ref2[1];

            var tailWidthFactor = MathDistance(pnt1, pnt2) / getBaseLength(points) / 2;
            var bodyPnts = DoubleArrow._getArrowBodyPoints(points, neckLeftPoint, neckRightPoint, tailWidthFactor);
            if (bodyPnts) {
                var n = bodyPnts.length;
                var lPoints = bodyPnts.slice(0, n / 2);
                var rPoints = bodyPnts.slice(n / 2, n);
                lPoints.push(neckLeftPoint);
                rPoints.push(neckRightPoint);
                lPoints = lPoints.reverse();
                lPoints.push(pnt2);
                rPoints = rPoints.reverse();
                rPoints.push(pnt1);
                return lPoints.reverse().concat(arrowPnts, rPoints);
            }
        }
        return null;
    };

    /**
     * 插值头部点
     * @param points
     * @returns {*[]}
     */


    DoubleArrow._getArrowHeadPoints = function _getArrowHeadPoints(points) {
        var len = getBaseLength(points);
        var headHeight = len * _options.headHeightFactor;
        var headPnt = points[points.length - 1];
        var headWidth = headHeight * _options.headWidthFactor;
        var neckWidth = headHeight * _options.neckWidthFactor;
        var neckHeight = headHeight * _options.neckHeightFactor;
        var headEndPnt = getThirdPoint(points[points.length - 2], headPnt, 0, headHeight, true);
        var neckEndPnt = getThirdPoint(points[points.length - 2], headPnt, 0, neckHeight, true);
        var headLeft = getThirdPoint(headPnt, headEndPnt, HALF_PI, headWidth, false);
        var headRight = getThirdPoint(headPnt, headEndPnt, HALF_PI, headWidth, true);
        var neckLeft = getThirdPoint(headPnt, neckEndPnt, HALF_PI, neckWidth, false);
        var neckRight = getThirdPoint(headPnt, neckEndPnt, HALF_PI, neckWidth, true);
        return [neckLeft, headLeft, headPnt, headRight, neckRight];
    };

    /**
     * 插值面部分数据
     * @param points
     * @param neckLeft
     * @param neckRight
     * @param tailWidthFactor
     * @returns {*|T[]|string}
     */


    DoubleArrow._getArrowBodyPoints = function _getArrowBodyPoints(points, neckLeft, neckRight, tailWidthFactor) {
        var allLen = wholeDistance(points);
        var len = getBaseLength(points);
        var tailWidth = len * tailWidthFactor;
        var neckWidth = MathDistance(neckLeft, neckRight);
        var widthDif = (tailWidth - neckWidth) / 2;
        var tempLen = 0;
        var leftBodyPnts = [];
        var rightBodyPnts = [];
        for (var i = 1; i < points.length - 1; i++) {
            var angle = getAngleOfThreePoints(points[i - 1], points[i], points[i + 1]) / 2;
            tempLen += MathDistance(points[i - 1], points[i]);
            var w = (tailWidth / 2 - tempLen / allLen * widthDif) / Math.sin(angle);
            var left = getThirdPoint(points[i - 1], points[i], Math.PI - angle, w, true);
            var right = getThirdPoint(points[i - 1], points[i], angle, w, false);
            leftBodyPnts.push(left);
            rightBodyPnts.push(right);
        }
        return leftBodyPnts.concat(rightBodyPnts);
    };

    /**
     * 获取对称点
     * @param linePnt1
     * @param linePnt2
     * @param point
     * @returns {undefined}
     */


    DoubleArrow.getSymmetricalPoints = function getSymmetricalPoints(linePnt1, linePnt2, point) {
        var midPnt = Mid(linePnt1, linePnt2);
        var len = MathDistance(midPnt, point);
        var angle = getAngleOfThreePoints(linePnt1, midPnt, point);
        var symPnt = undefined,
            distance1 = undefined,
            distance2 = undefined,
            mid = undefined;

        if (angle < HALF_PI) {
            distance1 = len * Math.sin(angle);
            distance2 = len * Math.cos(angle);
            mid = getThirdPoint(linePnt1, midPnt, HALF_PI, distance1, false);
            symPnt = getThirdPoint(midPnt, mid, HALF_PI, distance2, true);
        } else if (angle >= HALF_PI && angle < Math.PI) {
            distance1 = len * Math.sin(Math.PI - angle);
            distance2 = len * Math.cos(Math.PI - angle);
            mid = getThirdPoint(linePnt1, midPnt, HALF_PI, distance1, false);
            symPnt = getThirdPoint(midPnt, mid, HALF_PI, distance2, false);
        } else if (angle >= Math.PI && angle < Math.PI * 1.5) {
            distance1 = len * Math.sin(angle - Math.PI);
            distance2 = len * Math.cos(angle - Math.PI);
            mid = getThirdPoint(linePnt1, midPnt, HALF_PI, distance1, true);
            symPnt = getThirdPoint(midPnt, mid, HALF_PI, distance2, true);
        } else {
            distance1 = len * Math.sin(Math.PI * 2 - angle);
            distance2 = len * Math.cos(Math.PI * 2 - angle);
            mid = getThirdPoint(linePnt1, midPnt, HALF_PI, distance1, true);
            symPnt = getThirdPoint(midPnt, mid, HALF_PI, distance2, false);
        }
        return symPnt;
    };

    DoubleArrow.fromJSON = function fromJSON(json) {
        var feature = json['feature'];
        var doubleArrow = new DoubleArrow(json['coordinates'], json['options']);
        doubleArrow.setProperties(feature['properties']);
        return doubleArrow;
    };

    return DoubleArrow;
}(InterpolationGeometry);

DoubleArrow.registerJSONType('DoubleArrow');

maptalks.DrawTool.registerMode('DoubleArrow', {
    action: ['click', 'mousemove', 'dblclick'],
    create: function create(path) {
        return new maptalks.LineString(path);
    },
    update: function update(path, geometry, e) {
        var symbol = geometry.getSymbol();
        geometry.setCoordinates(path);
        var layer = geometry.getLayer();
        if (layer) {
            var doublearrow = layer.getGeometryById('doublearrow');
            if (!doublearrow && path.length >= 3) {
                doublearrow = new DoubleArrow(path, {
                    'id': 'doublearrow'
                });
                doublearrow._drawTool = e.drawTool;
                doublearrow.addTo(layer);
                if (symbol) {
                    doublearrow.setSymbol(symbol);
                }
                geometry.updateSymbol({
                    lineOpacity: 0
                });
            }
            if (doublearrow) {
                doublearrow.setCoordinates(path);
                geometry.updateSymbol({
                    lineOpacity: 0
                });
            }
        }
    },
    generate: function generate(geometry) {
        var symbol = geometry.getSymbol();
        symbol.lineOpacity = 1;
        var coordinates = geometry.getCoordinates();
        if (coordinates.length > 4) {
            coordinates = coordinates.slice(0, 4);
        }
        return new DoubleArrow(coordinates, {
            'symbol': symbol
        });
    }
});

var ClosedCurve = function (_InterprolationGeomet) {
    inherits(ClosedCurve, _InterprolationGeomet);

    function ClosedCurve(coordinates) {
        var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
        classCallCheck(this, ClosedCurve);

        var _this = possibleConstructorReturn(this, _InterprolationGeomet.call(this, coordinates, options));

        _this.type = 'ClosedCurve';
        _this._offset = 0.3;
        if (coordinates) {
            _this.setCoordinates(coordinates);
        }
        return _this;
    }

    /**
     * 获取geom类型
     * @returns {string}
     */


    ClosedCurve.prototype.getPlotType = function getPlotType() {
        return this.type;
    };

    /**
     * 处理插值
     * @returns {*}
     * @private
     */


    ClosedCurve.prototype._generate = function _generate() {
        var coordinates = this.getCoordinates();
        var count = coordinates.length;
        if (count < 2) {
            return null;
        } else if (count === 2) {
            this.setCoordinates(coordinates);
            return null;
        } else {
            var points = maptalks.Coordinate.toNumberArrays(coordinates);
            points.push(points[0], points[1]);
            var normals = [],
                pList = [];

            for (var i = 0; i < points.length - 2; i++) {
                var normalPoints = getBisectorNormals(this._offset, points[i], points[i + 1], points[i + 2]);
                normals = normals.concat(normalPoints);
            }
            var _count = normals.length;
            normals = [normals[_count - 1]].concat(normals.slice(0, _count - 1));
            for (var _i = 0; _i < points.length - 2; _i++) {
                var pnt1 = points[_i];
                var pnt2 = points[_i + 1];
                pList.push(pnt1);
                for (var t = 0; t <= FITTING_COUNT; t++) {
                    var pnt = getCubicValue(t / FITTING_COUNT, pnt1, normals[_i * 2], normals[_i * 2 + 1], pnt2);
                    pList.push(pnt);
                }
                pList.push(pnt2);
            }
            pList = pList.map(function (p) {
                return new maptalks.Coordinate(p);
            });
            return pList;
        }
    };

    ClosedCurve.prototype._exportGeoJSONGeometry = function _exportGeoJSONGeometry() {
        var coordinates = maptalks.Coordinate.toNumberArrays([this.getShell()]);
        return {
            'type': 'Polygon',
            'coordinates': coordinates
        };
    };

    ClosedCurve.prototype._toJSON = function _toJSON(options) {
        var opts = maptalks.Util.extend({}, options);
        var coordinates = this.getCoordinates();
        opts.geometry = false;
        var feature = this.toGeoJSON(opts);
        feature['geometry'] = {
            'type': 'Polygon'
        };
        return {
            'feature': feature,
            'subType': 'ClosedCurve',
            'coordinates': coordinates
        };
    };

    ClosedCurve.fromJSON = function fromJSON(json) {
        var feature = json['feature'];
        var _closedCurve = new ClosedCurve(json['coordinates'], json['options']);
        _closedCurve.setProperties(feature['properties']);
        return _closedCurve;
    };

    return ClosedCurve;
}(InterpolationGeometry);

ClosedCurve.registerJSONType('ClosedCurve');

maptalks.DrawTool.registerMode('ClosedCurve', {
    action: ['click', 'mousemove', 'dblclick'],
    create: function create(path) {
        return new maptalks.LineString(path);
    },
    update: function update(path, geometry) {
        var symbol = geometry.getSymbol();
        geometry.setCoordinates(path);

        var layer = geometry.getLayer();
        if (layer) {
            var doublearrow = layer.getGeometryById('closedcurve');
            if (!doublearrow && path.length >= 3) {
                doublearrow = new ClosedCurve([path], {
                    'id': 'closedcurve'
                });
                doublearrow.addTo(layer);
                if (symbol) {
                    doublearrow.setSymbol(symbol);
                }
                geometry.updateSymbol({
                    lineOpacity: 0
                });
            }
            if (doublearrow) {
                doublearrow.setCoordinates(path);
                geometry.updateSymbol({
                    lineOpacity: 0
                });
            }
        }
    },
    generate: function generate(geometry) {
        var symbol = geometry.getSymbol();
        symbol.lineOpacity = 1;
        return new ClosedCurve(geometry.getCoordinates(), {
            'symbol': symbol
        });
    }
});

var Sector = function (_InterprolationGeomet) {
    inherits(Sector, _InterprolationGeomet);

    function Sector(coordinates) {
        var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
        classCallCheck(this, Sector);

        var _this = possibleConstructorReturn(this, _InterprolationGeomet.call(this, coordinates, options));

        _this.type = 'Sector';
        if (coordinates) {
            _this.setCoordinates(coordinates);
        }
        return _this;
    }

    /**
     * 获取geom类型
     * @returns {string}
     */


    Sector.prototype.getPlotType = function getPlotType() {
        return this.type;
    };

    /**
     * handle coordinates
     * @private
     */


    Sector.prototype._generate = function _generate() {
        var points = [];
        var coordinates = this.getCoordinates();
        var count = coordinates.length;
        var _points = maptalks.Coordinate.toNumberArrays(coordinates);
        if (count <= 2) {
            this.setCoordinates(_points);
            return null;
        } else if (count === 3) {
            var _ref = [_points[0], _points[1], _points[2]],
                center = _ref[0],
                pnt2 = _ref[1],
                pnt3 = _ref[2];

            var measurer = this._getMeasurer();
            var radius = pointDistance(measurer, pnt2, center);
            var startAngle = getAzimuth(pnt2, center);
            var endAngle = getAzimuth(pnt3, center);
            var pList = getSectorPoints(measurer, center, radius, startAngle, endAngle);
            pList.push(center, pList[0]);
            points = pList.map(function (p) {
                return new maptalks.Coordinate(p);
            });
        } else if (count > 3) {
            this._drawTool.endDraw();
        }
        return points;
    };

    Sector.prototype._exportGeoJSONGeometry = function _exportGeoJSONGeometry() {
        var coordinates = maptalks.Coordinate.toNumberArrays([this.getShell()]);
        return {
            'type': 'Polygon',
            'coordinates': coordinates
        };
    };

    Sector.prototype._toJSON = function _toJSON(options) {
        var opts = maptalks.Util.extend({}, options);
        var coordinates = this.getCoordinates();
        opts.geometry = false;
        var feature = this.toGeoJSON(opts);
        feature['geometry'] = {
            'type': 'Polygon'
        };
        return {
            'feature': feature,
            'subType': 'Sector',
            'coordinates': coordinates
        };
    };

    Sector.fromJSON = function fromJSON(json) {
        var feature = json['feature'];
        var _geometry = new Sector(json['coordinates'], json['options']);
        _geometry.setProperties(feature['properties']);
        return _geometry;
    };

    return Sector;
}(InterpolationGeometry);

Sector.registerJSONType('Sector');

maptalks.DrawTool.registerMode('Sector', {
    action: ['click', 'mousemove', 'dblclick'],
    create: function create(path) {
        // return new Sector(path);
        return new maptalks.LineString(path);
    },
    update: function update(path, geometry, e) {
        // geometry.setCoordinates(path);
        var symbol = geometry.getSymbol();
        geometry.setCoordinates(path);

        var layer = geometry.getLayer();
        if (layer) {
            var sector = layer.getGeometryById('sector');
            if (!sector && path.length >= 3) {
                sector = new Sector(path, {
                    'id': 'sector'
                });
                sector._drawTool = e.drawTool;
                sector.addTo(layer);
                var pSymbol = maptalks.Util.extendSymbol(symbol, {});
                if (pSymbol) {
                    sector.setSymbol(pSymbol);
                }
                geometry.updateSymbol({
                    lineOpacity: 0
                });
            }
            if (sector) {
                sector.setCoordinates(path);
                geometry.updateSymbol({
                    lineOpacity: 0
                });
            }
        }
    },
    generate: function generate(geometry) {
        var symbol = geometry.getSymbol();
        symbol.lineOpacity = 1;
        var coordinates = geometry.getCoordinates();
        if (coordinates.length > 3) {
            coordinates = coordinates.slice(0, 3);
        }
        return new Sector(coordinates, {
            'symbol': symbol
        });
    }
});

exports.StraightArrow = StraightArrow;
exports.DiagonalArrow = DiagonalArrow;
exports.DoveTailDiagonalArrow = DoveTailDiagonalArrow;
exports.DoubleArrow = DoubleArrow;
exports.ClosedCurve = ClosedCurve;
exports.Sector = Sector;

Object.defineProperty(exports, '__esModule', { value: true });

typeof console !== 'undefined' && console.log('maptalks.plotsymbol v0.3.0, requires maptalks@>=0.44.0.');

})));
