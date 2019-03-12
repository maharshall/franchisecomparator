const imdb = require('imdb-scrapper');

let search1 = imdb.simpleSearch(process.argv[2]);
let search2 = imdb.simpleSearch(process.argv[3]);

Promise.all([search1, search2]).then((result) => {
    var franchises = [result[0].d, result[1].d];

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

    compareActors(actors);
}

function compareActors(actors) {
    var commonActors = new Map();

    for(i in actors[0]) {
        for(j in actors[1]) {
            for(k in actors[0][i].cast) {
                for(l in actors[1][j].cast) {
                    if(actors[0][i].cast[k].name === actors[1][j].cast[l].name) {
                        var name = actors[0][i].cast[k].name,
                            role1 = {title: actors[0][i].title, role: actors[0][i].cast[k].role},
                            role2 = {title: actors[1][j].title, role: actors[1][j].cast[l].role};
                                                
                        if(commonActors.has(name)) {
                            if(!commonActors.get(name).some(({title}) => title == role1.title)) {
                                commonActors.get(name).push(role1);
                            }
                            
                            if(!commonActors.get(name).some(({title}) => title == role2.title)) {
                                commonActors.get(name).push(role2);
                            }
                        } else {
                            commonActors.set(name, [role1, role2]);
                        }
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
    actors.forEach((value, key) => {
        console.log(`${key}:`);
        value.forEach((entry) => {
            console.log(`  ${entry.role} -> ${entry.title}`);
        });
        console.log('');
    });
}

function fetchCastData(id) {
    return new Promise(function (resolve, reject) {
        resolve(imdb.getCast(id));
    });
};
