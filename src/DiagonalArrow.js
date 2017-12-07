import * as maptalks from 'maptalks';
import PlotUtils from './PlotUtils';
import StraightArrow from './StraightArrow';

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
export default class DiagonalArrow extends StraightArrow {

    static fromJSON(json) {
        const feature = json['feature'];
        const arrow = new DiagonalArrow(feature['geometry']['coordinates'], json['options']);
        arrow.setProperties(feature['properties']);
        return arrow;
    }

    _toJSON(options) {
        return {
            'feature' : this.toGeoJSON(options),
            'subType' : 'DiagonalArrow'
        };
    }

    _getPaintParams() {
        const points = this._getPath2DPoints(this._getPrjCoordinates());
        if (points.length <= 1) {
            return null;
        }
        const zoomScale = this.getMap().getGLScale();
        const length = this._get2DLength();
        const lineWidth = length * this.options['widthRatio'];

        const arrowPairs = PlotUtils.getArrowBody(points, lineWidth, this.getMap(), 0.15, length);
        const h1 = arrowPairs[0][arrowPairs[0].length - 1],
            h2 = arrowPairs[1][arrowPairs[1].length - 1];
        const arrowHead = this._getArrowHead(h1, h2, points[points.length - 1], lineWidth * 0.3, 2);
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

}

DiagonalArrow.mergeOptions(options);

DiagonalArrow.registerJSONType('DiagonalArrow');

maptalks.DrawTool.registerMode('DiagonalArrow', {
    'action' : 'clickDblclick',
    'create' : function (path) {
        return new DiagonalArrow(path);
    },
    'update' : function (path, geometry) {
        geometry.setCoordinates(path);
    },
    'generate' : function (geometry) {
        return geometry;
    }
});
