let imgs = [];
let agents = [];
const COUNT = 50;
const SIZE = 30;

function preload() {
  imgs.push(loadImage('BF.png'));
  imgs.push(loadImage('B.png'));
  imgs.push(loadImage('b5.png'));
  imgs.push(loadImage('BS2.png'));
  imgs.push(loadImage('BS1.png'));
  imgs.push(loadImage('BAe.png'));
  imgs.push(loadImage('BJ.png'));
  imgs.push(loadImage('BS3.png'));
  imgs.push(loadImage('BS4.png'));
  imgs.push(loadImage('BM.png'));
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  imageMode(CENTER);
  for (let i = 0; i < COUNT; i++) {
    agents.push(new Agent(random(imgs)));
  }
}

function draw() {
  background(0, 0, 255);
  for (let a of agents) {
    a.update(agents);
    a.show();
  }
}

class Agent {
  constructor(img) {
    this.img = img;
    this.pos = createVector(random(width), random(height));
    this.vel = p5.Vector.random2D().mult(random(2, 4));
    this.acc = createVector(0, 0);
    this.maxSpeed = 3.5;
    this.maxForce = 0.1;
  }

  update(others) {
    let sep = this.separate(others).mult(3.0);
    let ali = this.align(others).mult(1.0);
    let coh = this.cohesion(others).mult(0.8);
    this.acc.add(sep).add(ali).add(coh);
    this.vel.add(this.acc).limit(this.maxSpeed);
    this.pos.add(this.vel);
    this.acc.set(0, 0);

    let minDist = SIZE + 5;
    for (let other of others) {
      if (other === this) continue;
      let d = p5.Vector.dist(this.pos, other.pos);
      if (d < minDist && d > 0) {
        let push = p5.Vector.sub(this.pos, other.pos).setMag((minDist - d) / 2);
        this.pos.add(push);
      }
    }

    if (this.pos.x < -SIZE) this.pos.x = width + SIZE;
    if (this.pos.x > width + SIZE) this.pos.x = -SIZE;
    if (this.pos.y < -SIZE) this.pos.y = height + SIZE;
    if (this.pos.y > height + SIZE) this.pos.y = -SIZE;
  }

  show() {
    let aspect = this.img.height / this.img.width;
    image(this.img, this.pos.x, this.pos.y, SIZE, SIZE * aspect);
  }

  separate(others) {
    let zone = SIZE * 1.6;
    let steer = createVector(0, 0);
    let count = 0;
    for (let other of others) {
      let d = p5.Vector.dist(this.pos, other.pos);
      if (d > 0 && d < zone) {
        steer.add(p5.Vector.sub(this.pos, other.pos).div(d * d));
        count++;
      }
    }
    if (count > 0) steer.div(count).setMag(this.maxSpeed).sub(this.vel).limit(this.maxForce);
    return steer;
  }

  align(others) {
    let zone = SIZE * 5;
    let sum = createVector(0, 0);
    let count = 0;
    for (let other of others) {
      let d = p5.Vector.dist(this.pos, other.pos);
      if (d > 0 && d < zone) {
        sum.add(other.vel);
        count++;
      }
    }
    if (count > 0) return sum.div(count).setMag(this.maxSpeed).sub(this.vel).limit(this.maxForce);
    return sum;
  }

  cohesion(others) {
    let zone = SIZE * 5;
    let sum = createVector(0, 0);
    let count = 0;
    for (let other of others) {
      let d = p5.Vector.dist(this.pos, other.pos);
      if (d > 0 && d < zone) {
        sum.add(other.pos);
        count++;
      }
    }
    if (count > 0) {
      sum.div(count);
      let desired = p5.Vector.sub(sum, this.pos).setMag(this.maxSpeed);
      return p5.Vector.sub(desired, this.vel).limit(this.maxForce);
    }
    return createVector(0, 0);
  }
}
