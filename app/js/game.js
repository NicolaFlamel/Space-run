// Game field  variables
var fieldWidth = 550, fieldHeight = 200;
var road;

//Scene variables
var renderer, scene, camera, pointLight, spotLight, i, x;

//Player variables
var playerDirY = 0, playerSpeed = 5;
var enemySpeed = 2;
var canTouch = true;
var player, playerSphere;

//Enemy variables
var enemyObject;

var enemies = [];


var animating = true;


var max = fieldWidth / 4,
    min = -fieldWidth / 4;

var playerScore = 0;
var playerLife = 3;
var playerLevel = 0;

var show = true;

var pointOfView;

var radius = 400;
var currentAngle = 0;

//setup() create scene and render objects
function setup() {
    createScene();
    draw();
    $("#menu").css({
        display: "none"
    })
    $("#score-board").css({
        display: "block"
    })
}

function createScene() {
    var windowWidth = $("body").width(),
        windowHeight = $("body").height();
    // Scene size
    var SCENE_WIDTH = windowWidth,
        SCENE_HEIGHT = 500;

    // Camera attributes
    var SCENE_VIEW_ANGLE = 50,
        SCENE_ASPECT = SCENE_WIDTH / SCENE_HEIGHT,
        SCENE_NEAR = 0.1,
        SCENE_FAR = 10000;

    var canvas = document.getElementById("gameCanvas");
    // Create a WebGL renderer, camera and add scene
    renderer = new THREE.WebGLRenderer();
    camera =
        new THREE.PerspectiveCamera(
            SCENE_VIEW_ANGLE,
            SCENE_ASPECT,
            SCENE_NEAR,
            SCENE_FAR
        );

    scene = new THREE.Scene();

    // Add the camera to the scene
    scene.add(camera);

    // Set a default position for the camera
    camera.position.z = 320;

    // start the renderer
    renderer.setSize(SCENE_WIDTH, SCENE_HEIGHT);

    // Appended DOM element
    canvas.appendChild(renderer.domElement);

    // Create the player's material
    var playerMaterial =
        new THREE.MeshLambertMaterial(
            {
                map: THREE.ImageUtils.loadTexture('images/metal.jpg'),
                color: 0x1232CA
            });

    // Create the road space material
    var roadSpace =
        new THREE.MeshLambertMaterial(
            {
                map: new THREE.ImageUtils.loadTexture("images/space-cloud.jpg")
            });

    // Create the ground's material
    var groundMaterial =
        new THREE.MeshLambertMaterial(
            {
                map: new THREE.ImageUtils.loadTexture("images/space-cloud.jpg")
            });

    road = new THREE.Mesh(
        new THREE.PlaneGeometry(
            fieldWidth * 5,
            fieldHeight * 1.03,
            100,
            10,
            10,
            1),
        roadSpace
    );
    road.position.z = -51;
    scene.add(road);
    road.receiveShadow = true;

    // // set up the player vars
    playerWidth = 20;
    playerHeight = 20;
    playerDepth = 10;
    playerQuality = 10;

    player = new THREE.Mesh(
        new THREE.CylinderGeometry(
            playerWidth * 0.7,
            playerWidth * 0.7,
            playerDepth / 2,
            playerQuality * 2
            ),
        playerMaterial
    );

    scene.add(player);
    player.receiveShadow = true;
    player.castShadow = true;
    // Set player side of the road
    player.position.x = -fieldWidth / 2 + playerWidth;

    player.position.z = playerDepth;

    playerSphere = new THREE.Mesh(
        new THREE.SphereGeometry(
            playerWidth * 0.5,
            20,
            3
        ),
        playerMaterial
    );

    scene.add(playerSphere);
    playerSphere.position.x = player.position.x;
    playerSphere.position.z = playerDepth;
    playerSphere.rotation.x = 99;

    //Create the enemies
    for (var i = 0; i < 15; i++) {
        enemyObject = new THREE.Mesh(new THREE.SphereGeometry(
            playerWidth / 2,          //Create random surface
            Math.random() * (10) + 1,
            3), new THREE.MeshLambertMaterial(
            {
                map: THREE.ImageUtils.loadTexture('images/astrroid.jpg'),//Load the texture
                color: enemiesColor() // Create random color
            })
        );

        //Set the enemies position
        enemyObject.position.x = Math.random() * (fieldWidth * 5 - fieldWidth * 2) + fieldWidth * 2;
        enemyObject.position.y = Math.random() * (max - min) + min;

        enemyObject.position.z = 10;
        enemyObject.receiveShadow = true;
        enemyObject.castShadow = true;
        enemies.push(enemyObject);
        scene.add(enemies[i]);
    }

    pointOfView = new THREE.Mesh(
        new THREE.CircleGeometry(
            1,
            1,
            3,
            10,
            10,
            10),
        groundMaterial
    );

    scene.add(pointOfView);

    pointOfView.position.x = fieldWidth / 2;
    pointOfView.position.y = fieldHeight / 2;
    pointOfView.position.z = 100;

    var ground = new THREE.Mesh(
        new THREE.CircleGeometry(
            800,
            800,
            3,
            10,
            10,
            10),
        groundMaterial
    );

    ground.position.z = -132;

    //Add shadow
    ground.receiveShadow = true;
    scene.add(ground);

    //Create a point light
    pointLight = new THREE.PointLight(0xF8D898);

    pointLight.position.x = -1000;
    pointLight.position.y = 0;
    pointLight.position.z = 1000;
    pointLight.intensity = 4;
    pointLight.distance = 2000;
    scene.add(pointLight);

    // Add a spot light
    spotLight = new THREE.SpotLight(0xF8D898);
    spotLight.position.set(0, 0, 600);
    spotLight.intensity = 2;
    spotLight.castShadow = true;
    scene.add(spotLight);


    renderer.shadowMapEnabled = true;

    //Create life counter
    for (i = 0; i < playerLife; i++) {
        $("#lifes-board").append("<img src='images/ship.png' width='50'>");
    }

    gameSpeed();
}
//Function that create random color of asteroid
    function enemiesColor() {
        var max = 4, min = 1;
        var color = min - 0.5 + Math.random() * (max - min + 1)
        color = Math.round(color);
        switch (color) {
            case 1:
                currentColor = 0xF5970A
                break
            case 2:
                currentColor = 0x6DF50A
                break
            case 3:
                currentColor = 0x0A6FF5
                break;
            case 4:
                currentColor = 0xF50A34
                break
        }
        return currentColor;
    }

//Draw all objects
function draw() {

    if (show) {
        // Draw THREE.JS scene
        renderer.render(scene, camera);
        requestAnimationFrame(draw);
        enemyPhys();
        playerPhys();
        cameraPhysics();
        playerMovement();
        cameraRotation()
    }
}

//Enemy physics
function enemyPhys() {

    document.getElementById("score-board").innerHTML = "Score:" + playerScore + " Level:" + playerLevel + "Speed:" + enemySpeed;
    playerScore++;
    //Move our asteroids
    for (x in enemies) {
        enemies[x].position.x -= enemySpeed;
    }

    //If enemies touch player side of road, than reset enemies
    for (var i = 0; i < enemies.length; i++) {
        enemies[i].rotation.x += Math.random() * (0.1 - 0.001) + 0.001;
        enemies[i].rotation.z += Math.random() * (0.1 - 0.001) + 0.001;
        if (enemies[i].position.x + playerWidth <= -fieldWidth / 2) {
            resetEnemy(enemies[i]);
        }
    }
}


// Player movement
function playerMovement() {
    player.rotation.z = 1.55;
    player.rotation.y = 4.8;
    //move left
    if (Key.isDown(Key.A)) {

        if (player.rotation.x > -0.2) {
            player.rotation.x -= 0.01;
            playerSphere.rotation.x -= 0.01;
            road.rotation.x -= 0.001;
            $("#gameCanvas").css("background-position", "+=0.5px 0");
        }

        // If player is not touching the side of road player move
        if (player.position.y < fieldHeight * 0.45) {
            playerDirY = playerSpeed;
        }
        //else player stand
        else {
            playerDirY = 0;
        }
    }
    // move right
    else if (Key.isDown(Key.D)) {

        if (player.rotation.x < 0.2) {
            player.rotation.x += 0.01;
            playerSphere.rotation.x += 0.01;
            road.rotation.x += 0.001;
            $("#gameCanvas").css("background-position", "-=0.5px 0");
        }


        // If player is not touching the side of road player move
        if (player.position.y > -fieldHeight * 0.45) {
            playerDirY = -playerSpeed;
        }
        //else player stand
        else {
            playerDirY = 0;
        }
    }
    // else don't move player
    else {
        // stop the player
        playerDirY = 0;

        //Rotation of player width dependence of move side
        if (player.rotation.x > 0) {
            player.rotation.x -= 0.01;
            playerSphere.rotation.x -= 0.01;
            road.rotation.x -= 0.001;
        } else {
            player.rotation.x += 0.01;
            playerSphere.rotation.x += 0.01;
            road.rotation.x += 0.001;

        }
    }

    player.scale.y += (1 - player.scale.y) * 0.2;
    player.scale.z += (1 - player.scale.z) * 0.2;
    player.position.y += playerDirY;
    playerSphere.position.y += playerDirY;

}


// Handles camera and lighting logic
function cameraPhysics() {
    // move to behind the player's player
    camera.position.x = player.position.x - 100;
    camera.position.y += (player.position.y - camera.position.y) * 0.05;
    camera.position.z = player.position.z + 100 + 0.04 * (player.position.x);

    camera.rotation.y = -60 * Math.PI / 180;
    camera.rotation.z = -90 * Math.PI / 180;
}

function cameraRotation() {
    if (Key.isDown(Key.SPACE)) {
        camera.position.x = Math.cos(currentAngle) * radius;
        camera.position.y = Math.sin(currentAngle) * radius;
        currentAngle += 0.01;
    }
}
// Handles player collision logic
function playerPhys() {

    //If player touch player than lifes-- and random reset enemy
    for (var i = 0; i < enemies.length; i++) {
        if (enemies[i].position.x <= player.position.x + playerWidth && enemies[i].position.x >= player.position.x && canTouch) {
            if (enemies[i].position.y <= player.position.y + playerHeight && enemies[i].position.y >= player.position.y - playerHeight) {
                enemyCollision();
                resetEnemy(enemies[i])
            }
        }
    }
}


function resetEnemy(enemy) {

    enemy.position.x = Math.random() * (fieldWidth * 5 - fieldWidth * 2) + fieldWidth * 2;
    enemy.position.y = Math.random() * (max - min) + min;

}

function enemyCollision() {

    enemySpeed = enemySpeed / 2;

    if (playerLife > 2) {
        playerLife--;
        $("#lifes-board img:nth(" + playerLife + ")").animate({
            opacity: "0"
        }, "slow");
    } else {
        $(".endGame").css({
            display: "block"
        })

        show = false;

        $(".endGame").append(
            "<br/><br/><br/>You lose!<br/><br/>Please input your name:<br/><br/>" +
                "<input class = 'playerName'style='margin:5px'> " +
                "<button type='button' class='btn btn-primary btn-lg btn-block send'>Send</button><br/>" +
                "<br/>You`re score:" + playerScore +
                "<br/><br/>You`re level:" + playerLevel +
                "<br/><br/>And one more thing, you'll never get to  <br/><br/>your base!" +
                "</br><img src='images/troll.png' width='200'>"
        );


        $('.send').click(function () {
            var playerName,data;

            playerName = $(".playerName").val();

            data = {
                name: playerName,
                score: playerScore,
                level: playerLevel
            }

            $.ajax({
                type: "POST",
                url: "/playerScore",
                data: data,
                success: function () {
                    console.log("Data is send!");
                }
            });
        });
    }

    canTouch = false;
    setTimeout(function () {
        canTouch = true;
    }, 3000);
}

function gameSpeed() {

    setInterval(function () {
        playerLevel += 1;
        enemySpeed += 1;
    }, 2000);

}
