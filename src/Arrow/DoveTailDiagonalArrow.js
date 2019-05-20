import * as maptalks from 'maptalks';
import DiagonalArrow from './DiagonalArrow';
import Point from 'point-geometry';

/**
 * @property {Object} options
 */
const options = {
    'widthRatio' : 0.20,
    'arrowStyle' : []
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
            'feature' : this.toGeoJSON(options),
            'subType' : 'DoveTailDiagonalArrow'
        };
    }

    _closeArrow(ctx, last, first) {
        const t1 = new Point(last.x, last.y);
        const t2 = new Point(first.x, first.y);
        const m = new Point(t1.x + t2.x, t1.y + t2.y).mult(1 / 2);
        const dist = t1.dist(t2);
        const normal = t1.sub(t2)._unit()._perp();
        const xc = m.x + dist * 0.618 * normal.x,
            yc = m.y + dist * 0.618 * normal.y;
        ctx.lineTo(xc, yc);
        ctx.closePath();
    }
}

DoveTailDiagonalArrow.mergeOptions(options);

DoveTailDiagonalArrow.registerJSONType('DoveTailDiagonalArrow');

maptalks.DrawTool.registerMode('DoveTailDiagonalArrow', {
    'action': ['click', 'mousemove', 'dblclick'],
    'create' : function (path) {
        return new DoveTailDiagonalArrow(path);
    },
    'update' : function (path, geometry) {
        geometry.setCoordinates(path);
    },
    'generate' : function (geometry) {
        return geometry;
    }
});
