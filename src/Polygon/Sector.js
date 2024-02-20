import { Coordinate, Util, DrawTool, LineString } from 'maptalks';
import InterprolationGeometry from '../InterpolationGeometry';
import { getSectorPoints, pointDistance, getAzimuth } from '../PlotUtils';

class Sector extends InterprolationGeometry {
    constructor(coordinates, options = {}) {
        super(coordinates, options);
        this.type = 'PlotSector';
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
     * handle coordinates
     * @private
     */
    _generate() {
        let points = [];
        const coordinates = this.getCoordinates();
        const count = coordinates.length;
        const _points = Coordinate.toNumberArrays(coordinates);
        if (count <= 2) {
            this.setCoordinates(_points);
            return null;
        } else if (count === 3) {
            const [center, pnt2, pnt3] = [_points[0], _points[1], _points[2]];
            const measurer = this._getMeasurer();
            const radius = pointDistance(measurer, pnt2, center);
            const startAngle = getAzimuth(pnt2, center);
            const endAngle = getAzimuth(pnt3, center);
            const pList = getSectorPoints(measurer, center, radius, startAngle, endAngle);
            pList.push(center, pList[0]);
            points = pList.map(p => {
                return new Coordinate(p);
            });
        } else if (count > 3) {
            // this._drawTool.endDraw();
        }
        return points;
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
            'subType': 'PlotSector',
            'coordinates': coordinates
        };
    }

    static fromJSON(json) {
        const feature = json['feature'];
        const _geometry = new Sector(json['coordinates'], json['options']);
        _geometry.setProperties(feature['properties']);
        return _geometry;
    }
}

Sector.registerJSONType('PlotSector');

DrawTool.registerMode('PlotSector', {
    action: ['click', 'mousemove', 'dblclick'],
    create(projection, prjPath) {
        const path = prjPath.map(c => projection.unproject(c));
        const line = new LineString(path);
        line._setPrjCoordinates(prjPath);
        return line;
    },
    update(projection, path, geometry, e) {
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
            const map = layer.getMap();
            let sector = layer.getGeometryById('sector');
            if (!sector && path.length >= 3) {
                sector = new Sector(path, {
                    'id': 'sector'
                });
                sector._drawTool = e.drawTool || map['_map_tool'];
                sector.addTo(layer);
                const pSymbol = Util.extendSymbol(symbol, {
                });
                if (pSymbol) {
                    sector.setSymbol(pSymbol);
                }
                geometry.updateSymbol({
                    lineOpacity: 0
                });
            }
            if (sector) {
                sector.setCoordinates(coordinates);
                sector._setPrjCoordinates(prjCoords);
                geometry.updateSymbol({
                    lineOpacity: 0
                });
            }
        }
    },
    generate(geometry) {
        const symbol = geometry.getSymbol();
        symbol.lineOpacity = 1;
        let coordinates = geometry.getCoordinates();
        if (coordinates.length > 3) {
            coordinates = coordinates.slice(0, 3);
        }
        return new Sector(coordinates, {
            'symbol': symbol
        });
    }
});

export default Sector;
