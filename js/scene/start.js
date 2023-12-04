export default class Start extends Phaser.Scene {
  constructor(props) {
    super({key: "Start"});
  }
  preload() {
    this.load.image("snowflake", "img/snowflake.png");
  }

  create() {
    var welcomeText = this.add.text(this.game.config.width / 4, this.game.config.height / 4, 'Welcome to the mini-game!', {font: '48px Courier'});
    welcomeText.setStroke('#032e5c', 25);
    welcomeText.setShadow(2, 2, '#222', 2, true, true);
    var instructions = this.add.text(this.game.config.width / 6, this.game.config.height / 3 + welcomeText.height,
      'Before you start, please allow the page to use\nyour microphone input.\n' +
      '\nYou don\'t need any controls. Use clapping \nto make Nisse run and help him to run away\nfrom Grinch!\n' +
      '\nIf you are ready, click on the screen to start.',
      {font: '36px Courier'}
    );
    instructions.setShadow(2, 2, '#222', 5, true, true);

    this.input.once("pointerdown", function () {
      this.scene.start("PlayGame");
    }, this);
  }
}
