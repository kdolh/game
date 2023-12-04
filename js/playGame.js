import Snowfall from "./snow";
import {startListening} from "./mic-analizer";
import {gameOptions} from "./gameOptions";
import {playerOptions} from "./playerOptions";
import {grinchOptions} from "./grinchOptions";

export default class PlayGame extends Phaser.Scene {

  constructor(game) {
    super({key: "PlayGame"});
  }

  preload() {
    this.load.image("snowflake", "img/snowflake.png");
    this.load.image("snow", "img/snow-planet.png");
    this.load.image("player", "img/nisse.png");

    // load grinch spritesheet
    this.load.spritesheet("grinch", "img/grinch.png", {
      frameWidth: 59,
      frameHeight: 88
    });
    this.load.spritesheet("grinch-catch", "img/grinch-catch.png", {
      frameWidth: 93,
      frameHeight: 133
    });
  }

  create() {
    this.snow = new Snowfall(this);
    // Initialize wind direction
    this.snow.changeWindDirection();

    // Start emitting snowflakes
    this.snow.startEmitters();

    // Grinch walk animation
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
    // Grinch catch animation
    this.anims.create({
      key: "catch",
      frames: this.anims.generateFrameNumbers("grinch-catch", {
        start: 0,
        end: 16,
        first: 0
      }),
      frameRate: 10,
      repeat: 0,
    });

    // calculate the distance from the center of the canvas and the big circle
    this.distanceFromCenter = gameOptions.bigCircleRadius + playerOptions.radius - gameOptions.bigCircleThickness;

    // == Circle ==
    // draw the big circle
    this.bigCircle = this.add.graphics();
    this.bigCircle.lineStyle(gameOptions.bigCircleThickness, gameOptions.color.lineColor, 0);
    this.bigCircle.strokeCircle(this.game.config.width / 2, this.game.config.height / 2, gameOptions.bigCircleRadius);

    // add a grass image to the center of the circle
    this.planet = this.add.sprite(this.game.config.width / 2, this.game.config.height / 2, "snow");
    this.planet.setOrigin(0.5);
    this.planet.setScale(0.8);

    // == End Circle ==

    // == Player ==
    // add player sprite
    this.player = this.initGameCharacters("player");
    // == End Player ==

    // == Grinch ==
    // add grinch sprite
    this.grinch = this.initGameCharacters("grinch");
    this.grinch.play("walk");
    this.grinch.body.onOverlap = true;
    this.grinch.setScale(2);
    // == End Grinch ==

    // == Collision ==
    this.physics.add.overlap(this.player, this.grinch, this.collider, null, this);
    // == End Collision ==
  }

  update() {
    this.snow.update();
    // Microphone Input
    // Handclap generates a sound level of 60-90Db
    if (playerOptions.micInputVolume > gameOptions.minMicInputVolume) {
      let velocity = parseFloat((playerOptions.micInputVolume / 100).toFixed(2));
      if (velocity > gameOptions.maxVelocity) {
        velocity = gameOptions.maxVelocity;
      }
      playerOptions.velocity = velocity;
    } else {
      playerOptions.velocity = playerOptions.negativeVelocity;
    }
    // If collision is detected, stop listening to input.
    if (gameOptions.stopListening) {
      playerOptions.velocity = 0;
      playerOptions.speed = 0;
      grinchOptions.speed = 0;
    } else {
      // Calculating distance between player and grinch.
      let distance = Phaser.Math.Distance.Between(this.grinch.x, this.grinch.y, this.player.x, this.player.y);
      if (Math.round(distance) > 300) {
        // Update grinch speed
        grinchOptions.speed =  grinchOptions.speed + grinchOptions.velocity;
      }
    }
    // Calculations for player movement
    if (playerOptions.velocity !== 0) {
      let improvedPlayerSpeed = playerOptions.speed + playerOptions.velocity / 100;
      if (improvedPlayerSpeed > playerOptions.maxPlayerSpeed) {
        improvedPlayerSpeed = playerOptions.maxPlayerSpeed;
      }
      if (parseFloat(improvedPlayerSpeed.toFixed(2)) > 0) {
        playerOptions.speed = improvedPlayerSpeed;
      } else {
        playerOptions.velocity = 0;
        playerOptions.speed = 0.05;
      }
    }

    // update previous angle to current angle
    this.player.previousAngle = this.player.currentAngle;

    // update current angle adding player speed
    this.player.currentAngle = Phaser.Math.Angle.WrapDegrees(this.player.currentAngle + playerOptions.speed);
    this.grinch.currentAngle = Phaser.Math.Angle.WrapDegrees(this.grinch.currentAngle + grinchOptions.speed);
    // Rotate and place player sprite.
    this.rotateGameCharacter(this.player);

    // Rotate and place grinch sprite.
    this.rotateGameCharacter(this.grinch);
  }

  /**
   * Collision between player and grinch
   * @param player
   * @param grinch
   */
  collider(player, grinch) {
    gameOptions.stopListening = true;
    player.disableBody(true, true);
    grinch.play("catch");
  }

  /**
   * Init game characters
   * @param type
   * @returns {*}
   */
  initGameCharacters(type) {
    let character = this.physics.add.sprite(this.game.config.width / 2, this.game.config.height / 2 + this.distanceFromCenter, type);
    let config = playerOptions;
    if (type === "grinch") {
      config = grinchOptions;
    }

    if (type === "player") {
      character.displayWidth = config.radius * 2;
      character.displayHeight = config.radius * 2;
    }
    // player current angle, on top of the big circle
    character.currentAngle = config.baseAngle;
    // player previous angle, at the moment same value of current angle
    character.previousAngle = character.currentAngle;
    return character;
  }

  /**
   * Rotate game character
   * @param character
   */
  rotateGameCharacter(character) {
    // transform degrees to radians
    let radians = Phaser.Math.DegToRad(character.currentAngle);
    // console.debug(radians, character);

    let distanceFromCenter = this.distanceFromCenter + 2 * gameOptions.bigCircleThickness;

    // position player using trigonometry
    character.x = this.game.config.width / 2 + distanceFromCenter * Math.cos(radians);
    character.y = (this.game.config.height / 2) + distanceFromCenter * Math.sin(radians);
    character.angle = 90 + character.currentAngle;
  }
}
