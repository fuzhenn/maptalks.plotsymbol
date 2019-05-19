/**
 * Created by FDD on 2017/12/26.
 * @desc 闭合曲面
 * @Inherits maptalks.Polygon
 */
import * as maptalks from 'maptalks';
import * as Constants from '../Constants';
import { getBisectorNormals, getCubicValue } from '../PlotUtils';

const Coordinate = maptalks.Coordinate;
class ClosedCurve extends maptalks.Polygon {
    constructor(coordinates, points, options = {}) {
        super(options);
        this.type = 'ClosedCurve';
        this._offset = 0.3;
        this._coordinates = [];
        this._points = points || [];
        if (coordinates) {
            this.setCoordinates(coordinates);
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
     * 处理插值
     * @returns {*}
     * @private
     */
    _generate() {
        const count = this._points.length;
        if (count < 2) return;
        if (count === 2) {
            this.setCoordinates([this._points]);
        } else {
            const points = Coordinate.toNumberArrays(this._points);
            points.push(points[0], points[1]);
            let [normals, pList] = [[], []];
            for (let i = 0; i < points.length - 2; i++) {
                let normalPoints = getBisectorNormals(this._offset, points[i], points[i + 1], points[i + 2]);
                normals = normals.concat(normalPoints);
            }
            let count = normals.length;
            normals = [normals[count - 1]].concat(normals.slice(0, count - 1));
            for (let i = 0; i < points.length - 2; i++) {
                let pnt1 = points[i];
                let pnt2 = points[i + 1];
                pList.push(pnt1);
                for (let t = 0; t <= Constants.FITTING_COUNT; t++) {
                    let pnt = getCubicValue(t / Constants.FITTING_COUNT, pnt1, normals[i * 2], normals[i * 2 + 1], pnt2);
                    pList.push(pnt);
                }
                pList.push(pnt2);
            }
            this.setCoordinates([Coordinate.toCoordinates(pList)]);
        }
    }

    setPoints(coordinates) {
        this._points = coordinates || [];
        if (this._points.length >= 1) {
            this._generate();
        }
    }

    /**
     * 获取控制点
     * @returns {Array|*}
     */
    getPoints() {
        return this._points;
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
            'subType': 'ClosedCurve',
            'coordinates': coordinates,
            'points': this.getPoints()
        };
    }

    static fromJSON(json) {
        const feature = json['feature'];
        const _closedCurve = new ClosedCurve(json['coordinates'], json['points'], json['options']);
        _closedCurve.setProperties(feature['properties']);
        return _closedCurve;
    }
}

ClosedCurve.registerJSONType('ClosedCurve');

maptalks.DrawTool.registerMode('ClosedCurve', {
    action: ['click', 'mousemove', 'dblclick'],
    create(path) {
        return new ClosedCurve(path);
    },
    update(path, geometry) {
        geometry.setPoints(path);
    },
    generate(geometry) {
        return geometry;
    }
});

export default ClosedCurve;
