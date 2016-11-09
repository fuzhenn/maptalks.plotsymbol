'use strict';

var maptalks = require('maptalks');
var Point = require('point-geometry');

module.exports = {
    /**
     * Get arrow body for given vertexes.
     * @param  {maptalks.Coordinate[]} vertexes    - input vertexes
     * @param  {[type]} lineWidth [description]
     * @return {[type]}           [description]
     */
    getArrowBody: function (vertexes, lineWidth, map) {
        lineWidth /= 2;
        var upPlots = [],
            downPlots = [],
            pair;
        var dx, dy;
        var current, prev, next;
        var normal, currentNormal, nextNormal;
        for (var i = 1, l = vertexes.length; i < l; i++) {
            current = new Point(vertexes[i].x, vertexes[i].y);
            prev = new Point(vertexes[i - 1].x, vertexes[i - 1].y);
            if (i < l - 1) {
                next = new Point(vertexes[i + 1].x, vertexes[i + 1].y);
            } else {
                next = null;
            }
            normal = current.sub(prev)._unit()._perp();
            if (i === 1) {
                pair = this._getPlotPair(vertexes[i - 1], normal, lineWidth, map);
                upPlots.push(pair[0]);
                downPlots.push(pair[1]);
            }
            if (next) {
                nextNormal = next.sub(current)._unit()._perp();
                currentNormal = this._getJoinNormal(normal, nextNormal);
            } else {
                currentNormal = normal;
            }
            pair = this._getPlotPair(vertexes[i], currentNormal, lineWidth, map);
            upPlots.push(pair[0]);
            downPlots.push(pair[1]);
        }
        return [upPlots, downPlots];
    },

    /**
     *                  nextNormal
     *    currentVertex    ↑
     *                .________. nextVertex
     *                |\
     *     normal  ←  | \ joinNormal
     *                |
     *     prevVertex !
     *
     * get join normal between 2 line segments
     * @param  {[type]} normal     [description]
     * @param  {[type]} nextNormal [description]
     * @return {[type]}            [description]
     */
    _getJoinNormal: function (normal, nextNormal) {
        var joinNormal = normal.add(nextNormal)._unit();
        var cosHalfAngle = joinNormal.x * nextNormal.x + joinNormal.y * nextNormal.y;
        var miterLength = 1 / cosHalfAngle;
        return joinNormal._mult(miterLength);
    },

    _getPlotPair: function (vertex, normal, lineWidth, map) {
        // first plot pair
        var dx = normal.x * lineWidth;
        var dy = normal.y * lineWidth;
        var p1 = vertex.add(dx, dy);
        var p2 = vertex.add(-dx, -dy);
        return [p1, p2];
    }
};
