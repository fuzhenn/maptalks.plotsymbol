import { Coordinate, Util, DrawTool, LineString } from 'maptalks';
import * as Constants from '../Constants';
import InterprolationGeometry from '../InterpolationGeometry';
import { getBisectorNormals, getCubicValue } from '../PlotUtils';

class ClosedCurve extends InterprolationGeometry {
    constructor(coordinates, options = {}) {
        super(coordinates, options);
        this.type = 'ClosedCurve';
        this._offset = 0.3;
        if (coordinates) {
            this.setCoordinates(coordinates);
        }
    }

    /**
     * 获取geom类型
     * @returns {string}
     */
    getPlotType() {
        return this.type;
    }

    /**
     * 处理插值
     * @returns {*}
     * @private
     */
    _generate() {
        const coordinates = this.getCoordinates();
        const count = coordinates.length;
        if (count < 2) {
            return null;
        } else if (count === 2) {
            this.setCoordinates(coordinates);
            return null;
        } else {
            const points = Coordinate.toNumberArrays(coordinates);
            points.push(points[0], points[1]);
            let [normals, pList] = [[], []];
            for (let i = 0; i < points.length - 2; i++) {
                const normalPoints = getBisectorNormals(this._offset, points[i], points[i + 1], points[i + 2]);
                normals = normals.concat(normalPoints);
            }
            const count = normals.length;
            normals = [normals[count - 1]].concat(normals.slice(0, count - 1));
            for (let i = 0; i < points.length - 2; i++) {
                const pnt1 = points[i];
                const pnt2 = points[i + 1];
                pList.push(pnt1);
                for (let t = 0; t <= Constants.FITTING_COUNT; t++) {
                    const pnt = getCubicValue(t / Constants.FITTING_COUNT, pnt1, normals[i * 2], normals[i * 2 + 1], pnt2);
                    pList.push(pnt);
                }
                pList.push(pnt2);
            }
            pList = pList.map(p => {
                return new Coordinate(p);
            });
            return pList;
        }
    }

    _exportGeoJSONGeometry() {
        const coordinates = Coordinate.toNumberArrays([this.getShell()]);
        return {
            'type': 'Polygon',
            'coordinates': coordinates
        };
    }

    _toJSON(options) {
        const opts = Util.extend({}, options);
        const coordinates = this.getCoordinates();
        opts.geometry = false;
        const feature = this.toGeoJSON(opts);
        feature['geometry'] = {
            'type': 'Polygon'
        };
        return {
            'feature': feature,
            'subType': 'ClosedCurve',
            'coordinates': coordinates
        };
    }

    static fromJSON(json) {
        const feature = json['feature'];
        const _closedCurve = new ClosedCurve(json['coordinates'], json['options']);
        _closedCurve.setProperties(feature['properties']);
        return _closedCurve;
    }
}

ClosedCurve.registerJSONType('ClosedCurve');

DrawTool.registerMode('ClosedCurve', {
    action: ['click', 'mousemove', 'dblclick'],
    create(projection, prjPath) {
        const path = prjPath.map(c => projection.unproject(c));
        const line = new LineString(path);
        line._setPrjCoordinates(prjPath);
        return line;
    },
    update(projection, path, geometry) {
        const symbol = geometry.getSymbol();
        let prjCoords;
        if (Array.isArray(path)) {
            prjCoords = path;
        } else {
            prjCoords = geometry._getPrjCoordinates();
            prjCoords.push(path);
        }
        const coordinates = prjCoords.map(c => projection.unproject(c));
        geometry.setCoordinates(coordinates);
        geometry._setPrjCoordinates(prjCoords);

        const layer = geometry.getLayer();
        if (layer) {
            let doublearrow = layer.getGeometryById('closedcurve');
            if (!doublearrow && path.length >= 3) {
                doublearrow = new ClosedCurve([path], {
                    'id': 'closedcurve'
                });
                doublearrow.addTo(layer);
                if (symbol) {
                    doublearrow.setSymbol(symbol);
                }
                geometry.updateSymbol({
                    lineOpacity: 0
                });
            }
            if (doublearrow) {
                doublearrow.setCoordinates(coordinates);
                doublearrow._setPrjCoordinates(path);
                geometry.updateSymbol({
                    lineOpacity: 0
                });
            }
        }
    },
    generate(geometry) {
        const symbol = geometry.getSymbol();
        symbol.lineOpacity = 1;
        return new ClosedCurve(geometry.getCoordinates(), {
            'symbol': symbol
        });
    }
});

export default ClosedCurve;
