var express = require('express');
var app = express();
var fs = require('fs');

app.configure(function () {
    app.use(express.urlencoded())
    app.use(express.json())
    app.use(express.static(__dirname));
});

app.post("/playerScore", function (response, request) {
    var data;

    if (response.body.name == "") {
        response.body.name = "Unnamed";
    }

    data = "\n<div class='player-score'> Name:" + response.body.name + "; " + "Score:" + response.body.score + "; " + "Level:" + response.body.level + ";</div>";
    fs.appendFile('scores.txt', data, function (err) {
        if (err) throw err;
        console.log('The "data to append" was appended to file!');
    });

});

app.get("/showScore", function (responce, request) {
    fs.readFile('scores.txt', 'utf-8', function (err, data) {
        if (err) throw err;
        request.send(data);
    });


});

app.listen(3000);