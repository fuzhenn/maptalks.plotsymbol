
/**
 * There are many interpolation method
 * based on code finished by @sakitam-fdd https://github.com/sakitam-fdd/maptalks.plot.git
 */
import * as Constants from './Constants';
import * as maptalks from 'maptalks';
import Point from '@mapbox/point-geometry';
const Coordinate = maptalks.Coordinate;
const Canvas = maptalks.Canvas;

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
export const getArrowBody = (vertexes, lineWidth, map, ratio, arrowLength) => {
    lineWidth /= 2;
    let arrowWidth;
    let currentLen = 0;
    const upPlots = [],
        downPlots = [];
    let pair;
    // let dx, dy;
    let current, prev, next;
    let normal, currentNormal, nextNormal;
    for (let i = 1, l = vertexes.length; i < l; i++) {
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
export const MathDistance = (pnt1, pnt2) => {
    return (Math.sqrt(Math.pow((pnt1[0] - pnt2[0]), 2) + Math.pow((pnt1[1] - pnt2[1]), 2)));
};

/**
 * 计算距离
 * @param measurer
 * @param pnt1
 * @param pnt2
 * @returns {*}
 */
export const pointDistance = (measurer, pnt1, pnt2) => {
    return measurer.measureLength(Coordinate.toCoordinates(pnt1), Coordinate.toCoordinates(pnt2));
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
export const getSectorPoints = (measurer, center, radius, startAngle, endAngle, numberOfPoints = 100) => {
    let [dx, dy, angleDiff] = [null, null, endAngle - startAngle];
    const points = [];
    angleDiff = ((angleDiff < 0) ? (angleDiff + (Math.PI * 2)) : angleDiff);
    for (let i = 0; i < numberOfPoints; i++) {
        const rad = angleDiff * i / numberOfPoints + startAngle;
        dx = radius * Math.cos(rad);
        dy = radius * Math.sin(rad);
        const vertex = measurer.locate({
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
export const wholeDistance = (points) => {
    let distance = 0;
    if (points && Array.isArray(points) && points.length > 0) {
        points.forEach((item, index) => {
            if (index < points.length - 1) {
                distance += (MathDistance(item, points[index + 1]));
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
export const getBaseLength = (points) => {
    return Math.pow(wholeDistance(points), 0.99);
};

/**
 * 求取两个坐标的中间值
 * @param point1
 * @param point2
 * @returns {[*,*]}
 * @constructor
 */
export const Mid = (point1, point2) => {
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
export const getIntersectPoint = (pntA, pntB, pntC, pntD) => {
    if (pntA[1] === pntB[1]) {
        const f = (pntD[0] - pntC[0]) / (pntD[1] - pntC[1]);
        const x = f * (pntA[1] - pntC[1]) + pntC[0];
        const y = pntA[1];
        return [x, y];
    }
    if (pntC[1] === pntD[1]) {
        const e = (pntB[0] - pntA[0]) / (pntB[1] - pntA[1]);
        const x = e * (pntC[1] - pntA[1]) + pntA[0];
        const y = pntC[1];
        return [x, y];
    }
    const e = (pntB[0] - pntA[0]) / (pntB[1] - pntA[1]);
    const f = (pntD[0] - pntC[0]) / (pntD[1] - pntC[1]);
    const y = (e * pntA[1] - pntA[0] - f * pntC[1] + pntC[0]) / (e - f);
    const x = e * y - e * pntA[1] + pntA[0];
    return [x, y];
};

/**
 * 通过三个点确定一个圆的中心点
 * @param point1
 * @param point2
 * @param point3
 */
export const getCircleCenterOfThreePoints = (point1, point2, point3) => {
    const pntA = [(point1[0] + point2[0]) / 2, (point1[1] + point2[1]) / 2];
    const pntB = [pntA[0] - point1[1] + point2[1], pntA[1] + point1[0] - point2[0]];
    const pntC = [(point1[0] + point3[0]) / 2, (point1[1] + point3[1]) / 2];
    const pntD = [pntC[0] - point1[1] + point3[1], pntC[1] + point1[0] - point3[0]];
    return getIntersectPoint(pntA, pntB, pntC, pntD);
};

/**
 * 获取方位角（地平经度）
 * @param startPoint
 * @param endPoint
 * @returns {*}
 */
export const getAzimuth = (startPoint, endPoint) => {
    let azimuth;
    const angle = Math.asin(Math.abs(endPoint[1] - startPoint[1]) / (MathDistance(startPoint, endPoint)));
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
export const getAngleOfThreePoints = (pntA, pntB, pntC) => {
    const angle = getAzimuth(pntB, pntA) - getAzimuth(pntB, pntC);
    return ((angle < 0) ? (angle + Math.PI * 2) : angle);
};

/**
 * 判断是否是顺时针
 * @param pnt1
 * @param pnt2
 * @param pnt3
 * @returns {boolean}
 */
export const isClockWise = (pnt1, pnt2, pnt3) => {
    return ((pnt3[1] - pnt1[1]) * (pnt2[0] - pnt1[0]) > (pnt2[1] - pnt1[1]) * (pnt3[0] - pnt1[0]));
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
export const getCubicValue = (t, startPnt, cPnt1, cPnt2, endPnt) => {
    t = Math.max(Math.min(t, 1), 0);
    const [tp, t2] = [(1 - t), (t * t)];
    const t3 = t2 * t;
    const tp2 = tp * tp;
    const tp3 = tp2 * tp;
    const x = (tp3 * startPnt[0]) + (3 * tp2 * t * cPnt1[0]) + (3 * tp * t2 * cPnt2[0]) + (t3 * endPnt[0]);
    const y = (tp3 * startPnt[1]) + (3 * tp2 * t * cPnt1[1]) + (3 * tp * t2 * cPnt2[1]) + (t3 * endPnt[1]);
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
export const getThirdPoint = (startPnt, endPnt, angle, distance, clockWise) => {
    const azimuth = getAzimuth(startPnt, endPnt);
    const alpha = clockWise ? (azimuth + angle) : (azimuth - angle);
    const dx = distance * Math.cos(alpha);
    const dy = distance * Math.sin(alpha);
    return ([endPnt[0] + dx, endPnt[1] + dy]);
};

/**
 * 插值弓形线段点
 * @param center
 * @param radius
 * @param startAngle
 * @param endAngle
 * @returns {null}
 */
export const getArcPoints = (center, radius, startAngle, endAngle) => {
    let [x, y, angleDiff] = [null, null, endAngle - startAngle];
    const points = [];
    angleDiff = ((angleDiff < 0) ? (angleDiff + (Math.PI * 2)) : angleDiff);
    for (let i = 0; i < 200; i++) {
        const angle = startAngle + angleDiff * i / 200;
        x = center[0] + radius * Math.cos(angle);
        y = center[1] + radius * Math.sin(angle);
        points.push([x, y]);
    }
    return points;
};

/**
 * 获取默认三点的内切圆
 * @param pnt1
 * @param pnt2
 * @param pnt3
 * @returns {[*,*]}
 */
export const getNormal = (pnt1, pnt2, pnt3) => {
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
export const getBisectorNormals = (t, pnt1, pnt2, pnt3) => {
    const normal = getNormal(pnt1, pnt2, pnt3);
    let [bisectorNormalRight, bisectorNormalLeft, dt, x, y] = [null, null, null, null, null];
    const dist = Math.sqrt(normal[0] * normal[0] + normal[1] * normal[1]);
    const uX = normal[0] / dist;
    const uY = normal[1] / dist;
    const d1 = MathDistance(pnt1, pnt2);
    const d2 = MathDistance(pnt2, pnt3);
    if (dist > Constants.ZERO_TOLERANCE) {
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
export const getLeftMostControlPoint = (controlPoints, t) => {
    const [pnt1, pnt2, pnt3] = [controlPoints[0], controlPoints[1], controlPoints[2]];
    let controlX, controlY;
    const pnts = getBisectorNormals(0, pnt1, pnt2, pnt3);
    const normalRight = pnts[0];
    const normal = getNormal(pnt1, pnt2, pnt3);
    const dist = Math.sqrt(normal[0] * normal[0] + normal[1] * normal[1]);
    if (dist > Constants.ZERO_TOLERANCE) {
        const mid = Mid(pnt1, pnt2);
        const pX = pnt1[0] - mid[0];
        const pY = pnt1[1] - mid[1];
        const d1 = MathDistance(pnt1, pnt2);
        const n = 2.0 / d1;
        const nX = -n * pY;
        const nY = n * pX;
        const a11 = nX * nX - nY * nY;
        const a12 = 2 * nX * nY;
        const a22 = nY * nY - nX * nX;
        const dX = normalRight[0] - mid[0];
        const dY = normalRight[1] - mid[1];
        controlX = mid[0] + a11 * dX + a12 * dY;
        controlY = mid[1] + a12 * dX + a22 * dY;
    } else {
        controlX = pnt1[0] + t * (pnt2[0] - pnt1[0]);
        controlY = pnt1[1] + t * (pnt2[1] - pnt1[1]);
    }
    return [controlX, controlY];
};

/**
 * 获取右边控制点
 * @param controlPoints
 * @param t
 * @returns {[*,*]}
 */
export const getRightMostControlPoint = (controlPoints, t) => {
    const count = controlPoints.length;
    const pnt1 = controlPoints[count - 3];
    const pnt2 = controlPoints[count - 2];
    const pnt3 = controlPoints[count - 1];
    const pnts = getBisectorNormals(0, pnt1, pnt2, pnt3);
    const normalLeft = pnts[1];
    const normal = getNormal(pnt1, pnt2, pnt3);
    const dist = Math.sqrt(normal[0] * normal[0] + normal[1] * normal[1]);
    let [controlX, controlY] = [null, null];
    if (dist > Constants.ZERO_TOLERANCE) {
        const mid = Mid(pnt2, pnt3);
        const pX = pnt3[0] - mid[0];
        const pY = pnt3[1] - mid[1];
        const d1 = MathDistance(pnt2, pnt3);
        const n = 2.0 / d1;
        const nX = -n * pY;
        const nY = n * pX;
        const a11 = nX * nX - nY * nY;
        const a12 = 2 * nX * nY;
        const a22 = nY * nY - nX * nX;
        const dX = normalLeft[0] - mid[0];
        const dY = normalLeft[1] - mid[1];
        controlX = mid[0] + a11 * dX + a12 * dY;
        controlY = mid[1] + a12 * dX + a22 * dY;
    } else {
        controlX = pnt3[0] + t * (pnt2[0] - pnt3[0]);
        controlY = pnt3[1] + t * (pnt2[1] - pnt3[1]);
    }
    return [controlX, controlY];
};

/**
 * 插值曲线点
 * @param t
 * @param controlPoints
 * @returns {null}
 */
export const getCurvePoints = (t, controlPoints) => {
    const leftControl = getLeftMostControlPoint(controlPoints, t);
    let [pnt1, pnt2, pnt3, normals] = [null, null, null, [leftControl]];
    const points = [];
    for (let i = 0; i < controlPoints.length - 2; i++) {
        [pnt1, pnt2, pnt3] = [controlPoints[i], controlPoints[i + 1], controlPoints[i + 2]];
        const normalPoints = getBisectorNormals(t, pnt1, pnt2, pnt3);
        normals = normals.concat(normalPoints);
    }
    const rightControl = getRightMostControlPoint(controlPoints, t);
    if (rightControl) {
        normals.push(rightControl);
    }
    for (let i = 0; i < controlPoints.length - 1; i++) {
        pnt1 = controlPoints[i];
        pnt2 = controlPoints[i + 1];
        points.push(pnt1);
        for (let t = 0; t < Constants.FITTING_COUNT; t++) {
            const pnt = getCubicValue(t / Constants.FITTING_COUNT, pnt1, normals[i * 2], normals[i * 2 + 1], pnt2);
            points.push(pnt);
        }
        points.push(pnt2);
    }
    return points;
};

/**
 * 获取阶乘数据
 * @param n
 * @returns {number}
 */
export const getFactorial = (n) => {
    let result = 1;
    switch (n) {
    case (n <= 1):
        result = 1;
        break;
    case (n === 2):
        result = 2;
        break;
    case (n === 3):
        result = 6;
        break;
    case (n === 24):
        result = 24;
        break;
    case (n === 5):
        result = 120;
        break;
    default:
        for (let i = 1; i <= n; i++) {
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
export const getBinomialFactor = (n, index) => {
    return (getFactorial(n) / (getFactorial(index) * getFactorial(n - index)));
};

/**
 * 贝塞尔曲线
 * @param points
 * @returns {*}
 */
export const getBezierPoints = function (points) {
    if (points.length <= 2) {
        return points;
    } else {
        const bezierPoints = [];
        const n = points.length - 1;
        for (let t = 0; t <= 1; t += 0.01) {
            let [x, y] = [0, 0];
            for (let index = 0; index <= n; index++) {
                const factor = getBinomialFactor(n, index);
                const a = Math.pow(t, index);
                const b = Math.pow((1 - t), (n - index));
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
export const getQuadricBSplineFactor = (k, t) => {
    let res = 0;
    if (k === 0) {
        res = Math.pow(t - 1, 2) / 2;
    } else if (k === 1) {
        res = (-2 * Math.pow(t, 2) + 2 * t + 1) / 2;
    } else if (k === 2) {
        res = Math.pow(t, 2) / 2;
    }
    return res;
};

/**
 * 插值线性点
 * @param points
 * @returns {*}
 */
export const getQBSplinePoints = points => {
    if (points.length <= 2) {
        return points;
    } else {
        const [n, bSplinePoints] = [2, []];
        const m = points.length - n - 1;
        bSplinePoints.push(points[0]);
        for (let i = 0; i <= m; i++) {
            for (let t = 0; t <= 1; t += 0.05) {
                let [x, y] = [0, 0];
                for (let k = 0; k <= n; k++) {
                    const factor = getQuadricBSplineFactor(k, t);
                    x += factor * points[i + k][0];
                    y += factor * points[i + k][1];
                }
                bSplinePoints.push([x, y]);
            }
        }
        bSplinePoints.push(points[points.length - 1]);
        return bSplinePoints;
    }
};

export const getCoordinatesArray = (coordinates) => {
    const _coordinates = [];
    for (let i = 0; i < coordinates.length; i++) {
        if (coordinates[i] && coordinates[i].hasOwnProperty('x')) {
            _coordinates.push([coordinates[i]['x'], coordinates[i]['y']]);
        } else {
            _coordinates.push(coordinates[i]);
        }
    }
    return _coordinates;
};

export const getCoordinatesObject = (coordinates) => {
    const _coordinates = [];
    for (let i = 0; i < coordinates.length; i++) {
        if (coordinates[i] && Array.isArray(coordinates[i])) {
            _coordinates.push(new Coordinate(coordinates[i][0], coordinates[i][1]));
        } else {
            _coordinates.push(coordinates[i]);
        }
    }
    return _coordinates;
};

/**
     * 判断是否为对象
     * @param value
     * @returns {boolean}
     */
export const isObject = (value) => {
    const type = typeof value;
    return value !== null && (type === 'object' || type === 'function');
};

export const merge = (a, b) => {
    for (const key in b) {
        if (isObject(b[key]) && isObject(a[key])) {
            merge(a[key], b[key]);
        } else {
            a[key] = b[key];
        }
    }
    return a;
};

//和maptalks.Canvas.paintSmoothLine类似，只不过去掉了begainPath的逻辑
export const paintSmoothLine = (ctx, points, lineOpacity, smoothValue, draw, close, tailIdx, tailRatio) => {
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

        const qxa =  x1 * u0 * u0 + bx1 * 2 * t0 * u0 + bx2 * t0 * t0;
        const qxb =  x1 * u1 * u1 + bx1 * 2 * t1 * u1 + bx2 * t1 * t1;
        const qxc = bx1 * u0 * u0 + bx2 * 2 * t0 * u0 +  x2 * t0 * t0;
        const qxd = bx1 * u1 * u1 + bx2 * 2 * t1 * u1 +  x2 * t1 * t1;

        const qya =  y1 * u0 * u0 + by1 * 2 * t0 * u0 + by2 * t0 * t0;
        const qyb =  y1 * u1 * u1 + by1 * 2 * t1 * u1 + by2 * t1 * t1;
        const qyc = by1 * u0 * u0 + by2 * 2 * t0 * u0 +  y2 * t0 * t0;
        const qyd = by1 * u1 * u1 + by2 * 2 * t1 * u1 +  y2 * t1 * t1;

        // const xa = qxa * u0 + qxc * t0;
        const xb = qxa * u1 + qxc * t1;
        const xc = qxb * u0 + qxd * t0;
        const xd = qxb * u1 + qxd * t1;

        // const ya = qya * u0 + qyc * t0;
        const yb = qya * u1 + qyc * t1;
        const yc = qyb * u0 + qyd * t0;
        const yd = qyb * u1 + qyd * t1;

        return [xb, yb, xc, yc, xd, yd];
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
        const ctrl1X = xm1 + (xc2 - xm1) * smoothValue + x1 - xm1,
            ctrl1Y = ym1 + (yc2 - ym1) * smoothValue + y1 - ym1,

            ctrl2X = xm2 + (xc2 - xm2) * smoothValue + x2 - xm2,
            ctrl2Y = ym2 + (yc2 - ym2) * smoothValue + y2 - ym2;

        const ctrlPoints = [ctrl1X, ctrl1Y, ctrl2X, ctrl2Y];
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
        Canvas._path(ctx, points, lineDashArray, lineOpacity);
        Canvas._stroke(ctx, lineOpacity);
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

    let count = points.length;
    let l = close ? count : count - 1;

    if (tailRatio !== undefined) l -= Math.max(l - tailIdx - 1, 0);
    let preCtrlPoints;
    for (let i = 0; i < l; i++) {
        const x1 = points[i].x, y1 = points[i].y;

        let x0, y0, x2, y2, x3, y3;
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

        const ctrlPoints = getCubicControlPoints(x0, y0, x1, y1, x2, y2, x3, y3, smoothValue, i === l - 1 ? tailRatio : 1);
        if (i === l - 1 && tailRatio >= 0 && tailRatio < 1) {
            if (ctx) {
                ctx.bezierCurveTo(ctrlPoints[0], ctrlPoints[1], ctrlPoints[2], ctrlPoints[3], ctrlPoints[4], ctrlPoints[5]);
            }
            points.splice(l - 1, count - (l - 1) - 1);
            const lastPoint = new Point(ctrlPoints[4], ctrlPoints[5]);
            lastPoint.prevCtrlPoint = new Point(ctrlPoints[2], ctrlPoints[3]);
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
        Canvas._stroke(ctx, lineOpacity);
    }
    return points;
};
