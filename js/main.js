import {gameOptions} from "./gameOptions";
import PlayGame from "./playGame";
import Start from "./start";
import {startListening} from "./mic-analizer";

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

