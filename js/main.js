var extracted_data;
var relation_data

$(document).ready(function() {
    d3.json("data/relation2id.json").then(function(data){
            relation_data = data;
            d3.json("data/extracted.json")
            .then(function(data) {
                extracted_data = data;
                initializePage();
            });
        });

});

// initialize full webpage
// remove all svg and set all checkbox to unchecked
initializePage = function() {
    var senSta = {};
    for(pair in extracted_data){
        var sentences = extracted_data[pair]['o'];
        for(senInd in sentences){
            var senStr = sentences[senInd].reduce(function(str, word){
                return str + word;
            }, '');
            if(senStr in senSta){
                senSta[senStr]+=1;
            }else{
                senSta[senStr]=1;
            }
        }
    }
    var senArr = []
    for (sen in senSta){
        senArr.push([sen, senSta[sen]]);
    }
    senArr.sort(function(a, b){
        return b[1] - a[1];
    })
    console.log(senArr);
    initialGraph();
    initializeEntityFilter();
};


