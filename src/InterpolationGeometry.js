import * as maptalks from 'maptalks';

class InterpolationGeometry extends maptalks.Curve {

    startEdit(options = {}) {
        options.newVertexHandleSymbol = {
            'markerType': 'ellipse',
            'markerFill': '#fff',
            'markerLineColor': '#000',
            'markerLineWidth': 2,
            'markerWidth': 10,
            'markerHeight': 10,
            'opacity': 0
        };
        return super.startEdit(options);
    }

    _getPaintParams() {
        const map = this.getMap();
        const zoomScale = map.getGLScale();
        const coordinates = this._generate();
        if (!coordinates) {
            return null;
        }
        const projection = this._getProjection();
        if (!projection) {
            return null;
        }
        this._verifyProjection();
        const prjCoords = this._projectCoords(coordinates);
        let points = this._getPath2DPoints(prjCoords);
        points = points.map(p => p.multi(zoomScale));
        return [points, []];
    }

    _paintOn(ctx, points, segs, lineOpacity, fillOpacity) {
        if (points.length <= 0) {
            return;
        }
        ctx.strokeStyle = this.getSymbol()['lineColor'] || '#f00';
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length; i++) {
            ctx.lineTo(points[i].x, points[i].y);
        }
        ctx.closePath();
        maptalks.Canvas._stroke(ctx, lineOpacity);
        maptalks.Canvas.fillCanvas(ctx, fillOpacity, points[0].x, points[0].y);
    }
}

export default InterpolationGeometry;
