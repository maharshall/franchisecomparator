const imdb = require('imdb-scrapper');

let search1 = imdb.simpleSearch(process.argv[2]);
let search2 = imdb.simpleSearch(process.argv[3]);

Promise.all([search1, search2]).then((result) => {
    var franchise1 = result[0].d;
    var franchise2 = result[1].d;

    var actors1 = getActors(franchise1);
    var actors2 = getActors(franchise2);

    console.log(actors1);
});

function fetchCastData(id) {
    return new Promise(function (resolve, reject) {
        resolve(imdb.getCast(id));
    });
};

function getActors(franchise) {
    for(let i = 0; i < franchise.length; i++) {
        fetchCastData(franchise[i].id).then((result) => {
            return printResults(result);
        })
    }
}

function printResults(data) {
    var actors = [];
    for(i in data.cast) {
        // console.log(`\t${data.cast[i].role} - ${data.cast[i].name}`)
        actors.push(data.cast[i].name);
    }

    return actors;
}