var { watch, series, parallel, src, dest, task } = require('gulp'),
    sass = require('gulp-sass')(require('sass')),
    fs = require('fs-extra');

task('clear', function(cb) {
    if(fs.existsSync('./dist'))
        fs.removeSync('./dist');
    fs.mkdirSync('./dist');
    cb();
});

exports.default = series(
    'clear',
    parallel(
        parallel(
            fs.readdirSync('./src')
                .map(d => (cb => {
                    fs.mkdirSync(`./dist/${d}`);
                    fs.copyFile(`./src/${d}/index.html`, `./dist/${d}/index.html`, cb)
                }))
        ),
        (cb) => fs.copy('./icons', './dist/icons', cb)
    ),
    () => src(`./src/**/*.scss`)
        .pipe(sass.sync())
        .pipe(dest(`./dist`)),
);

exports.watch = function() {
    watch(["./src/**/*", "./styles/*"], exports.default);
}