const gulp = require('gulp'),
    pkg = require('./package.json'),
    BundleHelper = require('maptalks-build-helpers').BundleHelper,
    TestHelper = require('maptalks-build-helpers').TestHelper;
const bundleHelper = new BundleHelper(pkg);
const testHelper = new TestHelper();
const karmaConfig = require('./karma.config');

gulp.task('build', done => {
    bundleHelper.bundle('index.js');
    done();
});

gulp.task('minify', gulp.series(['build'], done => {
    bundleHelper.minify();
    done();
}));

gulp.task('watch', gulp.series(['build'], () => {
    gulp.watch(['index.js', 'src/**/*', './gulpfile.js'], gulp.series(['build']));
}));

gulp.task('test', gulp.series(['build'], done => {
    testHelper.test(karmaConfig);
    done();
}));

gulp.task('tdd', gulp.series(['build'], () => {
    karmaConfig.singleRun = false;
    gulp.watch(['index.js', 'src/**/*'], gulp.series(['test']));
    testHelper.test(karmaConfig);
}));

gulp.task('default', gulp.series(['watch']));

