'use strict';

var maptalks = require('maptalks');
var Point = require('point-geometry');
var PlotUtils = require('./PlotUtils');
var StraightArrow = require('./StraightArrow');

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
var DiagonalArrow = module.exports = maptalks.StraightArrow.extend(/** @lends maptalks.DiagonalArrow.prototype */{
    /**
     * @property {Object} options
     */
    options:{
        'widthRatio' : 0.20,
        'arrowStyle' : []
    },

    _toJSON:function (options) {
        return {
            'feature' : this.toGeoJSON(options),
            'subType' : 'DiagonalArrow'
        };
    },

    _getPaintParams: function () {
        var points = this._getPath2DPoints(this._getPrjCoordinates());
        if (points.length <= 1) {
            return null;
        }
        var length = this._get2DLength();
        var lineWidth = length * this.options['widthRatio'];

        var arrowPairs = PlotUtils.getArrowBody(points, lineWidth, this.getMap(), 0.15, length);
        var h1 = arrowPairs[0][arrowPairs[0].length - 1],
            h2 = arrowPairs[1][arrowPairs[1].length - 1];
        var arrowHead = this._getArrowHead(h1, h2, points[points.length - 1], lineWidth * 0.3, 2);
        var t1 = arrowPairs[0][0],
            t2 = arrowPairs[1][0];
        var plots = [];
        plots.push.apply(plots, arrowPairs[0]);
        plots.push.apply(plots, arrowHead);
        for (var i = arrowPairs[1].length - 1; i >= 0; i--) {
            plots.push(arrowPairs[1][i]);
        }
        // arrowPairs.push(arrowHead);
        return [plots, [arrowPairs[0].length, arrowHead.length, arrowPairs[1].length]];
    }

});

DiagonalArrow.fromJSON = function (json) {
    var feature = json['feature'];
    var arrow = new maptalks.DiagonalArrow(feature['geometry']['coordinates'], json['options']);
    arrow.setProperties(feature['properties']);
    return arrow;
};

maptalks.DrawTool.registerMode('DiagonalArrow', {
    'action' : 'clickDblclick',
    'create' : function (path) {
        return new maptalks.DiagonalArrow(path);
    },
    'update' : function (path, geometry) {
        geometry.setCoordinates(path);
    },
    'generate' : function (geometry) {
        return geometry;
    }
});
