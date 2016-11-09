'use strict';

var maptalks = require('maptalks');
var Point = require('point-geometry');
var PlotUtils = require('./PlotUtils');

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
 *         curveType : 1,
 *         arcDegree : 120,
 *         symbol : {
 *             'lineWidth' : 5
 *         }
 *     }
 * ).addTo(layer);
 */
var StraightArrow = module.exports = maptalks.CurveLine.extend(/** @lends maptalks.StraightArrow.prototype */{
    /**
     * @property {Object} options
     */
    options:{
        'widthRatio' : 0.2,
        'arrowStyle' : []
    },

    _toJSON:function (options) {
        return {
            'feature' : this.toGeoJSON(options),
            'subType' : 'StraightArrow'
        };
    },

    _getPaintParams: function () {
        var points = this._getPath2DPoints(this._getPrjCoordinates());

        var length = this._get2DLength();
        var lineWidth = length * this.options['widthRatio'];

        var arrowPairs = PlotUtils.getArrowBody(points, lineWidth, this.getMap());
        var h1 = arrowPairs[0][arrowPairs[0].length - 1],
            h2 = arrowPairs[1][arrowPairs[1].length - 1];
        var arrowHead = this._getArrowHead(h1, h2, points[points.length - 1], lineWidth);
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
    },

    _paintOn: function (ctx, points, segs, lineOpacity, fillOpacity, lineDasharray) {
        ctx.beginPath();
        var l = segs[0];
        var seg;
        var i = 0;
        ctx.moveTo(points[0].x, points[0].y);
        seg = points.slice(0, segs[0]);
        this._quadraticCurve(ctx, seg);
        i += segs[0];
        maptalks.Canvas._path(ctx, points.slice(i, i + segs[1]), lineDasharray, lineOpacity);
        i += segs[1];
        ctx.lineTo(points[i].x, points[i].y);
        seg = points.slice(i, i + segs[2]);
        this._quadraticCurve(ctx, seg);
        ctx.closePath();
        maptalks.Canvas._stroke(ctx, lineOpacity);
        maptalks.Canvas.fillCanvas(ctx, fillOpacity, points[0].x, points[0].y);
    },

    /**
     * Get points of arrow head
     * @param  {maptalks.Coordinate} h1   - head point 1
     * @param  {maptalks.Coordinate} h2   - head point 2
     * @param  {maptalks.Coordinate} vertex - head vertex
     * @param  {Number} lineWidth         - line width
     * @return {maptalks.Coordinate[]}
     */
    _getArrowHead: function (h1, h2, vertex, lineWidth) {
        h1 = new Point(h1.x, h1.y);
        h2 = new Point(h2.x, h2.y);
        var normal = h1.sub(h2)._unit();
        var head0 = vertex.add(lineWidth * normal.x, lineWidth * normal.y);
        var head2 = vertex.add(lineWidth * -normal.x, lineWidth * -normal.y);
        normal._perp()._mult(-1);
        var head1 = vertex.add(lineWidth * normal.x, lineWidth * normal.y);
        return [head0, head1, head2]
    }

});

StraightArrow.fromJSON = function (json) {
    var feature = json['feature'];
    var StraightArrow = new Z.StraightArrow(feature['geometry']['coordinates'], json['options']);
    StraightArrow.setProperties(feature['properties']);
    return StraightArrow;
};

