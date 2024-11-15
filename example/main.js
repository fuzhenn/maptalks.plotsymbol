import './style.css'
import * as maptalks from 'maptalks'
import * as plotsymbol from '../';

var map = new maptalks.Map('map', {
    center: [-0.113049, 51.498568],
    zoom: 14,
    baseLayer: new maptalks.TileLayer('base', {
        urlTemplate: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',
        subdomains: ['a', 'b', 'c', 'd'],
    })
});

var drawTool = new maptalks.DrawTool({
    mode: 'DoubleArrow',
    symbol: {
        'lineColor': '#e84',
        'polygonFill': '#f00',
        'polygonOpacity': 0.5,
    }
}).addTo(map);

drawTool.on('drawend', function (param) {
    //Add geometry to a VectorLayer
});
