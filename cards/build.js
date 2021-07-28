var sass = require('sass'),
    fs   = require('fs'),
    glob = require('glob')

function buildCard(card) {
    return new Promise((r,j) => {
        sass.render({ 
            file: `./src/${card}/index.scss`
        }, (err, result) => {
            if(err) return j(err);
            fs.writeFile(`./dist/${card}/index.css`, result.css, r)
        })
    });
}

if(fs.existsSync("./dist")) {
    fs.rmdirSync("./dist", { recursive: true });
    console.log("Cleared dist folder");
} else {
    console.log("No dist folder. Creating it...");
}

fs.mkdirSync("./dist");

let cards = fs.readdirSync("./src");

console.log(`Building ${cards.length} cards`);

(async() => {
    let total = 0;
    for(let card of cards) {
        console.log(`Building ${card}...`);
        try {
            fs.mkdirSync(`./dist/${card}`);
            fs.copyFileSync(`./src/${card}/index.html`, `./dist/${card}/index.html`);
            await buildCard(card);
            console.log("Build done!");
            total++;
        } catch(e) {
            console.log("Build failed!");
            console.log(e);
        }
    }

    console.log(`Successfully built ${total == cards.length ? "all" : `${total}/${cards.length}`} cards!`);

    return;
})();