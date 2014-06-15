var scoreButton = document.getElementsByClassName("score")[0];
var aboutButton = document.getElementsByClassName("about")[0];

scoreButton.addEventListener('click', function () {
    $.ajax({
        type: "GET",
        url: "/showScore",
        success: function (data) {
            console.log(data);
            $("#score-modal").children().remove();
            $("#score-modal").dialog({
                height: 300,
                width: 700,
                modal: true,
                title: "Player score"
            }).append(data);

        }
    });
}, false);

aboutButton.addEventListener('click', function () {
    $("#about-modal").dialog({
        height: 300,
        width: 700,
        modal: true,
        title: "About"
    });
}, false);

