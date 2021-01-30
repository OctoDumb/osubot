const 
    gulp         = require('gulp'),
    sass         = require('gulp-sass');

let modules = [
    'user',
    'beatmapset',
    'beatmap',
    'top',
    'recent',
]

exports.default = () => {
    modules.forEach(m => {
        const styleTask = () => {
            return gulp.src(`./CardsFrontend/cards/${m}/styles/index.scss`)
            .pipe(sass())
            .pipe(gulp.dest(`./CardsFrontend/cards/${m}/` ))
        };

        styleTask();
        
        gulp.watch(`./CardsFrontend/cards/${m}/styles/*.scss`, gulp.parallel(styleTask));
        gulp.watch(`./CardsFrontend/cards/${m}/*.html`);
    })
};