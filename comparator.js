const imdb = require('imdb-scrapper');

let search1 = imdb.simpleSearch(process.argv[2]);
let search2 = imdb.simpleSearch(process.argv[3]);

Promise.all([search1, search2]).then((result) => {
    var franchises = [result[0].d, result[1].d];

    // console.log(`comparing ${result[0].d.length} ${result[0].q} entries against ${result[1].d.length} ${result[1].q} entries`)

    var promises = [[], []];
    var entries = [[], []];

    for(i in franchises) {
        for(j in franchises[i]) {
            promises[i].push(fetchCastData(franchises[i][j].id));
            entries[i].push(franchises[i][j].l);
        }
    }

    Promise.all(promises.map(Promise.all.bind(Promise))).then(result => {
        getActors(result, entries);
    })
});

function getActors(cast, entries) {
    var actors = [[], []];
    
    for(i in cast) {
        for(j in cast[i]) {

            var temp = [];
            for(k in cast[i][j].cast) {
                if(actors[i].indexOf(cast[i][j].cast[k]) === -1) {
                    temp.push(cast[i][j].cast[k]);
                }
            }

            actors[i].push({
                title: entries[i][j],
                cast: temp
            });
        }
    }

    // console.log(actors);
    compareActors(actors);
}

function compareActors(actors) {
    var commonActors = [];

    for(i in actors[0]) {
        for(j in actors[1]) {
            for(k in actors[0][i].cast) {
                for(l in actors[1][j].cast) {
                    if(actors[0][i].cast[k].name === actors[1][j].cast[l].name) {
                        commonActors.push({
                            name: actors[0][i].cast[k].name,
                            title1: actors[0][i].title,
                            role1: actors[0][i].cast[k].role,
                            title2: actors[1][j].title,
                            role2: actors[1][j].cast[l].role
                        })
                    }
                }
            }
        }
    }
    
    if(commonActors.length == 0) {
        console.log('No matching actors found!');
    } else {
        printCommonActors(commonActors);
    }
    process.exit(-1);
}

function printCommonActors(actors) {
    for(i in actors) {
        console.log(`${actors[i].name}:
        ${actors[i].role1} in ${actors[i].title1} 
        ${actors[i].role2} in ${actors[i].title2}\n`);
    }
}

function fetchCastData(id) {
    return new Promise(function (resolve, reject) {
        resolve(imdb.getCast(id));
    });
};
