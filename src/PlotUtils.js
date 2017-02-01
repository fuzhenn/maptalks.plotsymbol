import * as maptalks from 'maptalks';
import Point from 'point-geometry';

export default {
    /**
     * Get arrow body for given vertexes.
     * @param  {maptalks.Coordinate[]} vertexes    - input vertexes
     * @param  {[type]} lineWidth [description]
     * @param  {[type]} map       [description]
     * @param  {[type]} ratio     [description]
     * @return {[type]}           [description]
     */
    getArrowBody(vertexes, lineWidth, map, ratio, arrowLength) {
        lineWidth /= 2;
        var arrowWidth;
        var currentLen = 0;
        const upPlots = [],
            downPlots = [];
        var pair;
        var dx, dy;
        var current, prev, next;
        var normal, currentNormal, nextNormal;
        for (let i = 1, l = vertexes.length; i < l; i++) {
            current = new Point(vertexes[i].x, vertexes[i].y);
            prev = new Point(vertexes[i - 1].x, vertexes[i - 1].y);
            if (ratio && arrowLength) {
                currentLen += current.dist(prev);
                arrowWidth = (1 - (1 - ratio) * currentLen / arrowLength) * lineWidth;
            } else {
                arrowWidth = lineWidth;
            }

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
            pair = this._getPlotPair(vertexes[i], currentNormal, arrowWidth, map);
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
    _getJoinNormal(normal, nextNormal) {
        const joinNormal = normal.add(nextNormal)._unit();
        const cosHalfAngle = joinNormal.x * nextNormal.x + joinNormal.y * nextNormal.y;
        const miterLength = 1 / cosHalfAngle;
        return joinNormal._mult(miterLength);
    },

    _getPlotPair(vertex, normal, lineWidth, map) {
        // first plot pair
        const dx = normal.x * lineWidth;
        const dy = normal.y * lineWidth;
        const p1 = vertex.add(dx, dy);
        const p2 = vertex.add(-dx, -dy);
        return [p1, p2];
    }
}
