/**
 * Created by FDD on 2017/12/26.
 * @desc 扇形
 * @Inherits maptalks.Polygon
 */

import * as maptalks from 'maptalks';
import { getSectorPoints, pointDistance, getAzimuth } from '../PlotUtils';
const Coordinate = maptalks.Coordinate;

class Sector extends maptalks.Polygon {
    constructor(coordinates, points, options = {}) {
        super(options);
        this.type = 'Sector';
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
     * handle coordinates
     * @private
     */
    _generate() {
        const count = this._points.length;
        let _points = Coordinate.toNumberArrays(this._points);
        if (count < 2) return;
        if (count === 2) {
            this.setCoordinates([this._points]);
        } else {
            let [center, pnt2, pnt3] = [_points[0], _points[1], _points[2]];
            const measurer = this._getMeasurer();
            const radius = pointDistance(measurer, pnt2, center);
            let startAngle = getAzimuth(pnt2, center);
            let endAngle = getAzimuth(pnt3, center);
            let pList = getSectorPoints(measurer, center, radius, startAngle, endAngle);
            pList.push(center, pList[0]);
            this.setCoordinates([
                Coordinate.toCoordinates(pList)
            ]);
        }
    }

    /**
     * 更新控制点
     * @param coordinates
     */
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
            'subType': 'Sector',
            'coordinates': coordinates,
            'points': this.getPoints()
        };
    }

    static fromJSON(json) {
        const feature = json['feature'];
        const _geometry = new Sector(json['coordinates'], json['points'], json['options']);
        _geometry.setProperties(feature['properties']);
        return _geometry;
    }
}

Sector.registerJSONType('Sector');

maptalks.DrawTool.registerMode('Sector', {
    action: ['click', 'mousemove', 'dblclick'],
    create(path) {
        return new Sector(path);
    },
    update(path, geometry) {
        geometry.setPoints(path);
    },
    generate(geometry) {
        return geometry;
    }
});

export default Sector;
