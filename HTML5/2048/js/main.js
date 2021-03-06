// game array, starts with all cells to zero
var fieldArray = new Array(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);

function getUrlVars() {
    var vars = {};
    var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
        vars[key] = value;
    });
    return vars;
}

window.onload = function() {
    init();

    function init() {
        if (window.DeviceOrientationEvent) {
            //document.getElementById("doEvent").innerHTML = "DeviceOrientation";
            // Listen for the deviceorientation event and handle the raw data
            window.addEventListener('deviceorientation', function(eventData) {
                // gamma is the left-to-right tilt in degrees, where right is positive
                var tiltLR = eventData.gamma;

                // beta is the front-to-back tilt in degrees, where front is positive
                var tiltFB = eventData.beta;

                // alpha is the compass direction the device is facing in degrees
                var dir = eventData.alpha

                // call our orientation event handler
                deviceOrientationHandler(tiltLR, tiltFB, dir);
            }, false);
        } else {
            document.getElementById("doEvent").innerHTML = "Not supported on your device or browser.  Sorry."
        }
    }
    // creation of a new phaser game, with a proper width and height according to tile size
    var w = window.innerWidth;
    var h = window.innerHeight;
    var tileSize = w < h ? w/4 : h/4;
    var tileScale;

    var game = new Phaser.Game(w, h, Phaser.AUTO, "screen", {preload:onPreload, create:onCreate, update: onUpdate});

    // this is the group which will contain all tile sprites
    var tileSprites;
    // variables to handle keyboard input
    var upKey;
    var downKey;
    var leftKey;
    var rightKey;

    var scoreText;
    var score = 0;

    // audio
    var audioScore;
    var audioTilt;

    var gameOverText;
    var logoText;

    // true when the device orientation change has been alredy consumed
    var tiltConsumed = false;

    var tileNames = {
        2: "1.png",
        4: "2.png",
        8: "3.png",
        16: "4.png",
        32: "5.png",
        64: "6.png",
        128: "7.png",
        256: "8.png",
        512: "9.png",
        1024: "10.png",
        2048: "11.png",
        4096: "12.png",
        8192: "13.png",
        16384: "14.png",
        32768: "15.png",
        65536: "16.png"
    }

    // at the beginning of the game, the player cannot move
    var canMove=false;

    // THE GAME IS PRELOADING
    function onPreload() {
        // preload the only image we are using in the game
        game.load.image("bg", "assets/bg2.jpg")
        game.load.bitmapFont('fonts', 'assets/font.png', 'assets/font.fnt');
        game.load.atlas("tiles", 'assets/tiles-atlas.png', 'assets/tiles-atlas.json' );
        game.load.image("lantern", "assets/lantern.png");
        game.load.image("logo", "assets/2048Mahjong.png");
        game.load.image("gameover", "assets/GameOver.png");
        game.load.audio('audioScore', [ 'assets/audio/score.wav' ]);
        game.load.audio('audioTilt', ['assets/audio/tilt.mp3' ]);
    }

    // THE GAME HAS BEEN CREATED
    function onCreate() {
        if (this.game.device.desktop)
        {
            game.stage.scale.pageAlignHorizontally = true;
        }
        else
        {
            game.stage.scale.minWidth = game.width /4;
            game.stage.scale.minHeight = game.height /4;
            game.stage.scale.maxWidth = game.width * 4;
            game.stage.scale.maxHeight = game.height * 4;
            game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
            game.stage.scale.pageAlignHorizontally = true;
            game.stage.scale.pageAlignVeritcally = true;
        }

        // create bg
        var bgImg = game.add.sprite(0,0, 'bg');
        bgImg.width = game.width;
        bgImg.height = game.height;

        // lantern
        lantern = game.add.sprite(0 ,0, 'lantern');
        lantern.anchor.setTo(0.5, 0);
        lantern.x = game.width - lantern.width/2;
        game.add.tween(lantern).to({angle:20}, 2000, Phaser.Easing.Cubic.Out, true)
                               .to({angle:-20}, 2000, Phaser.Easing.Cubic.Out, true).loop();


        // DEBUG Helper code!!
        // To enable it go to index.html?debug=true
        if(getUrlVars()["debug"] == "true"){
            lantern.inputEnabled =true;
            lantern.events.onInputDown.add(function(){

                for (var i = 0; i < 14; i++) {
                    addTwo();
                }
                fieldArray = new Array(2,2,8,4,16,32,64,128,256,512,1024,2048,16,32,2,8);
                updateNumbers();
                canMove =true;

            }, this)
        }

        updateScore();

        // listener keys
        upKey = game.input.keyboard.addKey(Phaser.Keyboard.UP);
        upKey.onDown.add(moveUp,this);
        downKey = game.input.keyboard.addKey(Phaser.Keyboard.DOWN);
        downKey.onDown.add(moveDown,this);
        leftKey = game.input.keyboard.addKey(Phaser.Keyboard.LEFT);
        leftKey.onDown.add(moveLeft,this);
        rightKey = game.input.keyboard.addKey(Phaser.Keyboard.RIGHT);
        rightKey.onDown.add(moveRight,this);

        // sprite group declaration
        tileSprites = game.add.group();

        //	Here we set-up our audio
        audioScore = game.add.audio('audioScore');
        audioTilt = game.add.audio('audioTilt');

        toggleLogo();
    }

    function onUpdate() {
        /*var lantern_angle = lantern.angle;
        if (lantern_angle > 45){
            lantern.angle = lantern_angle -1
        } else if (lantern_angle > -45){
            lantern.angle = lantern_angle +1
        }*/
    }

    function startGame(){
        resetTiles();

        toggleLogo();
        addTwo();
        addTwo();
        canMove = true;

        // reset score
        score = 0;
        updateScore();
    }
    function updateScore(){
        var text = "SCORE: " + score;
        var fontSize = 64;

        if (! scoreText){
            // Creates Score text
            scoreText = game.add.bitmapText(200, 100, 'fonts', text, fontSize);
            scoreText.y = game.height - (fontSize +10);
            scoreText.x = game.width - text.length *fontSize /2;
            scoreText.x = game.width - (text.length *fontSize /2 + 10);

            return;
        } else {
            // Update Score text
            scoreText.text = text;

            scoreText.align = 'center';

            scoreText.scale.setTo(1.5, 1.5);
            game.add.tween(scoreText.scale).to({x: 1.0, y: 1.0}, 300, Phaser.Easing.Bounce.Out, true);

            audioScore.play();
        }


    }

    // A NEW "2" IS ADDED TO THE GAME
    function addTwo(){
        // choosing an empty tile in the field
        do{
            var randomValue = Math.floor(Math.random()*16);
        } while (fieldArray[randomValue]!=0)
        // such empty tile now takes "2" value
        fieldArray[randomValue]=2;

        // creation of a new sprite with "tile" instance, that is "tile.png" we loaded before
        var tile = game.add.sprite(0,0, "tiles");
        tile.anchor.setTo(0.5,0.5);
        tile.x = toAnchorCoordinate(toCol(randomValue)*tileSize);
        tile.y = toAnchorCoordinate(toRow(randomValue)*tileSize);

        tile.frameName = tileNames[2];

        // this is actually a constant
        tileScale = tileSize/tile.height;
        tile.scale.setTo(tileScale, tileScale);

        // creation of a custom property "pos" and assigning it the index of the newly added "2"
        tile.pos = randomValue;
        // at the beginning the tile is completely transparent
        tile.alpha=0;


        // adding tile sprites to the group
        tileSprites.add(tile);

        // Add animation!!
        var fadeIn = game.add.tween(tile);
        // the tween will make the sprite completely opaque in 250 milliseconds
        fadeIn.to({alpha:1}, 500);
        // tween callback
        fadeIn.onComplete.add(function(){
            // updating tile numbers. This is not necessary the 1st time, anyway
            updateNumbers();
            // now I can move
            console.log("ACTIVATE");
            canMove=true;
        })
        // starting the tween
        fadeIn.start();
    }

    // Set and unset gameover state and graphics
    function toggleLogo(){
        // hides gameover text;
        if (gameOverText)
            toggleGameOver()

        if (logoText){
            game.add.tween(logoText).to({y: - logoText.height * 2}, 1000, Phaser.Easing.Bounce.Out, true)
                .onComplete.add(function(){
                        logoText.destroy();
                        logoText = null;
                    });
        } else {
            logoText = game.add.sprite(0, 0, 'logo');
            var s =  (game.width*(4/5)) / logoText.width;
            logoText.scale.setTo(s, s);
            logoText.anchor.setTo(0.5, 0.5);
            logoText.x = game.width /2;
            logoText.y = game.height *2;

            canMove = false;
            logoText.inputEnabled = true;
            logoText.events.onInputDown.add(startGame, this);
            game.add.tween(logoText).to({y: game.height /2}, 1000, Phaser.Easing.Bounce.Out, true).start();
        }
    }
    // Set and unset gameover state and graphics
    function toggleGameOver(){
        if (gameOverText){
            // unset it
             game.add.tween(gameOverText).to({y: - gameOverText.height * 2}, 1000, Phaser.Easing.Bounce.Out, true)
                .onComplete.add(function(){
                     gameOverText.destroy();
                     gameOverText = null;
                    });

        } else {
            gameOverText = game.add.sprite(0, 0, 'gameover');
            gameOverText.anchor.setTo(0.5, 0.5);
            gameOverText.x = game.width /2;
            gameOverText.y = game.height * 2;
            gameOverText.inputEnabled = true;
            gameOverText.events.onInputDown.add(toggleLogo, this);
            game.add.tween(gameOverText).to({y: game.height /2}, 1000, Phaser.Easing.Bounce.Out, true).start();

        }
    }

    function resetTiles(){
        for  (var i = 0 ; i < fieldArray.length; i++){
            fieldArray[i] = 0;
        }
        // Iterate untile all the objects are removed in the group
        while (tileSprites.length){
            tileSprites.forEach(function(item){
                if(item)
                    item.destroy();
            });
        }
    }

    // Since tiles anchor is 0.5/0.5 we can use this hardcoded function!
    function toAnchorCoordinate(initialCoordinate){
        return initialCoordinate + tileSize /2;
    }

    // GIVING A NUMBER IN A 1-DIMENSION ARRAY, RETURNS THE ROW
    function toRow(n){
        return Math.floor(n/4);
    }

    // GIVING A NUMBER IN A 1-DIMENSION ARRAY, RETURNS THE COLUMN
    function toCol(n){
        return n%4;
    }

    // THIS FUNCTION UPDATES THE NUMBER AND COLOR IN EACH TILE
    function updateNumbers(){
        // look how I loop through all tiles
        tileSprites.forEach(function(item){
            // retrieving the proper value to show
            if (item == null)
                return;
            var value = fieldArray[item.pos];
            var currFramename = item.frameName;

            // remove tile
            if (value === 0){
                item.destroy();
            } else
            // update tile
            if (currFramename != tileNames[value]) {
                //update needed
                item.frameName=tileNames[value];
                item.scale.setTo(2.0, 2.0);
                game.add.tween(item.scale).to({x: tileScale, y: tileScale}, 150, Phaser.Easing.Bounce.Out, true);

                // scoring
                score += (value/2);
                updateScore();
            }
        });
    }

    // MOVING TILES LEFT
    function moveLeft(){
        // Is the player allowed to move?
        if(canMove){
            console.log("CAN MOVE");
            // the player can move, let's set "canMove" to false to prevent moving again until the move process is done
            canMove=false;
            // keeping track if the player moved, i.e. if it's a legal move
            var moved = false;
            // look how I can sort a group ordering it by a property
            tileSprites.sort("x",Phaser.Group.SORT_ASCENDING);
            // looping through each element in the group
            tileSprites.forEach(function(item){
                // getting row and column starting from a one-dimensional array
                var row = toRow(item.pos);
                var col = toCol(item.pos);
                // checking if we aren't already on the leftmost column (the tile can't move)
                if(col>0){
                    // setting a "remove" flag to false. Sometimes you have to remove tiles, when two merge into one
                    var remove = false;
                    // looping from column position back to the leftmost column
                    for(i=col-1;i>=0;i--){
                        // if we find a tile which is not empty, our search is about to end...
                        if(fieldArray[row*4+i]!=0){
                            // ...we just have to see if the tile we are landing on has the same value of the tile we are moving
                            if(fieldArray[row*4+i]==fieldArray[row*4+col]){
                                // in this case the current tile will be removed
                                remove = true;
                                i--;
                            }
                            break;
                        }
                    }
                    // if we can actually move...
                    if(col!=i+1){
                        // set moved to true
                        moved=true;
                        // moving the tile "item" from row*4+col to row*4+i+1 and (if allowed) remove it
                        moveTile(item,row*4+col,row*4+i+1,remove);
                    }
                }
            });
            // completing the move
            endMove(moved);
        }
    }

    // FUNCTION TO COMPLETE THE MOVE AND PLACE ANOTHER "2" IF WE CAN
    function endMove(m){
        // if we move the tile...

        if(m){
            // add another "2"
            audioTilt.play();
            addTwo();
        } else{
            // otherwise just let the player be able to move again

            canMove=true;
        }

    }

    function checkGameOver(){
        // Check if array has empty slots
        for  (var i = 0 ; i < fieldArray.length; i++){
            if (fieldArray[i] == 0){
                console.log("Array not empty");
                return false;
            }
        }

        /*
         0   1   2   3
         4   5   6   7
         8   9   10  11
         12  13  14  15
         */
        // Check if they slots can be merged
        for (var i = 0 ; i < fieldArray.length; i++){
            // Upper tile
            var u = i-4;
            if (u >= 0){
                if (fieldArray[u] == fieldArray[i]){
                    console.log("Tile U:" + u+ "Tile i;" + i);
                    return false;
                }
            }

            // Lower tile
            var d = i+4;
            if (d < fieldArray.length){
                if (fieldArray[d] == fieldArray[i]){
                    console.log("Tile D:" + d+ "Tile i;" + i);
                    return false;
                }
            }

            var iRow = Math.floor(i /4);
            var l = i-1;
            var lRow = Math.floor(l /4);
            if (iRow === lRow){
                if (fieldArray[l] == fieldArray[i]){
                    console.log("Tile L:" + l+ "Tile i;" + i);
                    return false;
                }
            }
            var r = i+1;
            var rRow = Math.floor(r /4);
            if (iRow === rRow){
                if (fieldArray[r] == fieldArray[i]){
                    console.log("Tile R:" + r + "Tile i;" + i);
                    return false;
                }
            }
        }
        console.log("It's a game over!");
        return true;
    }

    // FUNCTION TO MOVE A TILE
    function moveTile(tile,from,to,remove){
        // first, we update the array with new values
        fieldArray[to]=fieldArray[from];
        fieldArray[from]=0;
        tile.pos=to;
        // then we create a tween
        var movement = game.add.tween(tile);
        movement.to({x: toAnchorCoordinate(tileSize*(toCol(to))),
                y: toAnchorCoordinate(tileSize*(toRow(to)))},
            150);
        movement.onComplete.add(function(){
            // Check game over
            if (checkGameOver() && gameOverText == null)
                toggleGameOver();
        });

        if(remove){
            // if the tile has to be removed, it means the destination tile must be multiplied by 2
            fieldArray[to]*=2;
            // at the end of the tween we must destroy the tile
            movement.onComplete.add(function(){
                tile.destroy();

            });
        }
        // let the tween begin!
        movement.start();
    }

    // MOVING TILES UP - SAME PRINCIPLES AS BEFORE
    function moveUp(){
        if(canMove){
            canMove=false;
            var moved=false;
            tileSprites.sort("y",Phaser.Group.SORT_ASCENDING);
            tileSprites.forEach(function(item){
                var row = toRow(item.pos);
                var col = toCol(item.pos);
                if(row>0){
                    var remove=false;
                    for(i=row-1;i>=0;i--){
                        if(fieldArray[i*4+col]!=0){
                            if(fieldArray[i*4+col]==fieldArray[row*4+col]){
                                remove = true;
                                i--;
                            }
                            break
                        }
                    }
                    if(row!=i+1){
                        moved=true;
                        moveTile(item,row*4+col,(i+1)*4+col,remove);
                    }
                }
            });
            endMove(moved);
        }
    }

    // MOVING TILES RIGHT - SAME PRINCIPLES AS BEFORE
    function moveRight(){
        if(canMove){
            canMove=false;
            var moved=false;
            tileSprites.sort("x",Phaser.Group.SORT_DESCENDING);
            tileSprites.forEach(function(item){
                var row = toRow(item.pos);
                var col = toCol(item.pos);
                if(col<3){
                    var remove = false;
                    for(i=col+1;i<=3;i++){
                        if(fieldArray[row*4+i]!=0){
                            if(fieldArray[row*4+i]==fieldArray[row*4+col]){
                                remove = true;
                                i++;
                            }
                            break
                        }
                    }
                    if(col!=i-1){
                        moved=true;
                        moveTile(item,row*4+col,row*4+i-1,remove);
                    }
                }
            });
            endMove(moved);
        }
    }

    // MOVING TILES DOWN - SAME PRINCIPLES AS BEFORE
    function moveDown(){
        if(canMove){
            canMove=false;
            var moved=false;
            tileSprites.sort("y",Phaser.Group.SORT_DESCENDING);
            tileSprites.forEach(function(item){
                var row = toRow(item.pos);
                var col = toCol(item.pos);
                if(row<3){
                    var remove = false;
                    for(i=row+1;i<=3;i++){
                        if(fieldArray[i*4+col]!=0){
                            if(fieldArray[i*4+col]==fieldArray[row*4+col]){
                                remove = true;
                                i++;
                            }
                            break
                        }
                    }
                    if(row!=i-1){
                        moved=true;
                        moveTile(item,row*4+col,(i-1)*4+col,remove);
                    }
                }
            });
            endMove(moved);
        }
    }

    function deviceOrientationHandler(tiltLR, tiltFB, dir) {
        var f = tiltLR > 30;
        var b = tiltLR < -30;
        var r= tiltFB > 30;
        var l = tiltFB < -30;


        if (tiltConsumed) {
            // Game is ready for a new move
            if (!l && !r && !b && !f)
                tiltConsumed = false;
        } else {
            if (r && !f && !b) {
                tiltConsumed = true;
                moveRight();
            }
            else if (l && !f && !b) {
                tiltConsumed = true;
                moveLeft();
            }
            else if (b && !l && !r) {
                tiltConsumed = true;
                moveDown();
            }
            else if (f && !l && !r) {
                tiltConsumed = true;
                moveUp();
            }
        }
    }
};

