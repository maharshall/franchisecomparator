// Alexander Marshall
// This product uses the TMDb API but is not endorsed or certified by TMDb

const key = 'redacted';

$('#f1, #f2').keypress((e) => {
    if(e.which == 13) {
        $('#go').click();
    }
})

$('#go').click(function search() {
    var query1 = $('#f1').val();
    var query2 = $('#f2').val();

    getCollectionIDs(query1, query2);
})

function getCollectionIDs(query1, query2) {
    $.ajax({
        url: 'https://api.themoviedb.org/3/search/collection',
        data: {
            api_key: key,
            query: query1+' collection'
        },
        success: function(xhr) {
            var id1 = xhr.results[0].id;

            $.ajax({
                url: 'https://api.themoviedb.org/3/search/collection',
                data: {
                    api_key: key,
                    query: query2+' collection'
                },
                success: function(xhr) {
                    var id2 = xhr.results[0].id;
                    getMovieIDs(id1, id2);
                }
            })
        }
    })
}

function getMovieIDs(collection1, collection2) {
    var c1_ids = [],
        c2_ids = [];
    $.ajax({
        url: 'https://api.themoviedb.org/3/collection/'+collection1,
        data: {
            api_key: key,
        },
        success: function(xhr) {
            for(i in xhr.parts) {
                c1_ids.push({
                    title: xhr.parts[i].title,
                    id: xhr.parts[i].id
                });
            }

            $.ajax({
                url: 'https://api.themoviedb.org/3/collection/'+collection2,
                data: {
                    api_key: key,
                },
                success: function(xhr) {
                    for(i in xhr.parts) {
                        c2_ids.push({
                            title: xhr.parts[i].title,
                            id: xhr.parts[i].id
                        });
                    }
                    
                    getCast(c1_ids, c2_ids);
                }
            })
        }
    })
}

function getCast(c1_ids, c2_ids) {
    var entries = [[], []],
        promises = [[], []];

    for(let i = 1; i < c1_ids.length; i++) {
        promises[0].push(getCastAjax(c1_ids[i].id));
        entries[0].push(c1_ids[i].title);
    }

    for(let i = 1; i < c2_ids.length; i++) {
        promises[1].push(getCastAjax(c2_ids[i].id));
        entries[1].push(c2_ids[i].title);
    }

    Promise.all(promises.map(Promise.all.bind(Promise))).then(result => {
        compareCasts(entries, result);
    })    
}

function getCastAjax(id) {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: 'https://api.themoviedb.org/3/movie/'+id+'/credits',
            data: {
                api_key: key
            },
            success: function(xhr) {
                var temp = [];
            
                for(j in xhr.cast) {
                    temp.push({name: xhr.cast[j].name, role: xhr.cast[j].character});
                }

                resolve(temp);
            }
        })
    })
}

function compareCasts(entries, actors) {
    var commonActors = new Map();

    for(i in actors[0]) {
        for(j in actors[1]) {
            for(k in actors[0][i]) {
                for(l in actors[1][j]) {
                    if(actors[0][i][k].name === actors[1][j][l].name) {
                        var name = actors[0][i][k].name,
                            role1 = {title: entries[0][i], role: actors[0][i][k].role},
                            role2 = {title: entries[1][j], role: actors[1][j][l].role};
                                                
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
}

function printCommonActors(actors) {
    var txt = '';
    actors.forEach((value, key) => {
        txt = txt.concat(`${key}:<br>`);
        value.forEach((entry) => {
            txt = txt.concat(`-${entry.role} in ${entry.title}<br>`);
        });
        txt = txt.concat('<hr>');
    });

    $('#results').html(txt);
}