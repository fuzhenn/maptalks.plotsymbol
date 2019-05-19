/**
 * Created by FDD on 2017/12/31.
 * @desc 双箭头
 * @Inherits maptalks.Polygon
 */

import * as maptalks from 'maptalks';
import * as Constants from '../Constants';

import {
  Mid,
  getThirdPoint,
  MathDistance,
  getBaseLength,
  wholeDistance,
  isClockWise,
  getBezierPoints,
  getAngleOfThreePoints
} from '../PlotUtils';

const Coordinate = maptalks.Coordinate;

const _options = {
    headHeightFactor: 0.25,
    headWidthFactor: 0.3,
    neckHeightFactor: 0.85,
    neckWidthFactor: 0.15
};

class DoubleArrow extends maptalks.Polygon {
    constructor(coordinates, points, options = {}) {
        super(options);
        this.type = 'DoubleArrow';
        this._coordinates = [];
        this.connetPoints = [];
        this.symmetricalPoints = [];
        this._points = points || [];
        if (coordinates) {
            this.setCoordinates(coordinates);
        }
    }

    /**
     * 处理插值
     */
    _generate() {
        try {
            const count = this._points.length;
            const _points = Coordinate.toNumberArrays(this._points);
            if (count < 2) return;
            if (count === 2) {
                this.setCoordinates([this._points]);
            } else {
                let [pnt1, pnt2, pnt3] = [_points[0], _points[1], _points[2]];
                if (count === 3) {
                    this.symmetricalPoints = DoubleArrow.getSymmetricalPoints(pnt1, pnt2, pnt3);
                    this.connetPoints = Mid(pnt1, pnt2);
                } else if (count === 4) {
                    this.symmetricalPoints = _points[3];
                    this.connetPoints = Mid(pnt1, pnt2);
                } else {
                    this.symmetricalPoints = _points[3];
                    this.connetPoints = _points[4];
                }
                let [leftArrowPoints, rightArrowPoints] = [undefined, undefined];
                if (isClockWise(pnt1, pnt2, pnt3)) {
                    leftArrowPoints = DoubleArrow.getArrowPoints(pnt1, this.connetPoints, this.symmetricalPoints, false);
                    rightArrowPoints = DoubleArrow.getArrowPoints(this.connetPoints, pnt2, pnt3, true);
                } else {
                    leftArrowPoints = DoubleArrow.getArrowPoints(pnt2, this.connetPoints, pnt3, false);
                    rightArrowPoints = DoubleArrow.getArrowPoints(this.connetPoints, pnt1, this.symmetricalPoints, true);
                }
                let m = leftArrowPoints.length;
                let t = (m - 5) / 2;
                let llBodyPoints = leftArrowPoints.slice(0, t);
                let lArrowPoints = leftArrowPoints.slice(t, t + 5);
                let lrBodyPoints = leftArrowPoints.slice(t + 5, m);
                let rlBodyPoints = rightArrowPoints.slice(0, t);
                let rArrowPoints = rightArrowPoints.slice(t, t + 5);
                let rrBodyPoints = rightArrowPoints.slice(t + 5, m);
                rlBodyPoints = getBezierPoints(rlBodyPoints);
                let bodyPoints = getBezierPoints(rrBodyPoints.concat(llBodyPoints.slice(1)));
                lrBodyPoints = getBezierPoints(lrBodyPoints);
                let Points = rlBodyPoints.concat(rArrowPoints, bodyPoints, lArrowPoints, lrBodyPoints);
                this.setCoordinates([
                    Coordinate.toCoordinates(Points)
                ]);
            }
        } catch (e) {
            console.log(e);
        }
    }

    /**
     * 获取geom类型
     * @returns {string}
     */
    getPlotType() {
        return this.type;
    }

    /**
    * 获取控制点
    * @returns {Array|*}
    */
    getPoints() {
        return this._points;
    }

   /**
   * set point
   * @param coordinates
   */
    setPoints(coordinates) {
        this._points = !coordinates ? [] : coordinates;
        if (this._points.length >= 1) {
            this._generate();
        }
    }

    _exportGeoJSONGeometry() {
        const coordinates = Coordinate.toNumberArrays([this.getShell()]);
        return {
            'type': 'Polygon',
            'coordinates': coordinates
        };
    }

    _toJSON(options) {
        const opts = maptalks.Util.extend({}, options);
        const coordinates = this.getCoordinates();
        opts.geometry = false;
        const feature = this.toGeoJSON(opts);
        feature['geometry'] = {
            'type': 'Polygon'
        };
        return {
            'feature': feature,
            'subType': 'DoubleArrow',
            'coordinates': coordinates,
            'points': this.getPoints()
        };
    }

    /**
     * 插值箭形上的点
     * @param pnt1
     * @param pnt2
     * @param pnt3
     * @param clockWise
     * @returns {*[]}
     */
    static getArrowPoints(pnt1, pnt2, pnt3, clockWise) {
        let midPnt = Mid(pnt1, pnt2);
        let len = MathDistance(midPnt, pnt3);
        let midPnt1 = getThirdPoint(pnt3, midPnt, 0, len * 0.3, true);
        let midPnt2 = getThirdPoint(pnt3, midPnt, 0, len * 0.5, true);
        midPnt1 = getThirdPoint(midPnt, midPnt1, Constants.HALF_PI, len / 5, clockWise);
        midPnt2 = getThirdPoint(midPnt, midPnt2, Constants.HALF_PI, len / 4, clockWise);
        let points = [midPnt, midPnt1, midPnt2, pnt3];
        let arrowPnts = DoubleArrow._getArrowHeadPoints(points);
        if (arrowPnts && Array.isArray(arrowPnts) && arrowPnts.length > 0) {
            let [neckLeftPoint, neckRightPoint] = [arrowPnts[0], arrowPnts[4]];
            let tailWidthFactor = MathDistance(pnt1, pnt2) / getBaseLength(points) / 2;
            let bodyPnts = DoubleArrow._getArrowBodyPoints(points, neckLeftPoint, neckRightPoint, tailWidthFactor);
            if (bodyPnts) {
                let n = bodyPnts.length;
                let lPoints = bodyPnts.slice(0, n / 2);
                let rPoints = bodyPnts.slice(n / 2, n);
                lPoints.push(neckLeftPoint);
                rPoints.push(neckRightPoint);
                lPoints = lPoints.reverse();
                lPoints.push(pnt2);
                rPoints = rPoints.reverse();
                rPoints.push(pnt1);
                return (lPoints.reverse().concat(arrowPnts, rPoints));
            }
        }
        return null;
    }

    /**
     * 插值头部点
     * @param points
     * @returns {*[]}
     */
    static _getArrowHeadPoints(points) {
        let len = getBaseLength(points);
        let headHeight = len * _options.headHeightFactor;
        let headPnt = points[points.length - 1];
        let headWidth = headHeight * _options.headWidthFactor;
        let neckWidth = headHeight * _options.neckWidthFactor;
        let neckHeight = headHeight * _options.neckHeightFactor;
        let headEndPnt = getThirdPoint(points[points.length - 2], headPnt, 0, headHeight, true);
        let neckEndPnt = getThirdPoint(points[points.length - 2], headPnt, 0, neckHeight, true);
        let headLeft = getThirdPoint(headPnt, headEndPnt, Constants.HALF_PI, headWidth, false);
        let headRight = getThirdPoint(headPnt, headEndPnt, Constants.HALF_PI, headWidth, true);
        let neckLeft = getThirdPoint(headPnt, neckEndPnt, Constants.HALF_PI, neckWidth, false);
        let neckRight = getThirdPoint(headPnt, neckEndPnt, Constants.HALF_PI, neckWidth, true);
        return [neckLeft, headLeft, headPnt, headRight, neckRight];
    }

    /**
     * 插值面部分数据
     * @param points
     * @param neckLeft
     * @param neckRight
     * @param tailWidthFactor
     * @returns {*|T[]|string}
     */
    static _getArrowBodyPoints(points, neckLeft, neckRight, tailWidthFactor) {
        let allLen = wholeDistance(points);
        let len = getBaseLength(points);
        let tailWidth = len * tailWidthFactor;
        let neckWidth = MathDistance(neckLeft, neckRight);
        let widthDif = (tailWidth - neckWidth) / 2;
        let [tempLen, leftBodyPnts, rightBodyPnts] = [0, [], []];
        for (let i = 1; i < points.length - 1; i++) {
            let angle = getAngleOfThreePoints(points[i - 1], points[i], points[i + 1]) / 2;
            tempLen += MathDistance(points[i - 1], points[i]);
            let w = (tailWidth / 2 - tempLen / allLen * widthDif) / Math.sin(angle);
            let left = getThirdPoint(points[i - 1], points[i], Math.PI - angle, w, true);
            let right = getThirdPoint(points[i - 1], points[i], angle, w, false);
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
     */
    static getSymmetricalPoints(linePnt1, linePnt2, point) {
        let midPnt = Mid(linePnt1, linePnt2);
        let len = MathDistance(midPnt, point);
        let angle = getAngleOfThreePoints(linePnt1, midPnt, point);
        let [symPnt, distance1, distance2, mid] = [undefined, undefined, undefined, undefined];
        if (angle < Constants.HALF_PI) {
            distance1 = len * Math.sin(angle);
            distance2 = len * Math.cos(angle);
            mid = getThirdPoint(linePnt1, midPnt, Constants.HALF_PI, distance1, false);
            symPnt = getThirdPoint(midPnt, mid, Constants.HALF_PI, distance2, true);
        } else if (angle >= Constants.HALF_PI && angle < Math.PI) {
            distance1 = len * Math.sin(Math.PI - angle);
            distance2 = len * Math.cos(Math.PI - angle);
            mid = getThirdPoint(linePnt1, midPnt, Constants.HALF_PI, distance1, false);
            symPnt = getThirdPoint(midPnt, mid, Constants.HALF_PI, distance2, false);
        } else if (angle >= Math.PI && angle < Math.PI * 1.5) {
            distance1 = len * Math.sin(angle - Math.PI);
            distance2 = len * Math.cos(angle - Math.PI);
            mid = getThirdPoint(linePnt1, midPnt, Constants.HALF_PI, distance1, true);
            symPnt = getThirdPoint(midPnt, mid, Constants.HALF_PI, distance2, true);
        } else {
            distance1 = len * Math.sin(Math.PI * 2 - angle);
            distance2 = len * Math.cos(Math.PI * 2 - angle);
            mid = getThirdPoint(linePnt1, midPnt, Constants.HALF_PI, distance1, true);
            symPnt = getThirdPoint(midPnt, mid, Constants.HALF_PI, distance2, false);
        }
        return symPnt;
    }

    static fromJSON(json) {
        const feature = json['feature'];
        const doubleArrow = new DoubleArrow(json['coordinates'], json['points'], json['options']);
        doubleArrow.setProperties(feature['properties']);
        return doubleArrow;
    }
}

DoubleArrow.registerJSONType('DoubleArrow');

maptalks.DrawTool.registerMode('DoubleArrow', {
    action: ['click', 'mousemove', 'dblclick'],
    create(path) {
        return new DoubleArrow(path);
    },
    update(path, geometry) {
        geometry.setPoints(path);
    },
    generate(geometry) {
        return geometry;
    }
});

export default DoubleArrow;
