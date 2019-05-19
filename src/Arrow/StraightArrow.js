import * as maptalks from 'maptalks';
import Point from 'point-geometry';
import { getArrowBody } from '../PlotUtils';

/**
 * @property {Object} options
 */
const options = {
    'widthRatio' : 0.10,
    'arrowStyle' : []
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
export default class StraightArrow extends maptalks.Curve {

    static fromJSON(json) {
        const feature = json['feature'];
        const arrow = new StraightArrow(feature['geometry']['coordinates'], json['options']);
        arrow.setProperties(feature['properties']);
        return arrow;
    }

    _toJSON(options) {
        return {
            'feature' : this.toGeoJSON(options),
            'subType' : 'StraightArrow'
        };
    }

    _getPaintParams() {
        const map = this.getMap();
        const zoomScale = map.getGLScale();
        const points = this._getPath2DPoints(this._getPrjCoordinates());
        if (points.length <= 1) {
            return null;
        }
        const length = this._get2DLength();
        const lineWidth = length * this.options['widthRatio'];

        const arrowPairs = getArrowBody(points, lineWidth, this.getMap());
        const h1 = arrowPairs[0][arrowPairs[0].length - 1],
            h2 = arrowPairs[1][arrowPairs[1].length - 1];
        const arrowHead = this._getArrowHead(h1, h2, points[points.length - 1], lineWidth);
        var plots = [];
        plots.push.apply(plots, arrowPairs[0]);
        plots.push.apply(plots, arrowHead);
        for (let i = arrowPairs[1].length - 1; i >= 0; i--) {
            plots.push(arrowPairs[1][i]);
        }
        // convert to point in maxZoom
        plots = plots.map(p => p.multi(zoomScale));
        return [plots, [arrowPairs[0].length, arrowHead.length, arrowPairs[1].length]];
    }

    _paintOn(ctx, points, segs, lineOpacity, fillOpacity, lineDasharray) {
        ctx.beginPath();
        var seg;
        //draw body upside
        var i = 0;
        ctx.moveTo(points[0].x, points[0].y);
        seg = points.slice(0, segs[0]);
        this._quadraticCurve(ctx, seg);
        //draw head
        i += segs[0];
        maptalks.Canvas._path(ctx, points.slice(i, i + segs[1]), lineDasharray, lineOpacity);
        //draw body downside
        i += segs[1];
        ctx.lineTo(points[i].x, points[i].y);
        seg = points.slice(i, i + segs[2]);
        this._quadraticCurve(ctx, seg);
        this._closeArrow(ctx, points[points.length - 1], points[0]);
        maptalks.Canvas._stroke(ctx, lineOpacity);
        maptalks.Canvas.fillCanvas(ctx, fillOpacity, points[0].x, points[0].y);
    }

    _closeArrow(ctx) {
        ctx.closePath();
    }

    /**
     * Get points of arrow head
     * @param  {maptalks.Coordinate} h1   - head point 1
     * @param  {maptalks.Coordinate} h2   - head point 2
     * @param  {maptalks.Coordinate} vertex - head vertex
     * @param  {Number} lineWidth         - line width
     * @return {maptalks.Coordinate[]}
     */
    _getArrowHead(h1, h2, vertex, lineWidth, hScale) {
        if (!hScale) {
            hScale = 1;
        }
        h1 = new Point(h1.x, h1.y);
        h2 = new Point(h2.x, h2.y);
        const normal = h1.sub(h2)._unit();
        const head0 = vertex.add(lineWidth * normal.x, lineWidth * normal.y);
        const head2 = vertex.add(lineWidth * -normal.x, lineWidth * -normal.y);
        normal._perp()._mult(-1);
        const head1 = vertex.add(hScale * lineWidth * normal.x, hScale * lineWidth * normal.y);
        return [head0, head1, head2];
    }

}

StraightArrow.mergeOptions(options);

StraightArrow.registerJSONType('StraightArrow');

maptalks.DrawTool.registerMode('StraightArrow', {
    action: ['click', 'mousemove', 'dblclick'],
    create(path) {
        return new StraightArrow(path);
    },
    update(path, geometry) {
        geometry.setCoordinates(path);
    },
    generate(geometry) {
        return geometry;
    }
});
