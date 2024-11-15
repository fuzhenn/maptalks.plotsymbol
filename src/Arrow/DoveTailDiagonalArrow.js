import * as maptalks from 'maptalks';
import DiagonalArrow from './DiagonalArrow';
import Point from '@mapbox/point-geometry';

/**
 * @property {Object} options
 */
const options = {
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
export default class DoveTailDiagonalArrow extends DiagonalArrow {

    static fromJSON(json) {
        const feature = json['feature'];
        const arrow = new DoveTailDiagonalArrow(feature['geometry']['coordinates'], json['options']);
        arrow.setProperties(feature['properties']);
        return arrow;
    }

    _toJSON(options) {
        return {
            'feature': this.toGeoJSON(options),
            'subType': 'DoveTailDiagonalArrow'
        };
    }

    _closeArrow(ctx, last, first) {
        const pitch = this.getMap().getPitch();
        const t1 = new Point(last.x, last.y);
        const t2 = new Point(first.x, first.y);
        const m = new Point(t1.x + t2.x, t1.y + t2.y).mult(1 / 2);
        const dist = -t1.dist(t2);
        const normal = t1.sub(t2)._unit()._perp();
        const max = 0.618;
        const min = 0.1;
        const maxPitch = 80;//map's default max pitch
        const ratio = max - pitch * (max - min) / maxPitch;
        const xc = m.x + dist * ratio * normal.x,
            yc = m.y + dist * ratio * normal.y;
        ctx.lineTo(xc, yc);
        ctx.closePath();
    }
}

DoveTailDiagonalArrow.mergeOptions(options);

DoveTailDiagonalArrow.registerJSONType('DoveTailDiagonalArrow');

maptalks.DrawTool.registerMode('DoveTailDiagonalArrow', {
    'action': ['click', 'mousemove', 'dblclick'],
    'create': function (projection, prjPath) {
        const path = prjPath.map(c => projection.unproject(c));
        const line = new DoveTailDiagonalArrow(path);
        line._setPrjCoordinates(prjPath);
        return line;
    },
    'update': function (projection, prjPath, geometry) {
        let prjCoords;
        if (Array.isArray(prjPath)) {
            prjCoords = prjPath;
        } else {
            prjCoords = geometry._getPrjCoordinates();
            prjCoords.push(prjPath);
        }
        const path = prjCoords.map(c => projection.unproject(c));
        geometry.setCoordinates(path);
        geometry._setPrjCoordinates(prjCoords);
    },
    'generate': function (geometry) {
        return geometry;
    }
});
