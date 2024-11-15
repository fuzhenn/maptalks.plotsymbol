import * as __WEBPACK_EXTERNAL_MODULE_maptalks__ from "maptalks";
import * as __WEBPACK_EXTERNAL_MODULE__mapbox_point_geometry__ from "@mapbox/point-geometry";
const FITTING_COUNT = 100;
const HALF_PI = Math.PI / 2;
const ZERO_TOLERANCE = 0.0001;
/**
 * There are many interpolation method
 * based on code finished by @sakitam-fdd https://github.com/sakitam-fdd/maptalks.plot.git
 */ const Coordinate = __WEBPACK_EXTERNAL_MODULE_maptalks__.Coordinate;
const Canvas = __WEBPACK_EXTERNAL_MODULE_maptalks__.Canvas;
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
 */ function getJoinNormal(normal, nextNormal) {
    const joinNormal = normal.add(nextNormal)._unit();
    const cosHalfAngle = joinNormal.x * nextNormal.x + joinNormal.y * nextNormal.y;
    const miterLength = 1 / cosHalfAngle;
    return joinNormal._mult(miterLength);
}
function getPlotPair(vertex, normal, lineWidth) {
    // first plot pair
    const dx = normal.x * lineWidth;
    const dy = normal.y * lineWidth;
    const p1 = vertex.add(dx, dy);
    const p2 = vertex.add(-dx, -dy);
    return [
        p1,
        p2
    ];
}
/**
     * Get arrow body for given vertexes.
     * @param  {maptalks.Coordinate[]} vertexes    - input vertexes
     * @param  {[type]} lineWidth [description]
     * @param  {[type]} map       [description]
     * @param  {[type]} ratio     [description]
     * @return {[type]}           [description]
     */ const getArrowBody = (vertexes, lineWidth, map, ratio, arrowLength)=>{
    lineWidth /= 2;
    let arrowWidth;
    let currentLen = 0;
    const upPlots = [], downPlots = [];
    let pair;
    // let dx, dy;
    let current, prev, next;
    let normal, currentNormal, nextNormal;
    for(let i = 1, l = vertexes.length; i < l; i++){
        current = new __WEBPACK_EXTERNAL_MODULE__mapbox_point_geometry__["default"](vertexes[i].x, vertexes[i].y);
        prev = new __WEBPACK_EXTERNAL_MODULE__mapbox_point_geometry__["default"](vertexes[i - 1].x, vertexes[i - 1].y);
        if (ratio && arrowLength) {
            currentLen += current.dist(prev);
            arrowWidth = (1 - (1 - ratio) * currentLen / arrowLength) * lineWidth;
        } else arrowWidth = lineWidth;
        next = i < l - 1 ? new __WEBPACK_EXTERNAL_MODULE__mapbox_point_geometry__["default"](vertexes[i + 1].x, vertexes[i + 1].y) : null;
        normal = current.sub(prev)._unit()._perp();
        if (1 === i) {
            pair = getPlotPair(vertexes[i - 1], normal, lineWidth, map);
            upPlots.push(pair[0]);
            downPlots.push(pair[1]);
        }
        if (next) {
            nextNormal = next.sub(current)._unit()._perp();
            currentNormal = getJoinNormal(normal, nextNormal);
        } else currentNormal = normal;
        if (!(isNaN(currentNormal.x) || isNaN(currentNormal.y))) {
            pair = getPlotPair(vertexes[i], currentNormal, arrowWidth, map);
            upPlots.push(pair[0]);
            downPlots.push(pair[1]);
        }
    }
    return [
        upPlots,
        downPlots
    ];
};
/**
 * 计算两个坐标之间的距离
 * @param pnt1
 * @param pnt2
 * @returns {number}
 * @constructor
 */ const MathDistance = (pnt1, pnt2)=>Math.sqrt(Math.pow(pnt1[0] - pnt2[0], 2) + Math.pow(pnt1[1] - pnt2[1], 2));
/**
 * 计算距离
 * @param measurer
 * @param pnt1
 * @param pnt2
 * @returns {*}
 */ const pointDistance = (measurer, pnt1, pnt2)=>measurer.measureLength(Coordinate.toCoordinates(pnt1), Coordinate.toCoordinates(pnt2));
/**
 * 插值弓形线段点
 * @param measurer
 * @param center
 * @param radius
 * @param startAngle
 * @param endAngle
 * @param numberOfPoints
 * @returns {null}
 */ const getSectorPoints = function(measurer, center, radius, startAngle, endAngle) {
    let numberOfPoints = arguments.length > 5 && void 0 !== arguments[5] ? arguments[5] : 100;
    let [dx, dy, angleDiff] = [
        null,
        null,
        endAngle - startAngle
    ];
    const points = [];
    angleDiff = angleDiff < 0 ? angleDiff + 2 * Math.PI : angleDiff;
    for(let i = 0; i < numberOfPoints; i++){
        const rad = angleDiff * i / numberOfPoints + startAngle;
        dx = radius * Math.cos(rad);
        dy = radius * Math.sin(rad);
        const vertex = measurer.locate({
            x: center[0],
            y: center[1]
        }, dx, dy);
        points.push([
            vertex['x'],
            vertex['y']
        ]);
    }
    return points;
};
/**
 * 计算点集合的总距离
 * @param points
 * @returns {number}
 */ const wholeDistance = (points)=>{
    let distance = 0;
    if (points && Array.isArray(points) && points.length > 0) points.forEach((item, index)=>{
        if (index < points.length - 1) distance += MathDistance(item, points[index + 1]);
    });
    return distance;
};
/**
 * 获取基础长度
 * @param points
 * @returns {number}
 */ const getBaseLength = (points)=>Math.pow(wholeDistance(points), 0.99);
/**
 * 求取两个坐标的中间值
 * @param point1
 * @param point2
 * @returns {[*,*]}
 * @constructor
 */ const Mid = (point1, point2)=>[
        (point1[0] + point2[0]) / 2,
        (point1[1] + point2[1]) / 2
    ];
/**
 * 获取方位角（地平经度）
 * @param startPoint
 * @param endPoint
 * @returns {*}
 */ const getAzimuth = (startPoint, endPoint)=>{
    let azimuth;
    const angle = Math.asin(Math.abs(endPoint[1] - startPoint[1]) / MathDistance(startPoint, endPoint));
    if (endPoint[1] >= startPoint[1] && endPoint[0] >= startPoint[0]) azimuth = angle + Math.PI;
    else if (endPoint[1] >= startPoint[1] && endPoint[0] < startPoint[0]) azimuth = 2 * Math.PI - angle;
    else if (endPoint[1] < startPoint[1] && endPoint[0] < startPoint[0]) azimuth = angle;
    else if (endPoint[1] < startPoint[1] && endPoint[0] >= startPoint[0]) azimuth = Math.PI - angle;
    return azimuth;
};
/**
 * 通过三个点获取方位角
 * @param pntA
 * @param pntB
 * @param pntC
 * @returns {number}
 */ const getAngleOfThreePoints = (pntA, pntB, pntC)=>{
    const angle = getAzimuth(pntB, pntA) - getAzimuth(pntB, pntC);
    return angle < 0 ? angle + 2 * Math.PI : angle;
};
/**
 * 判断是否是顺时针
 * @param pnt1
 * @param pnt2
 * @param pnt3
 * @returns {boolean}
 */ const isClockWise = (pnt1, pnt2, pnt3)=>(pnt3[1] - pnt1[1]) * (pnt2[0] - pnt1[0]) > (pnt2[1] - pnt1[1]) * (pnt3[0] - pnt1[0]);
/**
 * 获取立方值
 * @param t
 * @param startPnt
 * @param cPnt1
 * @param cPnt2
 * @param endPnt
 * @returns {[*,*]}
 */ const getCubicValue = (t, startPnt, cPnt1, cPnt2, endPnt)=>{
    t = Math.max(Math.min(t, 1), 0);
    const [tp, t2] = [
        1 - t,
        t * t
    ];
    const t3 = t2 * t;
    const tp2 = tp * tp;
    const tp3 = tp2 * tp;
    const x = tp3 * startPnt[0] + 3 * tp2 * t * cPnt1[0] + 3 * tp * t2 * cPnt2[0] + t3 * endPnt[0];
    const y = tp3 * startPnt[1] + 3 * tp2 * t * cPnt1[1] + 3 * tp * t2 * cPnt2[1] + t3 * endPnt[1];
    return [
        x,
        y
    ];
};
/**
 * 根据起止点和旋转方向求取第三个点
 * @param startPnt
 * @param endPnt
 * @param angle
 * @param distance
 * @param clockWise
 * @returns {[*,*]}
 */ const getThirdPoint = (startPnt, endPnt, angle, distance, clockWise)=>{
    const azimuth = getAzimuth(startPnt, endPnt);
    const alpha = clockWise ? azimuth + angle : azimuth - angle;
    const dx = distance * Math.cos(alpha);
    const dy = distance * Math.sin(alpha);
    return [
        endPnt[0] + dx,
        endPnt[1] + dy
    ];
};
/**
 * 获取默认三点的内切圆
 * @param pnt1
 * @param pnt2
 * @param pnt3
 * @returns {[*,*]}
 */ const getNormal = (pnt1, pnt2, pnt3)=>{
    let dX1 = pnt1[0] - pnt2[0];
    let dY1 = pnt1[1] - pnt2[1];
    const d1 = Math.sqrt(dX1 * dX1 + dY1 * dY1);
    dX1 /= d1;
    dY1 /= d1;
    let dX2 = pnt3[0] - pnt2[0];
    let dY2 = pnt3[1] - pnt2[1];
    const d2 = Math.sqrt(dX2 * dX2 + dY2 * dY2);
    dX2 /= d2;
    dY2 /= d2;
    const uX = dX1 + dX2;
    const uY = dY1 + dY2;
    return [
        uX,
        uY
    ];
};
/**
 * getBisectorNormals
 * @param t
 * @param pnt1
 * @param pnt2
 * @param pnt3
 * @returns {[*,*]}
 */ const getBisectorNormals = (t, pnt1, pnt2, pnt3)=>{
    const normal = getNormal(pnt1, pnt2, pnt3);
    let [bisectorNormalRight, bisectorNormalLeft, dt, x, y] = [
        null,
        null,
        null,
        null,
        null
    ];
    const dist = Math.sqrt(normal[0] * normal[0] + normal[1] * normal[1]);
    const uX = normal[0] / dist;
    const uY = normal[1] / dist;
    const d1 = MathDistance(pnt1, pnt2);
    const d2 = MathDistance(pnt2, pnt3);
    if (dist > ZERO_TOLERANCE) {
        if (isClockWise(pnt1, pnt2, pnt3)) {
            dt = t * d1;
            x = pnt2[0] - dt * uY;
            y = pnt2[1] + dt * uX;
            bisectorNormalRight = [
                x,
                y
            ];
            dt = t * d2;
            x = pnt2[0] + dt * uY;
            y = pnt2[1] - dt * uX;
            bisectorNormalLeft = [
                x,
                y
            ];
        } else {
            dt = t * d1;
            x = pnt2[0] + dt * uY;
            y = pnt2[1] - dt * uX;
            bisectorNormalRight = [
                x,
                y
            ];
            dt = t * d2;
            x = pnt2[0] - dt * uY;
            y = pnt2[1] + dt * uX;
            bisectorNormalLeft = [
                x,
                y
            ];
        }
    } else {
        x = pnt2[0] + t * (pnt1[0] - pnt2[0]);
        y = pnt2[1] + t * (pnt1[1] - pnt2[1]);
        bisectorNormalRight = [
            x,
            y
        ];
        x = pnt2[0] + t * (pnt3[0] - pnt2[0]);
        y = pnt2[1] + t * (pnt3[1] - pnt2[1]);
        bisectorNormalLeft = [
            x,
            y
        ];
    }
    return [
        bisectorNormalRight,
        bisectorNormalLeft
    ];
};
/**
 * 获取阶乘数据
 * @param n
 * @returns {number}
 */ const getFactorial = (n)=>{
    let result = 1;
    switch(n){
        case n <= 1:
            result = 1;
            break;
        case 2 === n:
            result = 2;
            break;
        case 3 === n:
            result = 6;
            break;
        case 24 === n:
            result = 24;
            break;
        case 5 === n:
            result = 120;
            break;
        default:
            for(let i = 1; i <= n; i++)result *= i;
            break;
    }
    return result;
};
/**
 * 获取二项分布
 * @param n
 * @param index
 * @returns {number}
 */ const getBinomialFactor = (n, index)=>getFactorial(n) / (getFactorial(index) * getFactorial(n - index));
/**
 * 贝塞尔曲线
 * @param points
 * @returns {*}
 */ const getBezierPoints = function(points) {
    if (points.length <= 2) return points;
    {
        const bezierPoints = [];
        const n = points.length - 1;
        for(let t = 0; t <= 1; t += 0.01){
            let [x, y] = [
                0,
                0
            ];
            for(let index = 0; index <= n; index++){
                const factor = getBinomialFactor(n, index);
                const a = Math.pow(t, index);
                const b = Math.pow(1 - t, n - index);
                x += factor * a * b * points[index][0];
                y += factor * a * b * points[index][1];
            }
            bezierPoints.push([
                x,
                y
            ]);
        }
        bezierPoints.push(points[n]);
        return bezierPoints;
    }
};
/**
     * 判断是否为对象
     * @param value
     * @returns {boolean}
     */ const isObject = (value)=>{
    const type = typeof value;
    return null !== value && ('object' === type || 'function' === type);
};
//和maptalks.Canvas.paintSmoothLine类似，只不过去掉了begainPath的逻辑
const paintSmoothLine = (ctx, points, lineOpacity, smoothValue, draw, close, tailIdx, tailRatio)=>{
    //推算 cubic 贝塞尔曲线片段的起终点和控制点坐标
    //t0: 片段起始比例 0-1
    //t1: 片段结束比例 0-1
    //x1, y1, 曲线起点
    //bx1, by1, bx2, by2，曲线控制点
    //x2, y2  曲线终点
    //结果是曲线片段的起点，2个控制点坐标和终点坐标
    //https://stackoverflow.com/questions/878862/drawing-part-of-a-b%C3%A9zier-curve-by-reusing-a-basic-b%C3%A9zier-curve-function/879213#879213
    function interpolate(t0, t1, x1, y1, bx1, by1, bx2, by2, x2, y2) {
        const u0 = 1.0 - t0;
        const u1 = 1.0 - t1;
        const qxa = x1 * u0 * u0 + 2 * bx1 * t0 * u0 + bx2 * t0 * t0;
        const qxb = x1 * u1 * u1 + 2 * bx1 * t1 * u1 + bx2 * t1 * t1;
        const qxc = bx1 * u0 * u0 + 2 * bx2 * t0 * u0 + x2 * t0 * t0;
        const qxd = bx1 * u1 * u1 + 2 * bx2 * t1 * u1 + x2 * t1 * t1;
        const qya = y1 * u0 * u0 + 2 * by1 * t0 * u0 + by2 * t0 * t0;
        const qyb = y1 * u1 * u1 + 2 * by1 * t1 * u1 + by2 * t1 * t1;
        const qyc = by1 * u0 * u0 + 2 * by2 * t0 * u0 + y2 * t0 * t0;
        const qyd = by1 * u1 * u1 + 2 * by2 * t1 * u1 + y2 * t1 * t1;
        // const xa = qxa * u0 + qxc * t0;
        const xb = qxa * u1 + qxc * t1;
        const xc = qxb * u0 + qxd * t0;
        const xd = qxb * u1 + qxd * t1;
        // const ya = qya * u0 + qyc * t0;
        const yb = qya * u1 + qyc * t1;
        const yc = qyb * u0 + qyd * t0;
        const yd = qyb * u1 + qyd * t1;
        return [
            xb,
            yb,
            xc,
            yc,
            xd,
            yd
        ];
    }
    //from http://www.antigrain.com/research/bezier_interpolation/
    function getCubicControlPoints(x0, y0, x1, y1, x2, y2, x3, y3, smoothValue, t) {
        // Assume we need to calculate the control
        // points between (x1,y1) and (x2,y2).
        // Then x0,y0 - the previous vertex,
        //      x3,y3 - the next one.
        const xc1 = (x0 + x1) / 2.0, yc1 = (y0 + y1) / 2.0;
        const xc2 = (x1 + x2) / 2.0, yc2 = (y1 + y2) / 2.0;
        const xc3 = (x2 + x3) / 2.0, yc3 = (y2 + y3) / 2.0;
        const len1 = Math.sqrt((x1 - x0) * (x1 - x0) + (y1 - y0) * (y1 - y0));
        const len2 = Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));
        const len3 = Math.sqrt((x3 - x2) * (x3 - x2) + (y3 - y2) * (y3 - y2));
        const k1 = len1 / (len1 + len2);
        const k2 = len2 / (len2 + len3);
        const xm1 = xc1 + (xc2 - xc1) * k1, ym1 = yc1 + (yc2 - yc1) * k1;
        const xm2 = xc2 + (xc3 - xc2) * k2, ym2 = yc2 + (yc3 - yc2) * k2;
        // Resulting control points. Here smoothValue is mentioned
        // above coefficient K whose value should be in range [0...1].
        const ctrl1X = xm1 + (xc2 - xm1) * smoothValue + x1 - xm1, ctrl1Y = ym1 + (yc2 - ym1) * smoothValue + y1 - ym1, ctrl2X = xm2 + (xc2 - xm2) * smoothValue + x2 - xm2, ctrl2Y = ym2 + (yc2 - ym2) * smoothValue + y2 - ym2;
        const ctrlPoints = [
            ctrl1X,
            ctrl1Y,
            ctrl2X,
            ctrl2Y
        ];
        if (t < 1) return interpolate(0, t, x1, y1, ctrl1X, ctrl1Y, ctrl2X, ctrl2Y, x2, y2);
        return ctrlPoints;
    }
    function path(ctx, points, lineOpacity, fillOpacity, lineDashArray) {
        if (!__WEBPACK_EXTERNAL_MODULE_maptalks__.Util.isArrayHasData(points)) return;
        Canvas._path(ctx, points, lineDashArray, lineOpacity);
        Canvas._stroke(ctx, lineOpacity);
    }
    if (!points) return null;
    if (points.length <= 2 || !smoothValue) {
        if (draw) path(ctx, points, lineOpacity);
        return null;
    }
    let count = points.length;
    let l = close ? count : count - 1;
    if (void 0 !== tailRatio) l -= Math.max(l - tailIdx - 1, 0);
    let preCtrlPoints;
    for(let i = 0; i < l; i++){
        const x1 = points[i].x, y1 = points[i].y;
        let x0, y0, x2, y2, x3, y3;
        if (i - 1 < 0) {
            if (close) {
                x0 = points[l - 1].x;
                y0 = points[l - 1].y;
            } else {
                x0 = points[i + 1].x;
                y0 = points[i + 1].y;
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
        } else if (close) {
            x3 = points[i + 2 - count].x;
            y3 = points[i + 2 - count].y;
        } else {
            x3 = points[i].x;
            y3 = points[i].y;
        }
        const ctrlPoints = getCubicControlPoints(x0, y0, x1, y1, x2, y2, x3, y3, smoothValue, i === l - 1 ? tailRatio : 1);
        if (i === l - 1 && tailRatio >= 0 && tailRatio < 1) {
            if (ctx) ctx.bezierCurveTo(ctrlPoints[0], ctrlPoints[1], ctrlPoints[2], ctrlPoints[3], ctrlPoints[4], ctrlPoints[5]);
            points.splice(l - 1, count - (l - 1) - 1);
            const lastPoint = new __WEBPACK_EXTERNAL_MODULE__mapbox_point_geometry__["default"](ctrlPoints[4], ctrlPoints[5]);
            lastPoint.prevCtrlPoint = new __WEBPACK_EXTERNAL_MODULE__mapbox_point_geometry__["default"](ctrlPoints[2], ctrlPoints[3]);
            points.push(lastPoint);
            count = points.length;
        } else if (ctx) ctx.bezierCurveTo(ctrlPoints[0], ctrlPoints[1], ctrlPoints[2], ctrlPoints[3], x2, y2);
        points[i].nextCtrlPoint = ctrlPoints.slice(0, 2);
        points[i].prevCtrlPoint = preCtrlPoints ? preCtrlPoints.slice(2) : null;
        preCtrlPoints = ctrlPoints;
    }
    if (!close && points[1].prevCtrlPoint) {
        points[0].nextCtrlPoint = points[1].prevCtrlPoint;
        delete points[0].prevCtrlPoint;
    }
    if (!points[count - 1].prevCtrlPoint) points[count - 1].prevCtrlPoint = points[count - 2].nextCtrlPoint;
    if (draw) Canvas._stroke(ctx, lineOpacity);
    return points;
};
/**
 * @property {Object} options
 */ const StraightArrow_options = {
    widthRatio: 0.10,
    arrowStyle: [],
    tailWidthFactor: 0.1,
    headWidthFactor: 1,
    neckWidthFactor: 0.2,
    headAngle: Math.PI / 8.5,
    neckAngle: Math.PI / 13
};
class StraightArrow extends __WEBPACK_EXTERNAL_MODULE_maptalks__.Curve {
    static fromJSON(json) {
        const feature = json['feature'];
        const arrow = new StraightArrow(feature['geometry']['coordinates'], json['options']);
        arrow.setProperties(feature['properties']);
        return arrow;
    }
    _toJSON(options) {
        return {
            feature: this.toGeoJSON(options),
            subType: 'StraightArrow'
        };
    }
    startEdit() {
        let options = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {};
        options.newVertexHandleSymbol = {
            markerType: 'ellipse',
            markerFill: '#fff',
            markerLineColor: '#000',
            markerLineWidth: 2,
            markerWidth: 10,
            markerHeight: 10,
            opacity: 0
        };
        return super.startEdit(options);
    }
    _getPaintParams() {
        const map = this.getMap();
        const zoomScale = map.getGLScale();
        const points = this._getPath2DPoints(this._getPrjCoordinates());
        if (points.length <= 1) return null;
        const length = this._get2DLength();
        const lineWidth = length * this.options['widthRatio'];
        const arrowPairs = getArrowBody(points, lineWidth, this.getMap());
        const h1 = arrowPairs[0][arrowPairs[0].length - 1], h2 = arrowPairs[1][arrowPairs[1].length - 1];
        const arrowHead = this._getArrowHead(h1, h2, points, lineWidth, 1, 0.8, 1.4, 2.2, 0.7, 2.3);
        let plots = [];
        plots.push.apply(plots, arrowPairs[0]);
        plots.push.apply(plots, arrowHead);
        for(let i = arrowPairs[1].length - 1; i >= 0; i--)plots.push(arrowPairs[1][i]);
        // convert to point in maxZoom
        plots = plots.map((p)=>p.multi(zoomScale));
        return [
            plots,
            [
                arrowPairs[0].length,
                arrowHead.length,
                arrowPairs[1].length
            ]
        ];
    }
    _paintOn(ctx, points, segs, lineOpacity, fillOpacity, lineDasharray) {
        ctx.beginPath();
        let seg;
        //draw body upside
        let i = 0;
        ctx.moveTo(points[0].x, points[0].y);
        seg = points.slice(0, segs[0]);
        // this._quadraticCurve(ctx, seg);
        paintSmoothLine(ctx, seg, lineOpacity, 0.7, true);
        //draw head
        i += segs[0];
        __WEBPACK_EXTERNAL_MODULE_maptalks__.Canvas._path(ctx, points.slice(i, i + segs[1]), lineDasharray, lineOpacity);
        //draw body downside
        i += segs[1];
        seg = points.slice(i, i + segs[2]);
        //this._quadraticCurve(ctx, seg);
        paintSmoothLine(ctx, seg, lineOpacity, 0.7, true);
        this._closeArrow(ctx, points[points.length - 1], points[0]);
        __WEBPACK_EXTERNAL_MODULE_maptalks__.Canvas._stroke(ctx, lineOpacity);
        __WEBPACK_EXTERNAL_MODULE_maptalks__.Canvas.fillCanvas(ctx, fillOpacity, points[0].x, points[0].y);
    }
    _closeArrow(ctx) {
        ctx.closePath();
    }
    /**
     * Get points of arrow head
     * @param  {maptalks.Point} h1   - head point 1
     * @param  {maptalks.Point} h2   - head point 2
     * @param  {maptalks.Point} points   - all points
     * @param  {Number} lineWidth    - line width
     * @return {maptalks.Point[]}
     */ _getArrowHead(h1, h2, points, lineWidth, lineRatio, f1, f2, hScale1, hScale2, h1h2Ratio) {
        const arrowHead = this._getArrowHeadPoint(h1, h2, points[points.length - 1], lineWidth * lineRatio, f1, hScale1);
        const vertex01 = new __WEBPACK_EXTERNAL_MODULE_maptalks__.Point((arrowHead[0].x + arrowHead[1].x) / 2, (arrowHead[0].y + arrowHead[1].y) / 2);
        const head0 = this._getArrowHeadPoint(arrowHead[0], arrowHead[1], vertex01, lineWidth * lineRatio, f2, hScale2)[0];
        const vertex21 = new __WEBPACK_EXTERNAL_MODULE_maptalks__.Point((arrowHead[2].x + arrowHead[1].x) / 2, (arrowHead[2].y + arrowHead[1].y) / 2);
        const head2 = this._getArrowHeadPoint(arrowHead[2], arrowHead[1], vertex21, lineWidth * lineRatio, f2, hScale2)[0];
        let arrowPoints;
        if (2 === points.length) arrowPoints = [
            h1,
            head0,
            arrowHead[1],
            head2,
            h2
        ];
        else {
            const besierPoints = paintSmoothLine(null, points, null, 0.8, false);
            const controlPoint = new __WEBPACK_EXTERNAL_MODULE_maptalks__.Point(besierPoints[besierPoints.length - 1].prevCtrlPoint);
            //计算控制点与最后一个点构成的延长线上的某一点
            const lastPoint = points[points.length - 1];
            const sub = lastPoint.sub(controlPoint);
            if (0 === sub.x && 0 === sub.y) return [
                h1,
                head0,
                arrowHead[1],
                head2,
                h2
            ];
            const h1h2Length = h1.distanceTo(h2);
            const direction = sub.unit();
            const headPoint = new __WEBPACK_EXTERNAL_MODULE_maptalks__.Point(lastPoint.x + direction.x * h1h2Length * h1h2Ratio, lastPoint.y + direction.y * h1h2Length * h1h2Ratio);
            arrowPoints = [
                h1,
                head0,
                headPoint,
                head2,
                h2
            ];
        }
        return arrowPoints;
    }
    _getArrowHeadPoint(h1, h2, vertex, lineWidth, f, hScale) {
        if (!hScale) hScale = 1;
        h1 = new __WEBPACK_EXTERNAL_MODULE__mapbox_point_geometry__["default"](h1.x, h1.y);
        h2 = new __WEBPACK_EXTERNAL_MODULE__mapbox_point_geometry__["default"](h2.x, h2.y);
        const normal = h1.sub(h2)._unit();
        const head0 = vertex.add(lineWidth * normal.x * f, lineWidth * normal.y * f);
        const head2 = vertex.add(lineWidth * -normal.x * f, lineWidth * -normal.y * f);
        normal._perp()._mult(-1);
        const head1 = vertex.add(hScale * lineWidth * normal.x, hScale * lineWidth * normal.y);
        return [
            head0,
            head1,
            head2
        ];
    }
}
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
 */ StraightArrow.mergeOptions(StraightArrow_options);
StraightArrow.registerJSONType('StraightArrow');
__WEBPACK_EXTERNAL_MODULE_maptalks__.DrawTool.registerMode('StraightArrow', {
    action: [
        'click',
        'mousemove',
        'dblclick'
    ],
    create (projection, prjPath) {
        const path = prjPath.map((c)=>projection.unproject(c));
        const line = new StraightArrow(path);
        line._setPrjCoordinates(prjPath);
        return line;
    },
    update (projection, prjPath, geometry) {
        let prjCoords;
        if (Array.isArray(prjPath)) prjCoords = prjPath;
        else {
            prjCoords = geometry._getPrjCoordinates();
            prjCoords.push(prjPath);
        }
        const path = prjCoords.map((c)=>projection.unproject(c));
        geometry.setCoordinates(path);
        geometry._setPrjCoordinates(prjCoords);
    },
    generate (geometry) {
        return geometry;
    }
});
/**
 * @property {Object} options
 */ const DiagonalArrow_options = {
    widthRatio: 0.20,
    arrowStyle: []
};
class DiagonalArrow extends StraightArrow {
    static fromJSON(json) {
        const feature = json['feature'];
        const arrow = new DiagonalArrow(feature['geometry']['coordinates'], json['options']);
        arrow.setProperties(feature['properties']);
        return arrow;
    }
    _toJSON(options) {
        return {
            feature: this.toGeoJSON(options),
            subType: 'DiagonalArrow'
        };
    }
    _getPaintParams() {
        const points = this._getPath2DPoints(this._getPrjCoordinates());
        if (points.length <= 1) return null;
        const zoomScale = this.getMap().getGLScale();
        const length = this._get2DLength();
        const lineWidth = length * this.options['widthRatio'];
        const arrowPairs = getArrowBody(points, lineWidth, this.getMap(), 0.15, length);
        const h1 = arrowPairs[0][arrowPairs[0].length - 1], h2 = arrowPairs[1][arrowPairs[1].length - 1];
        const arrowHead = this._getArrowHead(h1, h2, points, lineWidth, 0.3, 0.6, 1.4, 2.2, 0.8, 3.3);
        let plots = [];
        plots.push.apply(plots, arrowPairs[0]);
        plots.push.apply(plots, arrowHead);
        for(let i = arrowPairs[1].length - 1; i >= 0; i--)plots.push(arrowPairs[1][i]);
        // convert to point in maxZoom
        plots = plots.map((p)=>p.multi(zoomScale));
        return [
            plots,
            [
                arrowPairs[0].length,
                arrowHead.length,
                arrowPairs[1].length
            ]
        ];
    }
}
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
 */ DiagonalArrow.mergeOptions(DiagonalArrow_options);
DiagonalArrow.registerJSONType('DiagonalArrow');
__WEBPACK_EXTERNAL_MODULE_maptalks__.DrawTool.registerMode('DiagonalArrow', {
    action: [
        'click',
        'mousemove',
        'dblclick'
    ],
    create: function(projection, prjPath) {
        const path = prjPath.map((c)=>projection.unproject(c));
        const line = new DiagonalArrow(path);
        line._setPrjCoordinates(prjPath);
        return line;
    },
    update: function(projection, prjPath, geometry) {
        let prjCoords;
        if (Array.isArray(prjPath)) prjCoords = prjPath;
        else {
            prjCoords = geometry._getPrjCoordinates();
            prjCoords.push(prjPath);
        }
        const path = prjCoords.map((c)=>projection.unproject(c));
        geometry.setCoordinates(path);
        geometry._setPrjCoordinates(prjCoords);
    },
    generate: function(geometry) {
        return geometry;
    }
});
/**
 * @property {Object} options
 */ const DoveTailDiagonalArrow_options = {
    widthRatio: 0.20,
    arrowStyle: []
};
class DoveTailDiagonalArrow extends DiagonalArrow {
    static fromJSON(json) {
        const feature = json['feature'];
        const arrow = new DoveTailDiagonalArrow(feature['geometry']['coordinates'], json['options']);
        arrow.setProperties(feature['properties']);
        return arrow;
    }
    _toJSON(options) {
        return {
            feature: this.toGeoJSON(options),
            subType: 'DoveTailDiagonalArrow'
        };
    }
    _closeArrow(ctx, last, first) {
        const pitch = this.getMap().getPitch();
        const t1 = new __WEBPACK_EXTERNAL_MODULE__mapbox_point_geometry__["default"](last.x, last.y);
        const t2 = new __WEBPACK_EXTERNAL_MODULE__mapbox_point_geometry__["default"](first.x, first.y);
        const m = new __WEBPACK_EXTERNAL_MODULE__mapbox_point_geometry__["default"](t1.x + t2.x, t1.y + t2.y).mult(0.5);
        const dist = -t1.dist(t2);
        const normal = t1.sub(t2)._unit()._perp();
        const max = 0.618;
        const min = 0.1;
        const maxPitch = 80; //map's default max pitch
        const ratio = max - pitch * (max - min) / maxPitch;
        const xc = m.x + dist * ratio * normal.x, yc = m.y + dist * ratio * normal.y;
        ctx.lineTo(xc, yc);
        ctx.closePath();
    }
}
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
 */ DoveTailDiagonalArrow.mergeOptions(DoveTailDiagonalArrow_options);
DoveTailDiagonalArrow.registerJSONType('DoveTailDiagonalArrow');
__WEBPACK_EXTERNAL_MODULE_maptalks__.DrawTool.registerMode('DoveTailDiagonalArrow', {
    action: [
        'click',
        'mousemove',
        'dblclick'
    ],
    create: function(projection, prjPath) {
        const path = prjPath.map((c)=>projection.unproject(c));
        const line = new DoveTailDiagonalArrow(path);
        line._setPrjCoordinates(prjPath);
        return line;
    },
    update: function(projection, prjPath, geometry) {
        let prjCoords;
        if (Array.isArray(prjPath)) prjCoords = prjPath;
        else {
            prjCoords = geometry._getPrjCoordinates();
            prjCoords.push(prjPath);
        }
        const path = prjCoords.map((c)=>projection.unproject(c));
        geometry.setCoordinates(path);
        geometry._setPrjCoordinates(prjCoords);
    },
    generate: function(geometry) {
        return geometry;
    }
});
class InterpolationGeometry extends __WEBPACK_EXTERNAL_MODULE_maptalks__.Curve {
    startEdit() {
        let options = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {};
        options.newVertexHandleSymbol = {
            markerType: 'ellipse',
            markerFill: '#fff',
            markerLineColor: '#000',
            markerLineWidth: 2,
            markerWidth: 10,
            markerHeight: 10,
            opacity: 0
        };
        return super.startEdit(options);
    }
    _getPaintParams() {
        const map = this.getMap();
        const zoomScale = map.getGLScale();
        const coordinates = this._generate();
        if (!coordinates) return null;
        const projection = this._getProjection();
        if (!projection) return null;
        this._verifyProjection();
        const prjCoords = this._projectCoords(coordinates);
        let points = this._getPath2DPoints(prjCoords);
        points = points.map((p)=>p.multi(zoomScale));
        return [
            points,
            []
        ];
    }
    _paintOn(ctx, points, segs, lineOpacity, fillOpacity) {
        if (points.length <= 0) return;
        ctx.strokeStyle = this.getSymbol()['lineColor'] || '#f00';
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        for(let i = 1; i < points.length; i++)ctx.lineTo(points[i].x, points[i].y);
        ctx.closePath();
        __WEBPACK_EXTERNAL_MODULE_maptalks__.Canvas._stroke(ctx, lineOpacity);
        __WEBPACK_EXTERNAL_MODULE_maptalks__.Canvas.fillCanvas(ctx, fillOpacity, points[0].x, points[0].y);
    }
}
/* ESM default export */ const src_InterpolationGeometry = InterpolationGeometry;
const _options = {
    headHeightFactor: 0.25,
    headWidthFactor: 0.3,
    neckHeightFactor: 0.85,
    neckWidthFactor: 0.15
};
class DoubleArrow_DoubleArrow extends src_InterpolationGeometry {
    /**
     * 处理插值
     */ _generate() {
        let points = [];
        const coordinates = this.getCoordinates();
        const count = coordinates.length;
        const _points = __WEBPACK_EXTERNAL_MODULE_maptalks__.Coordinate.toNumberArrays(coordinates);
        if (count < 2) return null;
        if (2 === count) {
            this.setCoordinates(coordinates);
            return null;
        }
        {
            const [pnt1, pnt2, pnt3] = [
                _points[0],
                _points[1],
                _points[2]
            ];
            if (3 === count) {
                this.symmetricalPoints = DoubleArrow_DoubleArrow.getSymmetricalPoints(pnt1, pnt2, pnt3);
                this.connetPoints = Mid(pnt1, pnt2);
            } else if (4 === count) {
                this.symmetricalPoints = _points[3];
                this.connetPoints = Mid(pnt1, pnt2);
            } else ;
            let [leftArrowPoints, rightArrowPoints] = [
                void 0,
                void 0
            ];
            if (isClockWise(pnt1, pnt2, pnt3)) {
                leftArrowPoints = DoubleArrow_DoubleArrow.getArrowPoints(pnt1, this.connetPoints, this.symmetricalPoints, false);
                rightArrowPoints = DoubleArrow_DoubleArrow.getArrowPoints(this.connetPoints, pnt2, pnt3, true);
            } else {
                leftArrowPoints = DoubleArrow_DoubleArrow.getArrowPoints(pnt2, this.connetPoints, pnt3, false);
                rightArrowPoints = DoubleArrow_DoubleArrow.getArrowPoints(this.connetPoints, pnt1, this.symmetricalPoints, true);
            }
            const m = leftArrowPoints.length;
            const t = (m - 5) / 2;
            const llBodyPoints = leftArrowPoints.slice(0, t);
            const lArrowPoints = leftArrowPoints.slice(t, t + 5);
            let lrBodyPoints = leftArrowPoints.slice(t + 5, m);
            let rlBodyPoints = rightArrowPoints.slice(0, t);
            const rArrowPoints = rightArrowPoints.slice(t, t + 5);
            const rrBodyPoints = rightArrowPoints.slice(t + 5, m);
            rlBodyPoints = getBezierPoints(rlBodyPoints);
            const bodyPoints = getBezierPoints(rrBodyPoints.concat(llBodyPoints.slice(1)));
            lrBodyPoints = getBezierPoints(lrBodyPoints);
            points = rlBodyPoints.concat(rArrowPoints, bodyPoints, lArrowPoints, lrBodyPoints);
            points = points.map((p)=>new __WEBPACK_EXTERNAL_MODULE_maptalks__.Coordinate(p));
        }
        return points;
    }
    /**
     * 获取geom类型
     * @returns {string}
     */ getPlotType() {
        return this.type;
    }
    _exportGeoJSONGeometry() {
        const coordinates = __WEBPACK_EXTERNAL_MODULE_maptalks__.Coordinate.toNumberArrays([
            this.getShell()
        ]);
        return {
            type: 'Polygon',
            coordinates: coordinates
        };
    }
    _toJSON(options) {
        const opts = __WEBPACK_EXTERNAL_MODULE_maptalks__.Util.extend({}, options);
        const coordinates = this.getCoordinates();
        opts.geometry = false;
        const feature = this.toGeoJSON(opts);
        feature['geometry'] = {
            type: 'Polygon'
        };
        return {
            feature: feature,
            subType: 'DoubleArrow',
            coordinates: coordinates
        };
    }
    /**
     * 插值箭形上的点
     * @param pnt1
     * @param pnt2
     * @param pnt3
     * @param clockWise
     * @returns {*[]}
     */ static getArrowPoints(pnt1, pnt2, pnt3, clockWise) {
        const midPnt = Mid(pnt1, pnt2);
        const len = MathDistance(midPnt, pnt3);
        let midPnt1 = getThirdPoint(pnt3, midPnt, 0, 0.3 * len, true);
        let midPnt2 = getThirdPoint(pnt3, midPnt, 0, 0.5 * len, true);
        midPnt1 = getThirdPoint(midPnt, midPnt1, HALF_PI, len / 5, clockWise);
        midPnt2 = getThirdPoint(midPnt, midPnt2, HALF_PI, len / 4, clockWise);
        const points = [
            midPnt,
            midPnt1,
            midPnt2,
            pnt3
        ];
        const arrowPnts = DoubleArrow_DoubleArrow._getArrowHeadPoints(points);
        if (arrowPnts && Array.isArray(arrowPnts) && arrowPnts.length > 0) {
            const [neckLeftPoint, neckRightPoint] = [
                arrowPnts[0],
                arrowPnts[4]
            ];
            const tailWidthFactor = MathDistance(pnt1, pnt2) / getBaseLength(points) / 2;
            const bodyPnts = DoubleArrow_DoubleArrow._getArrowBodyPoints(points, neckLeftPoint, neckRightPoint, tailWidthFactor);
            if (bodyPnts) {
                const n = bodyPnts.length;
                let lPoints = bodyPnts.slice(0, n / 2);
                let rPoints = bodyPnts.slice(n / 2, n);
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
    }
    /**
     * 插值头部点
     * @param points
     * @returns {*[]}
     */ static _getArrowHeadPoints(points) {
        const len = getBaseLength(points);
        const headHeight = len * _options.headHeightFactor;
        const headPnt = points[points.length - 1];
        const headWidth = headHeight * _options.headWidthFactor;
        const neckWidth = headHeight * _options.neckWidthFactor;
        const neckHeight = headHeight * _options.neckHeightFactor;
        const headEndPnt = getThirdPoint(points[points.length - 2], headPnt, 0, headHeight, true);
        const neckEndPnt = getThirdPoint(points[points.length - 2], headPnt, 0, neckHeight, true);
        const headLeft = getThirdPoint(headPnt, headEndPnt, HALF_PI, headWidth, false);
        const headRight = getThirdPoint(headPnt, headEndPnt, HALF_PI, headWidth, true);
        const neckLeft = getThirdPoint(headPnt, neckEndPnt, HALF_PI, neckWidth, false);
        const neckRight = getThirdPoint(headPnt, neckEndPnt, HALF_PI, neckWidth, true);
        return [
            neckLeft,
            headLeft,
            headPnt,
            headRight,
            neckRight
        ];
    }
    /**
     * 插值面部分数据
     * @param points
     * @param neckLeft
     * @param neckRight
     * @param tailWidthFactor
     * @returns {*|T[]|string}
     */ static _getArrowBodyPoints(points, neckLeft, neckRight, tailWidthFactor) {
        const allLen = wholeDistance(points);
        const len = getBaseLength(points);
        const tailWidth = len * tailWidthFactor;
        const neckWidth = MathDistance(neckLeft, neckRight);
        const widthDif = (tailWidth - neckWidth) / 2;
        let tempLen = 0;
        const leftBodyPnts = [];
        const rightBodyPnts = [];
        for(let i = 1; i < points.length - 1; i++){
            const angle = getAngleOfThreePoints(points[i - 1], points[i], points[i + 1]) / 2;
            tempLen += MathDistance(points[i - 1], points[i]);
            const w = (tailWidth / 2 - tempLen / allLen * widthDif) / Math.sin(angle);
            const left = getThirdPoint(points[i - 1], points[i], Math.PI - angle, w, true);
            const right = getThirdPoint(points[i - 1], points[i], angle, w, false);
            leftBodyPnts.push(left);
            rightBodyPnts.push(right);
        }
        return leftBodyPnts.concat(rightBodyPnts);
    }
    /**
     * 获取对称点
     * @param linePnt1
     * @param linePnt2
     * @param point
     * @returns {undefined}
     */ static getSymmetricalPoints(linePnt1, linePnt2, point) {
        const midPnt = Mid(linePnt1, linePnt2);
        const len = MathDistance(midPnt, point);
        const angle = getAngleOfThreePoints(linePnt1, midPnt, point);
        let [symPnt, distance1, distance2, mid] = [
            void 0,
            void 0,
            void 0,
            void 0
        ];
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
        } else if (angle >= Math.PI && angle < 1.5 * Math.PI) {
            distance1 = len * Math.sin(angle - Math.PI);
            distance2 = len * Math.cos(angle - Math.PI);
            mid = getThirdPoint(linePnt1, midPnt, HALF_PI, distance1, true);
            symPnt = getThirdPoint(midPnt, mid, HALF_PI, distance2, true);
        } else {
            distance1 = len * Math.sin(2 * Math.PI - angle);
            distance2 = len * Math.cos(2 * Math.PI - angle);
            mid = getThirdPoint(linePnt1, midPnt, HALF_PI, distance1, true);
            symPnt = getThirdPoint(midPnt, mid, HALF_PI, distance2, false);
        }
        return symPnt;
    }
    static fromJSON(json) {
        const feature = json['feature'];
        const doubleArrow = new DoubleArrow_DoubleArrow(json['coordinates'], json['options']);
        doubleArrow.setProperties(feature['properties']);
        return doubleArrow;
    }
    constructor(coordinates, options = {}){
        super(coordinates, options);
        this.type = 'DoubleArrow';
        this.connetPoints = [];
        this.symmetricalPoints = [];
    }
}
DoubleArrow_DoubleArrow.registerJSONType('DoubleArrow');
__WEBPACK_EXTERNAL_MODULE_maptalks__.DrawTool.registerMode('DoubleArrow', {
    action: [
        'click',
        'mousemove',
        'dblclick'
    ],
    create (projection, prjPath) {
        const path = prjPath.map((c)=>projection.unproject(c));
        const line = new __WEBPACK_EXTERNAL_MODULE_maptalks__.LineString(path);
        line._setPrjCoordinates(prjPath);
        return line;
    },
    update (projection, path, geometry, e) {
        const symbol = geometry.getSymbol();
        let prjCoords;
        if (Array.isArray(path)) prjCoords = path;
        else {
            prjCoords = geometry._getPrjCoordinates();
            prjCoords.push(path);
        }
        const coordinates = prjCoords.map((c)=>projection.unproject(c));
        geometry.setCoordinates(coordinates);
        geometry._setPrjCoordinates(prjCoords);
        const layer = geometry.getLayer();
        if (layer) {
            const map = layer.getMap();
            let doublearrow = layer.getGeometryById('doublearrow');
            if (!doublearrow && path.length >= 3) {
                doublearrow = new DoubleArrow_DoubleArrow(path, {
                    id: 'doublearrow'
                });
                doublearrow._drawTool = e.drawTool || map['_map_tool'];
                doublearrow.addTo(layer);
                if (symbol) doublearrow.setSymbol(symbol);
                geometry.updateSymbol({
                    lineOpacity: 0
                });
            }
            if (doublearrow) {
                doublearrow.setCoordinates(coordinates);
                doublearrow._setPrjCoordinates(path);
                geometry.updateSymbol({
                    lineOpacity: 0
                });
            }
        }
    },
    generate (geometry) {
        const symbol = geometry.getSymbol();
        symbol.lineOpacity = 1;
        let coordinates = geometry.getCoordinates();
        if (coordinates.length > 4) coordinates = coordinates.slice(0, 4);
        return new DoubleArrow_DoubleArrow(coordinates, {
            symbol: symbol
        });
    }
});
/* ESM default export */ const DoubleArrow = DoubleArrow_DoubleArrow;
class ClosedCurve_ClosedCurve extends src_InterpolationGeometry {
    /**
     * 获取geom类型
     * @returns {string}
     */ getPlotType() {
        return this.type;
    }
    /**
     * 处理插值
     * @returns {*}
     * @private
     */ _generate() {
        const coordinates = this.getCoordinates();
        const count = coordinates.length;
        if (count < 2) return null;
        if (2 === count) {
            this.setCoordinates(coordinates);
            return null;
        }
        {
            const points = __WEBPACK_EXTERNAL_MODULE_maptalks__.Coordinate.toNumberArrays(coordinates);
            points.push(points[0], points[1]);
            let [normals, pList] = [
                [],
                []
            ];
            for(let i = 0; i < points.length - 2; i++){
                const normalPoints = getBisectorNormals(this._offset, points[i], points[i + 1], points[i + 2]);
                normals = normals.concat(normalPoints);
            }
            const count = normals.length;
            normals = [
                normals[count - 1]
            ].concat(normals.slice(0, count - 1));
            for(let i = 0; i < points.length - 2; i++){
                const pnt1 = points[i];
                const pnt2 = points[i + 1];
                pList.push(pnt1);
                for(let t = 0; t <= FITTING_COUNT; t++){
                    const pnt = getCubicValue(t / FITTING_COUNT, pnt1, normals[2 * i], normals[2 * i + 1], pnt2);
                    pList.push(pnt);
                }
                pList.push(pnt2);
            }
            pList = pList.map((p)=>new __WEBPACK_EXTERNAL_MODULE_maptalks__.Coordinate(p));
            return pList;
        }
    }
    _exportGeoJSONGeometry() {
        const coordinates = __WEBPACK_EXTERNAL_MODULE_maptalks__.Coordinate.toNumberArrays([
            this.getShell()
        ]);
        return {
            type: 'Polygon',
            coordinates: coordinates
        };
    }
    _toJSON(options) {
        const opts = __WEBPACK_EXTERNAL_MODULE_maptalks__.Util.extend({}, options);
        const coordinates = this.getCoordinates();
        opts.geometry = false;
        const feature = this.toGeoJSON(opts);
        feature['geometry'] = {
            type: 'Polygon'
        };
        return {
            feature: feature,
            subType: 'ClosedCurve',
            coordinates: coordinates
        };
    }
    static fromJSON(json) {
        const feature = json['feature'];
        const _closedCurve = new ClosedCurve_ClosedCurve(json['coordinates'], json['options']);
        _closedCurve.setProperties(feature['properties']);
        return _closedCurve;
    }
    constructor(coordinates, options = {}){
        super(coordinates, options);
        this.type = 'ClosedCurve';
        this._offset = 0.3;
        if (coordinates) this.setCoordinates(coordinates);
    }
}
ClosedCurve_ClosedCurve.registerJSONType('ClosedCurve');
__WEBPACK_EXTERNAL_MODULE_maptalks__.DrawTool.registerMode('ClosedCurve', {
    action: [
        'click',
        'mousemove',
        'dblclick'
    ],
    create (projection, prjPath) {
        const path = prjPath.map((c)=>projection.unproject(c));
        const line = new __WEBPACK_EXTERNAL_MODULE_maptalks__.LineString(path);
        line._setPrjCoordinates(prjPath);
        return line;
    },
    update (projection, path, geometry) {
        const symbol = geometry.getSymbol();
        let prjCoords;
        if (Array.isArray(path)) prjCoords = path;
        else {
            prjCoords = geometry._getPrjCoordinates();
            prjCoords.push(path);
        }
        const coordinates = prjCoords.map((c)=>projection.unproject(c));
        geometry.setCoordinates(coordinates);
        geometry._setPrjCoordinates(prjCoords);
        const layer = geometry.getLayer();
        if (layer) {
            let doublearrow = layer.getGeometryById('closedcurve');
            if (!doublearrow && path.length >= 3) {
                doublearrow = new ClosedCurve_ClosedCurve([
                    path
                ], {
                    id: 'closedcurve'
                });
                doublearrow.addTo(layer);
                if (symbol) doublearrow.setSymbol(symbol);
                geometry.updateSymbol({
                    lineOpacity: 0
                });
            }
            if (doublearrow) {
                doublearrow.setCoordinates(coordinates);
                doublearrow._setPrjCoordinates(path);
                geometry.updateSymbol({
                    lineOpacity: 0
                });
            }
        }
    },
    generate (geometry) {
        const symbol = geometry.getSymbol();
        symbol.lineOpacity = 1;
        return new ClosedCurve_ClosedCurve(geometry.getCoordinates(), {
            symbol: symbol
        });
    }
});
/* ESM default export */ const ClosedCurve = ClosedCurve_ClosedCurve;
class Sector_Sector extends src_InterpolationGeometry {
    /**
     * 获取geom类型
     * @returns {string}
     */ getPlotType() {
        return this.type;
    }
    /**
     * handle coordinates
     * @private
     */ _generate() {
        let points = [];
        const coordinates = this.getCoordinates();
        const count = coordinates.length;
        const _points = __WEBPACK_EXTERNAL_MODULE_maptalks__.Coordinate.toNumberArrays(coordinates);
        if (count <= 2) {
            this.setCoordinates(_points);
            return null;
        }
        if (3 === count) {
            const [center, pnt2, pnt3] = [
                _points[0],
                _points[1],
                _points[2]
            ];
            const measurer = this._getMeasurer();
            const radius = pointDistance(measurer, pnt2, center);
            const startAngle = getAzimuth(pnt2, center);
            const endAngle = getAzimuth(pnt3, center);
            const pList = getSectorPoints(measurer, center, radius, startAngle, endAngle);
            pList.push(center, pList[0]);
            points = pList.map((p)=>new __WEBPACK_EXTERNAL_MODULE_maptalks__.Coordinate(p));
        } else ;
        return points;
    }
    _exportGeoJSONGeometry() {
        const coordinates = __WEBPACK_EXTERNAL_MODULE_maptalks__.Coordinate.toNumberArrays([
            this.getShell()
        ]);
        return {
            type: 'Polygon',
            coordinates: coordinates
        };
    }
    _toJSON(options) {
        const opts = __WEBPACK_EXTERNAL_MODULE_maptalks__.Util.extend({}, options);
        const coordinates = this.getCoordinates();
        opts.geometry = false;
        const feature = this.toGeoJSON(opts);
        feature['geometry'] = {
            type: 'Polygon'
        };
        return {
            feature: feature,
            subType: 'PlotSector',
            coordinates: coordinates
        };
    }
    static fromJSON(json) {
        const feature = json['feature'];
        const _geometry = new Sector_Sector(json['coordinates'], json['options']);
        _geometry.setProperties(feature['properties']);
        return _geometry;
    }
    constructor(coordinates, options = {}){
        super(coordinates, options);
        this.type = 'PlotSector';
        if (coordinates) this.setCoordinates(coordinates);
    }
}
Sector_Sector.registerJSONType('PlotSector');
__WEBPACK_EXTERNAL_MODULE_maptalks__.DrawTool.registerMode('PlotSector', {
    action: [
        'click',
        'mousemove',
        'dblclick'
    ],
    create (projection, prjPath) {
        const path = prjPath.map((c)=>projection.unproject(c));
        const line = new __WEBPACK_EXTERNAL_MODULE_maptalks__.LineString(path);
        line._setPrjCoordinates(prjPath);
        return line;
    },
    update (projection, path, geometry, e) {
        const symbol = geometry.getSymbol();
        let prjCoords;
        if (Array.isArray(path)) prjCoords = path;
        else {
            prjCoords = geometry._getPrjCoordinates();
            prjCoords.push(path);
        }
        const coordinates = prjCoords.map((c)=>projection.unproject(c));
        geometry.setCoordinates(coordinates);
        geometry._setPrjCoordinates(prjCoords);
        const layer = geometry.getLayer();
        if (layer) {
            const map = layer.getMap();
            let sector = layer.getGeometryById('sector');
            if (!sector && path.length >= 3) {
                sector = new Sector_Sector(path, {
                    id: 'sector'
                });
                sector._drawTool = e.drawTool || map['_map_tool'];
                sector.addTo(layer);
                const pSymbol = __WEBPACK_EXTERNAL_MODULE_maptalks__.Util.extendSymbol(symbol, {});
                if (pSymbol) sector.setSymbol(pSymbol);
                geometry.updateSymbol({
                    lineOpacity: 0
                });
            }
            if (sector) {
                sector.setCoordinates(coordinates);
                sector._setPrjCoordinates(prjCoords);
                geometry.updateSymbol({
                    lineOpacity: 0
                });
            }
        }
    },
    generate (geometry) {
        const symbol = geometry.getSymbol();
        symbol.lineOpacity = 1;
        let coordinates = geometry.getCoordinates();
        if (coordinates.length > 3) coordinates = coordinates.slice(0, 3);
        return new Sector_Sector(coordinates, {
            symbol: symbol
        });
    }
});
/* ESM default export */ const Sector = Sector_Sector;
class GatheringPlace_GatheringPlace extends src_InterpolationGeometry {
    getPlotType() {
        return this.type;
    }
    _generate() {
        const coordinates = this.getCoordinates();
        let count = coordinates.length;
        let _points = __WEBPACK_EXTERNAL_MODULE_maptalks__.Coordinate.toNumberArrays(coordinates);
        if (count < 2) return;
        if (2 === count) {
            let mid = Mid(_points[0], _points[1]);
            const distance = MathDistance(_points[0], mid) / 0.9;
            let pnt = getThirdPoint(_points[0], mid, HALF_PI, distance, true);
            _points = [
                _points[0],
                pnt,
                _points[1]
            ];
        }
        let mid = Mid(_points[0], _points[2]);
        _points.push(mid, _points[0], _points[1]);
        let [normals, pnt1, pnt2, pnt3, pList] = [
            [],
            void 0,
            void 0,
            void 0,
            []
        ];
        for(let i = 0; i < _points.length - 2; i++){
            pnt1 = _points[i];
            pnt2 = _points[i + 1];
            pnt3 = _points[i + 2];
            let normalPoints = getBisectorNormals(this._offset, pnt1, pnt2, pnt3);
            normals = normals.concat(normalPoints);
        }
        count = normals.length;
        normals = [
            normals[count - 1]
        ].concat(normals.slice(0, count - 1));
        for(let i = 0; i < _points.length - 2; i++){
            pnt1 = _points[i];
            pnt2 = _points[i + 1];
            pList.push(pnt1);
            for(let t = 0; t <= FITTING_COUNT; t++){
                let pnt = getCubicValue(t / FITTING_COUNT, pnt1, normals[2 * i], normals[2 * i + 1], pnt2);
                pList.push(pnt);
            }
            pList.push(pnt2);
        }
        pList = pList.map((p)=>new __WEBPACK_EXTERNAL_MODULE_maptalks__.Coordinate(p));
        return pList;
    }
    _exportGeoJSONGeometry() {
        const coordinates = __WEBPACK_EXTERNAL_MODULE_maptalks__.Coordinate.toNumberArrays([
            this.getShell()
        ]);
        return {
            type: 'Polygon',
            coordinates: coordinates
        };
    }
    _toJSON(options) {
        const opts = __WEBPACK_EXTERNAL_MODULE_maptalks__.Util.extend({}, options);
        const coordinates = this.getCoordinates();
        opts.geometry = false;
        const feature = this.toGeoJSON(opts);
        feature['geometry'] = {
            type: 'Polygon'
        };
        return {
            feature: feature,
            subType: 'GatheringPlace',
            coordinates: coordinates
        };
    }
    static fromJSON(json) {
        const feature = json['feature'];
        const _atheringPlace = new GatheringPlace_GatheringPlace(json['coordinates'], json['options']);
        _atheringPlace.setProperties(feature['properties']);
        return _atheringPlace;
    }
    constructor(coordinates, options = {}){
        super(coordinates, options);
        this.type = 'GatheringPlace';
        this._offset = 0.4;
        if (coordinates) this.setCoordinates(coordinates);
    }
}
GatheringPlace_GatheringPlace.registerJSONType('GatheringPlace');
__WEBPACK_EXTERNAL_MODULE_maptalks__.DrawTool.registerMode('GatheringPlace', {
    action: [
        'click',
        'mousemove',
        'dblclick'
    ],
    create (projection, prjPath) {
        const path = prjPath.map((c)=>projection.unproject(c));
        const line = new GatheringPlace_GatheringPlace(path);
        line._setPrjCoordinates(prjPath);
        return line;
    },
    update (projection, path, geometry) {
        const symbol = geometry.getSymbol();
        let prjCoords;
        if (Array.isArray(path)) prjCoords = path;
        else {
            prjCoords = geometry._getPrjCoordinates();
            prjCoords.push(path);
        }
        const coordinates = prjCoords.map((c)=>projection.unproject(c));
        geometry.setCoordinates(coordinates);
        geometry._setPrjCoordinates(prjCoords);
        const layer = geometry.getLayer();
        if (layer) {
            let doublearrow = layer.getGeometryById('gatheringplace');
            if (!doublearrow && path.length >= 3) {
                doublearrow = new GatheringPlace_GatheringPlace([
                    path
                ], {
                    id: 'gatheringplace'
                });
                doublearrow.addTo(layer);
                if (symbol) doublearrow.setSymbol(symbol);
                geometry.updateSymbol({
                    lineOpacity: 0
                });
            }
            if (doublearrow) {
                doublearrow.setCoordinates(coordinates);
                doublearrow._setPrjCoordinates(path);
                geometry.updateSymbol({
                    lineOpacity: 0
                });
            }
        }
    },
    generate (geometry) {
        const symbol = geometry.getSymbol();
        symbol.lineOpacity = 1;
        return new GatheringPlace_GatheringPlace(geometry.getCoordinates(), {
            symbol: symbol
        });
    }
});
/* ESM default export */ const GatheringPlace = GatheringPlace_GatheringPlace;
export { ClosedCurve, DiagonalArrow, DoubleArrow, DoveTailDiagonalArrow, GatheringPlace, Sector, StraightArrow };
