import { Coordinate, Util, DrawTool } from 'maptalks';
import * as Constants from '../Constants';
import InterpolationGeometry from '../InterpolationGeometry';
import { getBisectorNormals, getCubicValue, Mid, MathDistance, getThirdPoint } from '../PlotUtils';

class GatheringPlace extends InterpolationGeometry {
    constructor(coordinates, options = {}) {
        super(coordinates, options);
        this.type = 'GatheringPlace';
        this._offset = 0.4;
        if (coordinates) {
            this.setCoordinates(coordinates);
        }
    }


    getPlotType() {
        return this.type;
    }

    _generate() {
        const coordinates = this.getCoordinates();
        let count = coordinates.length;
        let _points = Coordinate.toNumberArrays(coordinates)
        if (count < 2) return
        if (count === 2) {
            let mid = Mid(_points[0], _points[1])
            const distance = MathDistance(_points[0], mid) / 0.9
            let pnt = getThirdPoint(_points[0], mid, Constants.HALF_PI, distance, true)
            _points = [_points[0], pnt, _points[1]]
        }
        let mid = Mid(_points[0], _points[2])
        _points.push(mid, _points[0], _points[1])
        let [normals, pnt1, pnt2, pnt3, pList] = [[], undefined, undefined, undefined, []]
        for (let i = 0; i < _points.length - 2; i++) {
            pnt1 = _points[i]
            pnt2 = _points[i + 1]
            pnt3 = _points[i + 2]
            let normalPoints = getBisectorNormals(this._offset, pnt1, pnt2, pnt3)
            normals = normals.concat(normalPoints)
        }
        count = normals.length
        normals = [normals[count - 1]].concat(normals.slice(0, count - 1))
        for (let i = 0; i < _points.length - 2; i++) {
            pnt1 = _points[i]
            pnt2 = _points[i + 1]
            pList.push(pnt1)
            for (let t = 0; t <= Constants.FITTING_COUNT; t++) {
                let pnt = getCubicValue(t / Constants.FITTING_COUNT, pnt1, normals[i * 2], normals[i * 2 + 1], pnt2)
                pList.push(pnt)
            }
            pList.push(pnt2)
        }

        pList = pList.map(p => {
            return new Coordinate(p);
        });
        return pList;
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
            'subType': 'GatheringPlace',
            'coordinates': coordinates
        };
    }

    static fromJSON(json) {
        const feature = json['feature'];
        const _atheringPlace = new GatheringPlace(json['coordinates'], json['options']);
        _atheringPlace.setProperties(feature['properties']);
        return _atheringPlace;
    }
}

GatheringPlace.registerJSONType('GatheringPlace');

DrawTool.registerMode('GatheringPlace', {
    action: ['click', 'mousemove', 'dblclick'],
    create(projection, prjPath) {
        const path = prjPath.map(c => projection.unproject(c));
        const line = new GatheringPlace(path);
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
            let doublearrow = layer.getGeometryById('gatheringplace');
            if (!doublearrow && path.length >= 3) {
                doublearrow = new GatheringPlace([path], {
                    'id': 'gatheringplace'
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
        return new GatheringPlace(geometry.getCoordinates(), {
            'symbol': symbol
        });
    }
});



export default GatheringPlace;
