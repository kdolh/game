export default class Snowfall {
  constructor(game) {
    this.max = 0;
    let {width} = game.sys.game.canvas;

    this.back_emitter = game.add.particles(0, -32, 'snowflake', {
      x: {min: 0, max: width * 1.5,},
      quantity: [0, 1, 2, 3, 4, 5],
      gravity: 0,
      rotate: {min: 0, max: 40},
      width: width * 1.5,
      speedY: {min: 20, max: 100},
      scale: {min: 0.1, max: 0.3},
      frequency: 150,
      lifespan: 14000,
    });

    // mid emitter
    this.mid_emitter = game.add.particles(0, -32, 'snowflake', {
      x: {min: 0, max: width * 1.5,},
      quantity: [0, 1, 2, 3, 4, 5],
      gravity: 0,
      rotate: {min: 0, max: 180},
      width: width * 1.5,
      speedY: {min: 150, max: 150},
      scale: {min: 0.6, max: 0.4},
      frequency: 600,
      lifespan: 10000,
    });

    this.front_emitter = game.add.particles(0, -32, 'snowflake', {
      x: {min: 0, max: width * 1.5,},
      quantity: [0, 1, 2, 3, 4, 5],
      gravity: 0,
      rotate: {min: 0, max: 90},
      width: width * 1.5,
      speedY: {min: 100, max: 250},
      scale: {min: 0.4, max: 0.05},
      maxParticleScale: 1,
      minParticleScale: 0.5,
      frequency: 300,
      lifespan: 6000,
    });

    // Set update interval and counter
    this.updateInterval = 4 * 60;
    this.i = 0;
    this.back_emitter.stop();
    this.mid_emitter.stop();
    this.front_emitter.stop();
  }


  update() {
    // Update counter
    this.i++;

    // Check if it's time to change wind direction
    if (this.i === this.updateInterval) {
      this.changeWindDirection();

      // Randomize update interval
      this.updateInterval = Math.floor(Math.random() * 20) * 60; // 0 - 20sec @ 60fps

      // Reset counter
      this.i = 0;
    }
  }

  changeWindDirection() {
    // Calculate wind intensity variation
    var multi = Math.floor((this.max + 200) / 4),
      frag = (Math.floor(Math.random() * 100) - multi);

    // Update wind intensity
    this.max = this.max + frag;
    // Clamp wind intensity to prevent extreme values
    if (this.max > 200) this.max = 150;
    if (this.max < -200) this.max = -150;

    // Apply wind intensity to all emitters

    this.setXSpeed(this.back_emitter, this.max);
    this.setXSpeed(this.mid_emitter, this.max);
    this.setXSpeed(this.front_emitter, this.max);
  }

  setXSpeed(emitter, max) {
    // Set horizontal speed range for emitter
    let rand = Math.random() * (max - 20) + 20;
    emitter.speedX = max - rand;
    // Apply individual horizontal speed variation to each particle
    emitter.forEachAlive(this.setParticleXSpeed, this);
  }

  setParticleXSpeed(particle) {
    // Set individual particle horizontal speed
    particle.velocityX = this.max - Math.floor(Math.random() * 30);
  }

  startEmitters() {
    // Start emitting snowflakes from all emitters
    this.back_emitter.start();
    this.mid_emitter.start();
    this.front_emitter.start();
  }
}
