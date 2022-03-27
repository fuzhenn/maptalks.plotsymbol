import { Coordinate, Util, DrawTool, LineString } from 'maptalks';
import InterprolationGeometry from '../InterpolationGeometry';
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


const _options = {
    headHeightFactor: 0.25,
    headWidthFactor: 0.3,
    neckHeightFactor: 0.85,
    neckWidthFactor: 0.15
};

class DoubleArrow extends InterprolationGeometry {
    constructor(coordinates, options = {}) {
        super(coordinates, options);
        this.type = 'DoubleArrow';
        this.connetPoints = [];
        this.symmetricalPoints = [];
    }

    /**
     * 处理插值
     */
    _generate() {
        let points = [];
        const coordinates = this.getCoordinates();
        const count = coordinates.length;
        const _points = Coordinate.toNumberArrays(coordinates);
        if (count < 2) {
            return null;
        } else if (count === 2) {
            this.setCoordinates(coordinates);
            return null;
        } else {
            const [pnt1, pnt2, pnt3] = [_points[0], _points[1], _points[2]];
            if (count === 3) {
                this.symmetricalPoints = DoubleArrow.getSymmetricalPoints(pnt1, pnt2, pnt3);
                this.connetPoints = Mid(pnt1, pnt2);
            } else if (count === 4) {
                this.symmetricalPoints = _points[3];
                this.connetPoints = Mid(pnt1, pnt2);
            } else if (count > 4) {
                //this._drawTool.disable();
            }
            let [leftArrowPoints, rightArrowPoints] = [undefined, undefined];
            if (isClockWise(pnt1, pnt2, pnt3)) {
                leftArrowPoints = DoubleArrow.getArrowPoints(pnt1, this.connetPoints, this.symmetricalPoints, false);
                rightArrowPoints = DoubleArrow.getArrowPoints(this.connetPoints, pnt2, pnt3, true);
            } else {
                leftArrowPoints = DoubleArrow.getArrowPoints(pnt2, this.connetPoints, pnt3, false);
                rightArrowPoints = DoubleArrow.getArrowPoints(this.connetPoints, pnt1, this.symmetricalPoints, true);
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
            points = points.map(p => {
                return new Coordinate(p);
            });
        }
        return points;
    }

    /**
     * 获取geom类型
     * @returns {string}
     */
    getPlotType() {
        return this.type;
    }

    _exportGeoJSONGeometry() {
        const coordinates = Coordinate.toNumberArrays([this.getShell()]);
        return {
            'type': 'Polygon',
            'coordinates': coordinates
        };
    }

    _toJSON(options) {
        const opts = Util.extend({}, options);
        const coordinates = this.getCoordinates();
        opts.geometry = false;
        const feature = this.toGeoJSON(opts);
        feature['geometry'] = {
            'type': 'Polygon'
        };
        return {
            'feature': feature,
            'subType': 'DoubleArrow',
            'coordinates': coordinates
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
        const midPnt = Mid(pnt1, pnt2);
        const len = MathDistance(midPnt, pnt3);
        let midPnt1 = getThirdPoint(pnt3, midPnt, 0, len * 0.3, true);
        let midPnt2 = getThirdPoint(pnt3, midPnt, 0, len * 0.5, true);
        midPnt1 = getThirdPoint(midPnt, midPnt1, Constants.HALF_PI, len / 5, clockWise);
        midPnt2 = getThirdPoint(midPnt, midPnt2, Constants.HALF_PI, len / 4, clockWise);
        const points = [midPnt, midPnt1, midPnt2, pnt3];
        const arrowPnts = DoubleArrow._getArrowHeadPoints(points);
        if (arrowPnts && Array.isArray(arrowPnts) && arrowPnts.length > 0) {
            const [neckLeftPoint, neckRightPoint] = [arrowPnts[0], arrowPnts[4]];
            const tailWidthFactor = MathDistance(pnt1, pnt2) / getBaseLength(points) / 2;
            const bodyPnts = DoubleArrow._getArrowBodyPoints(points, neckLeftPoint, neckRightPoint, tailWidthFactor);
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
        const len = getBaseLength(points);
        const headHeight = len * _options.headHeightFactor;
        const headPnt = points[points.length - 1];
        const headWidth = headHeight * _options.headWidthFactor;
        const neckWidth = headHeight * _options.neckWidthFactor;
        const neckHeight = headHeight * _options.neckHeightFactor;
        const headEndPnt = getThirdPoint(points[points.length - 2], headPnt, 0, headHeight, true);
        const neckEndPnt = getThirdPoint(points[points.length - 2], headPnt, 0, neckHeight, true);
        const headLeft = getThirdPoint(headPnt, headEndPnt, Constants.HALF_PI, headWidth, false);
        const headRight = getThirdPoint(headPnt, headEndPnt, Constants.HALF_PI, headWidth, true);
        const neckLeft = getThirdPoint(headPnt, neckEndPnt, Constants.HALF_PI, neckWidth, false);
        const neckRight = getThirdPoint(headPnt, neckEndPnt, Constants.HALF_PI, neckWidth, true);
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
        const allLen = wholeDistance(points);
        const len = getBaseLength(points);
        const tailWidth = len * tailWidthFactor;
        const neckWidth = MathDistance(neckLeft, neckRight);
        const widthDif = (tailWidth - neckWidth) / 2;
        let tempLen = 0;
        const leftBodyPnts = [];
        const rightBodyPnts = [];
        for (let i = 1; i < points.length - 1; i++) {
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
     */
    static getSymmetricalPoints(linePnt1, linePnt2, point) {
        const midPnt = Mid(linePnt1, linePnt2);
        const len = MathDistance(midPnt, point);
        const angle = getAngleOfThreePoints(linePnt1, midPnt, point);
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
        const doubleArrow = new DoubleArrow(json['coordinates'], json['options']);
        doubleArrow.setProperties(feature['properties']);
        return doubleArrow;
    }
}

DoubleArrow.registerJSONType('DoubleArrow');

DrawTool.registerMode('DoubleArrow', {
    action: ['click', 'mousemove', 'dblclick'],
    create(projection, prjPath) {
        const path = prjPath.map(c => projection.unproject(c));
        const line = new LineString(path);
        line._setPrjCoordinates(prjPath);
        return line;
    },
    update(projection, path, geometry, e) {
        const symbol = geometry.getSymbol();
        let prjCoords;
        if (Array.isArray(path)) {
            prjCoords = path;
        } else {
            prjCoords = geometry._getPrjCoordinates();
            prjCoords.push(path);
        }
        const coordinates = prjCoords.map(c => projection.unproject(c));
        geometry.setCoordinates(coordinates);
        geometry._setPrjCoordinates(prjCoords);

        const layer = geometry.getLayer();
        if (layer) {
            const map = layer.getMap();
            let doublearrow = layer.getGeometryById('doublearrow');
            if (!doublearrow && path.length >= 3) {
                doublearrow = new DoubleArrow(path, {
                    'id': 'doublearrow'
                });
                doublearrow._drawTool = e.drawTool || map['_map_tool'];
                doublearrow.addTo(layer);
                if (symbol) {
                    doublearrow.setSymbol(symbol);
                }
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
    generate(geometry) {
        const symbol = geometry.getSymbol();
        symbol.lineOpacity = 1;
        let coordinates = geometry.getCoordinates();
        if (coordinates.length > 4) {
            coordinates = coordinates.slice(0, 4);
        }
        return new DoubleArrow(coordinates, {
            'symbol': symbol
        });
    }
});

export default DoubleArrow;
