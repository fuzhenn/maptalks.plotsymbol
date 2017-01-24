'use strict';

var maptalks = require('maptalks');
var Point = require('point-geometry');
var PlotUtils = require('./PlotUtils');
var DiagonalArrow = require('./DiagonalArrow');

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
var DoveTailDiagonalArrow = module.exports = maptalks.DiagonalArrow.extend(/** @lends maptalks.DoveTailDiagonalArrow.prototype */{
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
            'subType' : 'DoveTailDiagonalArrow'
        };
    },

    _closeArrow: function (ctx, last, first) {
        var t1 = new Point(last.x, last.y);
        var t2 = new Point(first.x, first.y);
        var m = new Point(t1.x + t2.x, t1.y + t2.y).mult(1 / 2);
        var dist = t1.dist(t2);
        var normal = t1.sub(t2)._unit()._perp();
        var xc = m.x + dist * 0.618 * normal.x,
            yc = m.y + dist * 0.618 * normal.y;
        ctx.lineTo(xc, yc);
        ctx.closePath();
    }

});

DoveTailDiagonalArrow.fromJSON = function (json) {
    var feature = json['feature'];
    var arrow = new maptalks.DoveTailDiagonalArrow(feature['geometry']['coordinates'], json['options']);
    arrow.setProperties(feature['properties']);
    return arrow;
};

maptalks.DrawTool.registerMode('DoveTailDiagonalArrow', {
    'action' : 'clickDblclick',
    'create' : function (path) {
        return new maptalks.DoveTailDiagonalArrow(path);
    },
    'update' : function (path, geometry) {
        geometry.setCoordinates(path);
    },
    'generate' : function (geometry) {
        return geometry;
    }
});
