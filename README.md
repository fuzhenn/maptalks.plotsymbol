# maptalks.plotsymbol

[![CircleCI](https://circleci.com/gh/fuzhenn/maptalks.plotsymbol.svg?style=svg)](https://circleci.com/gh/fuzhenn/maptalks.plotsymbol)

A maptalks plugin to support plot symbols, e.g.  DoubleArrow, ClosedCurve, Sector, DiagonalArrow, StraightArrow, etc.

## Examples

* A demo of [maptlaks.plotsymbol](https://fuzhenn.github.io/maptalks.plotsymbol/demo/).

## Install
  
* Install with npm: ```npm install maptalks.plotsymbol```. 
* Download from [dist directory](https://github.com/maptalks/maptalks.plotsymbol/tree/gh-pages/dist).
* Use unpkg CDN: ```https://unpkg.com/maptalks.plotsymbol/dist/maptalks.plotsymbol.min.js```

## Usage

As a plugin, ```maptalks.plotsymbol``` must be loaded after ```maptalks.js``` in browsers.

### Vanilla Javascript
```html
<script type="text/javascript" src="https://unpkg.com/maptalks/dist/maptalks.min.js"></script>
<script type="text/javascript" src="https://unpkg.com/maptalks.plotsymbol/dist/maptalks.plotsymbol.min.js"></script>
<script>
    var drawTool = new maptalks.DrawTool({
        mode: 'DoubleArrow',
        symbol : {
            'lineColor' : '#e84',
            'polygonFill' : '#f00',
            'polygonOpacity' : 0.5,
        }
    }).addTo(map).disable();
    drawTool.on('drawend', function (param) {
        //Add geometry to a VectorLayer
    });
</script>
```

### ES6

```javascript
    //You just need to import it, and then you can draw geometries by a drawtool.
    import plotsymbol from 'maptalks.plotsymbol';
    const drawTool = new maptalks.DrawTool({
        mode: 'Point',
        symbol : {
            'lineColor' : '#e84',
            'polygonFill' : '#f00',
            'polygonOpacity' : 0.5,
        }
    }).addTo(map).disable();
    //You can set many modes like DoubleArrow, ClosedCurve, Sector, DiagonalArrow, StraightArrow and so on.
    drawTool.setMode('DoubleArrow');
    drawTool.on('drawend', function (param) {
        //Add geometry to a VectorLayer
    });

```

## Supported Browsers

IE 9-11, Chrome, Firefox, other modern and mobile browsers.

## Contributing

We welcome any kind of contributions including issue reportings, pull requests, documentation corrections, feature requests and any other helps.

## Develop

The ```index.js``` export all support geometries, like DoubleArrow, ClosedCurve, DiagonalArrow, etc.

It is written in ES6, transpiled by [babel](https://babeljs.io/) and tested with [mocha](https://mochajs.org) and [expect.js](https://github.com/Automattic/expect.js).

### Scripts

* Install dependencies
```shell
$ npm install
```

* Watch source changes and generate runnable bundle repeatedly
```shell
$ gulp watch
```

* Tests
```shell
$ npm test
```

* Watch source changes and run tests repeatedly
```shell
$ gulp tdd
```

* Package and generate minified bundles to dist directory
```shell
$ gulp minify
```

* Lint
```shell
$ npm run lint
```
