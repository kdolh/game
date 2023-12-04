import {gameOptions} from "./options/gameOptions";
import PlayGame from "./scene/playGame";
import Start from "./scene/start";
import {startListening} from "./libs/mic-analizer";

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
      width: 1600,
      height: 1200
    },
    physics: {
      default: 'arcade',
      arcade: {
        gravity: {
          x: 0,
          y: 0
        }
      }
    },
    scene: [Start, PlayGame],
    micAltitude: 0,
  }
  new Phaser.Game(gameConfig);
  // init microphone altitude meter.
  startListening();

  window.focus();
}

