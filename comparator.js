// Alexander Marshall
// This product uses the TMDb API but is not endorsed or certified by TMDb

const key = '21877a036744cc8b7672730e01a931dc';

$('#f1, #f2').keypress((e) => {
    if(e.which == 13) {
        $('#go').click();
    }
})

$('#go').click(function search() {
    var query1 = $('#f1').val();
    var query2 = $('#f2').val();        
    $('#results').empty();

    $('#s1, #s2').find('option').remove();
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
            if(xhr.results.length == 0) {
                $('#nofranchise').html(`No result for '${query1}'`).show();
            } else {
                $('#nofranchise').hide();
            }
            var id1 = xhr.results[0].id;
            
            for(i in xhr.results) {
                $('#s1').append(`<option value="${xhr.results[i].id}">${xhr.results[i].name}</option>`);
            }

            $.ajax({
                url: 'https://api.themoviedb.org/3/search/collection',
                data: {
                    api_key: key,
                    query: query2+' collection'
                },
                success: function(xhr) {
                    if(xhr.results.length == 0) {
                        $('#nofranchise').html(`No result for '${query2}'`).show();
                    } else {
                        $('#nofranchise').hide();
                    }
                    var id2 = xhr.results[0].id;

                    for(j in xhr.results) {
                        $('#s2').append(`<option value="${xhr.results[j].id}">${xhr.results[j].name}</option>`);
                    }
                    getMovieIDs(id1, id2);
                    $('h3').show();
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
                    temp.push({
                        name: xhr.cast[j].name, 
                        role: xhr.cast[j].character, 
                        img: xhr.cast[j].profile_path
                    });
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
                            img = actors[0][i][k].img != null ? actors[0][i][k].img : '/bA6lE0fU7Dza4BkNkmze4rFVqbg.jpg',
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
                            commonActors.set(name, [img, role1, role2]);
                        }
                    }
                }
            }
        }
    }


    if(commonActors.size == 0) {
        $('#noresult').show();
    } else {
        $('#noresult').hide();
        printCommonActors(commonActors);
    }
}

function printCommonActors(actors) {
    var txt = '';
    actors.forEach((value, key) => {
        txt = txt.concat(`<div class="actor"> <div class="img">`);
        
        if(value[0]) {
            txt = txt.concat(`<img class="prof" src="https://image.tmdb.org/t/p/original${value[0]}">`);
        } else {
            txt = txt.concat(`<img class="prof" src="https://www.palmkvistmaleri.se/wp-content/uploads/2018/02/default.jpg">`);
        }
        txt = txt.concat(`</div> <p class="name">${key}</p><br>`);
        for(var i = 1; i < value.length; i++) {
            txt = txt.concat(`<p class="role">${value[i].role} in ${value[i].title}</p><br>`);
        };
        txt = txt.concat('</div><hr>');
    });

    $('#results').html(txt);
}

$('#s1, #s2').change(() => {
    $('#results').empty();
    getMovieIDs($('#s1').val(), $('#s2').val());
})