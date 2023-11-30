// import MicrophoneAltitudeMeter from './mic-analizer.js';
// import {PlayGame as MicrophoneAltitudeMeter} from "./scenes/playGame";
import {gameOptions} from "./gameOptions";
import {playerOptions} from "./playerOptions";
import {grinchOptions} from "./grinchOptions";
import {startListening} from "./mic-analizer";

let game;

// Init phaser game
window.onload = function () {
  // Phaser game config.
  let gameConfig = {
    type: Phaser.CANVAS,
    backgroundColor: gameOptions.color.backgroundColor,
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      parent: "game-holder",
      width: 800,
      height: 800
    },
    scene: playGame,
    micAltitude: 0,
  }
  game = new Phaser.Game(gameConfig);
  window.focus();
}

class playGame extends Phaser.Scene {

  constructor() {
    super("PlayGame");
  }

  preload() {
    this.load.image("grass", "img/kisspng-earth-globe.png");
    this.load.image("player", "img/nisse.png");
    // load grinch spritesheet
    this.load.spritesheet("grinch", "img/grinch.png", {
      frameWidth: 59,
      frameHeight: 88
    });
  }

  create() {
    // init microphone altitude meter.
    startListening();

    // Configure grinch sprite
    this.anims.create({
      key: "walk",
      frames: this.anims.generateFrameNumbers("grinch", {
        start: 0,
        end: 14,
        first: 0
      }),
      frameRate: 10,
      repeat: -1,
    });

    // Get reference to the microphone and calculate the microphone altitude using vanilla js

    // array to store all painted arcs
    this.paintedArcs = [];

    // calculate the distance from the center of the canvas and the big circle
    this.distanceFromCenter = gameOptions.bigCircleRadius + playerOptions.playerRadius - gameOptions.bigCircleThickness;

    // == Circle ==
    // draw the big circle
    this.bigCircle = this.add.graphics();
    this.bigCircle.lineStyle(gameOptions.bigCircleThickness, gameOptions.color.lineColor, 0);
    this.bigCircle.strokeCircle(game.config.width / 2, game.config.height / 2, gameOptions.bigCircleRadius);

    // add a grass image to the center of the circle
    this.grass = this.add.sprite(game.config.width / 2, game.config.height / 2, "grass");
    this.grass.setOrigin(0.5);

    // graphics object where to draw the highlight circle
    this.highlightCircle = this.add.graphics();
    // == End Circle ==

    // == Player ==
    // add player sprite
    this.player = this.initGameCharacters("player");
    // == End Player ==

    // == Grinch ==
    // add grinch sprite
    this.grinch = this.initGameCharacters("grinch");
    this.grinch.play("walk");
    // == End Grinch ==


    // todo: Temporaty solution, replace with mic input
    // input listener
    this.input.keyboard.on("keydown", function () {
      // count player clicks and update velocity
      playerOptions.playerVelocity = 5;
    }, this);
    this.input.keyboard.on("keyup", function () {
      // count player clicks and update velocity
      playerOptions.playerVelocity = -5;
    }, this);

  }


  update() {
    // Microphone Input
    // Handclap generates a sound level of 70-90Db
    if (playerOptions.micInputVolume > 1) {
      let velocity = parseFloat((playerOptions.micInputVolume / 50).toFixed(2));
      if (velocity > gameOptions.maxVelocity) {
        velocity = gameOptions.maxVelocity;
      }
      playerOptions.playerVelocity = velocity;
    } else {
      playerOptions.playerVelocity = gameOptions.negativeVelocity;
    }
    // Calculations for player movement
    if (playerOptions.playerVelocity !== 0) {
      let improvedPlayerSpeed = playerOptions.playerSpeed + playerOptions.playerVelocity / 100;
      if (improvedPlayerSpeed > playerOptions.maxPlayerSpeed) {
        improvedPlayerSpeed = playerOptions.maxPlayerSpeed;
      }
      if (parseFloat(improvedPlayerSpeed.toFixed(2)) > 0) {
        playerOptions.playerSpeed = improvedPlayerSpeed;
      } else {
        playerOptions.playerVelocity = 0;
        playerOptions.playerSpeed = 0.01;
      }
    }

    // update previous angle to current angle
    this.player.previousAngle = this.player.currentAngle;

    // update current angle adding player speed
    this.player.currentAngle = Phaser.Math.Angle.WrapDegrees(this.player.currentAngle + playerOptions.playerSpeed);

    // TODO: add grinch moving logic
    this.grinch.currentAngle = Phaser.Math.Angle.WrapDegrees(this.grinch.currentAngle + grinchOptions.grinchSpeed);

    // TODO add collision detection with the player


    // prepare highlightCircle graphic object to draw
    this.highlightCircle.clear();
    this.highlightCircle.color = gameOptions.color.highlightCircle;
    this.highlightCircle.lineStyle(gameOptions.bigCircleThickness, this.highlightCircle.color);

    // merge small arcs into bigger arcs, if possible
    this.paintedArcs = this.mergeIntervals(this.paintedArcs);

    // loop through all arcs
    this.paintedArcs.forEach(function (i) {

      // increase painted ratio value with arc length
      this.paintedRatio += (i[1] - i[0]);

      // draw the arc
      this.highlightCircle.beginPath();
      this.highlightCircle.arc(game.config.width / 2, game.config.height / 2, gameOptions.bigCircleRadius, Phaser.Math.DegToRad(i[0] - 90), Phaser.Math.DegToRad(i[1] - 90), false);
      this.highlightCircle.strokePath();
    }.bind(this));

    // convert the sum of all arcs lenght into a 0 -> 100 value
    this.paintedRatio = Math.round(this.paintedRatio * 100 / 360);

    // update player progress text
    // this.levelText.setText(this.paintedRatio + "%");

    // Rotate and place player sprite.
    this.rotateGameCharacter(this.player);

    // Rotate and place grinch sprite.
    this.rotateGameCharacter(this.grinch);
  }

  initGameCharacters(type) {
    let character = this.add.sprite(game.config.width / 2, game.config.height / 2 + this.distanceFromCenter, type);
    let config = playerOptions;
    if (type === "grinch") {
      config = grinchOptions;
    }

    if (type === "player") {
      character.displayWidth = config.playerRadius * 2;
      character.displayHeight = config.playerRadius * 2;
    }
    // player current angle, on top of the big circle
    character.currentAngle = config.baseAngle;
    // player previous angle, at the moment same value of current angle
    character.previousAngle = character.currentAngle;
    return character;
  }

  rotateGameCharacter(character) {
    // transform degrees to radians
    let radians = Phaser.Math.DegToRad(character.currentAngle);

    // determine distance from center according to jump offset
    let distanceFromCenter = this.distanceFromCenter + 2 * gameOptions.bigCircleThickness;

    // position player using trigonometry
    character.x = game.config.width / 2 + distanceFromCenter * Math.cos(radians);
    character.y = (game.config.height / 2) + distanceFromCenter * Math.sin(radians);
    character.angle = 90 + character.currentAngle;
  }

// method to convert Phaser angles to a more readable angles
  getGameAngle(angle) {
    let gameAngle = angle + 90;
    if (gameAngle < 0) {
      gameAngle = 360 + gameAngle
    }
    return gameAngle;
  }

  // method to merge intervals, found at
  // https://gist.github.com/vrachieru/5649bce26004d8a4682b
  mergeIntervals(intervals) {
    if (intervals.length <= 1) {
      return intervals;
    }
    let stack = [];
    let top = null;
    intervals = intervals.sort(function (a, b) {
      return a[0] - b[0]
    });
    stack.push(intervals[0]);
    for (let i = 1; i < intervals.length; i++) {
      top = stack[stack.length - 1];
      if (top[1] < intervals[i][0]) {
        stack.push(intervals[i]);
      } else {
        if (top[1] < intervals[i][1]) {
          top[1] = intervals[i][1];
          stack.pop();
          stack.push(top);
        }
      }
    }
    return stack;
  }
}
