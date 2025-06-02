import p5 from "p5";

export const sketch = new p5((p) => {
  let body;
  let gameStart = false;
  let gameOver = false;
  let score = 0;
  let ground;

  p.setup = () => {
    p.createCanvas(window.innerWidth, window.innerHeight);
    p.rectMode(p.CENTER);
    p.textAlign(p.CENTER, p.CENTER);

    ground = new Ground(p.width / 2, p.height / 2);
    body = new Body(p.width / 2, p.height / 2, 0);
    body.update();
  };

  p.draw = () => {
    p.background(255);

    if (gameStart) {
      if (p.frameCount % 12 === 0) {
        score++;
      }
      p.text(score / 10 + "m", p.width * 0.05, p.height * 0.05);
      body.update();
    } else {
      p.text(
        `Use the *LEFT and RIGHT ARROWS* to keep balanced\nPress *SPACE BAR* to start`,
        p.width / 2,
        p.height / 2
      );
    }

    body.display();
    ground.display();

    if (gameOver) {
      gameStart = false;
      p.text("GAME OVER", p.width / 2, p.height / 2);
      p.noLoop();
    }
  };

  p.keyPressed = () => {
    if (p.keyCode === 32) {
      gameStart = true;
    }
  };

  p.windowResized = () => {
    p.resizeCanvas(window.innerWidth, window.innerHeight);
  };

  class Ground {
    constructor(x, y) {
      this.pos = p.createVector(x, y);
    }

    display() {
      p.line(0, this.pos.y, p.width, this.pos.y);
    }
  }

  class Body {
    constructor(x, y, a) {
      this.loc = p.createVector(x, y);
      this.pos = p.createVector(x, y);
      this.angle = a;
      this.angleVel = 0;
      this.angleAcc = 0;
      this.accVal = 0.001;
      this.difficulty = 0.000005;
      this.length = 120;

      this.targetPoslevel = 0;
      this.targetPosL = p.createVector();
      this.targetPosR = p.createVector();

      this.calculateTargetPos(1.5);
      this.leftLeg = new Leg(this.targetPosL.x, this.targetPosL.y, 70, "LEFT");
      this.rightLeg = new Leg(
        this.targetPosR.x,
        this.targetPosR.y,
        70,
        "RIGHT"
      );

      this.calculatePos();
    }

    update() {
      this.calculatePos();
      const phase = p.sin(this.leftLeg.foot.angle + this.accVal / 10);
      this.calculateTargetPos(phase);
      console.log(phase);

      this.leftLeg.bodyTarget.set(this.targetPosL.x, this.targetPosL.y);
      this.rightLeg.bodyTarget.set(this.targetPosR.x, this.targetPosR.y);

      this.leftLeg.update();
      this.rightLeg.update();

      this.leftLeg.foot.speed += this.difficulty * 3;
      this.rightLeg.foot.speed += this.difficulty * 3;
      this.leftLeg.foot.step.x += this.difficulty * 1000;
      this.rightLeg.foot.step.x += this.difficulty * 1000;

      this.length += p.cos(this.rightLeg.foot.angle * 2);

      this.angleVel += this.angleAcc;
      this.angle += this.angleVel;
      this.angleAcc = 0;

      this.accVal += this.difficulty;
      if (p.keyIsPressed) {
        this.angleAcc +=
          p.keyCode == 39 ? this.accVal : p.keyCode == 37 ? -this.accVal : 0;
      }

      this.angleAcc += (this.angle >= 0 ? 1 : -1) * this.accVal * 0.25;
      this.angle %= p.TWO_PI;

      if (Math.abs(this.angle) >= p.HALF_PI) gameOver = true;
    }

    calculatePos() {
      this.pos.set(
        this.loc.x + p.cos(this.angle - p.HALF_PI) * this.length,
        this.loc.y + p.sin(this.angle - p.HALF_PI) * this.length
      );
    }

    calculateTargetPos(level) {
      const angleOffset = -level * 0.1;
      this.targetPosL.set(
        this.loc.x +
          p.cos(this.angle - p.HALF_PI + angleOffset) * this.length * 0.6,
        this.loc.y +
          p.sin(this.angle - p.HALF_PI + angleOffset) * this.length * 0.6
      );
      this.targetPosR.set(
        this.loc.x +
          p.cos(this.angle - p.HALF_PI - angleOffset) * this.length * 0.6,
        this.loc.y +
          p.sin(this.angle - p.HALF_PI - angleOffset) * this.length * 0.6
      );
    }

    display() {
      p.push();
      p.noStroke();
      p.translate(this.pos.x, this.pos.y);
      p.rotate(this.angle);
      p.rect(0, 0, 50, 100);
      p.pop();

      this.leftLeg.display();
      this.rightLeg.display();
    }
  }

  p.keyPressed = () => {
    if (p.keyCode === 32) {
      gameStart = true;
    }
  };

  p.windowResized = () => {
    p.resizeCanvas(window.innerWidth, window.innerHeight);
  };

  class Leg {
    constructor(x, y, len, side = "LEFT") {
      this.pos = p.createVector(x, y);
      this.len = len;
      this.side = side;
      this.segNum = 20;
      this.segs = [];

      this.bodyTarget = p.createVector(x, y);

      this.side === "LEFT"
        ? (this.foot = new Foot(x, y + len, 0))
        : (this.foot = new Foot(x, y + len, p.PI));

      this.generateSegs();
      this.initializeSegments();
    }

    initializeSegments() {
      for (let i = 0; i < this.segs.length; i++) {
        this.segs[i].constPos.set(this.bodyTarget.x, this.bodyTarget.y);
        this.segs[i].target = this.foot.newPos.copy();
        if (i < this.segs.length - 1) {
          this.segs[i].child = this.segs[i + 1];
        }
      }
    }

    generateSegs() {
      for (let i = 0; i < this.segNum; i++) {
        this.segs.push(
          new Segment(this.pos.x, this.pos.y, this.len / this.segNum, i)
        );
      }
    }

    update() {
      for (let i = 0; i < this.segs.length; i++) {
        this.segs[i].update();
        this.segs[i].constPos.set(this.bodyTarget.x, this.bodyTarget.y);
        this.segs[i].target = this.foot.newPos;
        if (i < this.segs.length - 1) {
          this.segs[i].child = this.segs[i + 1];
        }
      }
      this.foot.update();
    }

    display() {
      for (let i = 0; i < this.segs.length; i++) {
        this.segs[i].display();
      }
      this.foot.display();

      p.push();
      p.strokeWeight(10);
      p.line(
        this.segs[0].bPos.x,
        this.segs[0].bPos.y,
        this.foot.newPos.x,
        this.foot.newPos.y
      );
      p.pop();
    }
  }

  class Foot {
    constructor(x, y, angle) {
      this.pos = p.createVector(x, y);
      this.newPos = p.createVector(x, y);

      this.step = p.createVector(20, 40);
      this.angle = angle;
      this.speed = 0.1;

      this.updateNewPos();
    }

    updateNewPos() {
      let dx = -this.step.x * p.cos(this.angle);
      let dy = -this.step.y * p.sin(this.angle);
      this.newPos.set(this.pos.x + dx, this.pos.y + dy);
    }

    display() {
      this.updateNewPos();
      // p.ellipse(this.newPos.x, this.newPos.y, 10);
      p.push();
      p.strokeWeight(10);
      p.line(
        this.newPos.x,
        this.newPos.y,
        this.newPos.x + this.step.x / 4,
        this.newPos.y
      );
      p.pop();
    }

    update() {
      this.angle += this.speed;
      this.angle %= p.TWO_PI;
      if (this.angle > p.PI) {
        this.step.y = 0;
      } else {
        this.step.y = this.step.x * 0.75;
      }
    }
  }

  class Segment {
    constructor(x, y, len, id) {
      this.aPos = p.createVector(x, y);
      this.bPos = p.createVector();
      this.angle = 0;
      this.len = len;

      this.target = p.createVector(x, y);
      this.constPos = p.createVector(x, y);

      this.id = id;

      this.calculateB();
      this.child = null;
    }

    update() {
      if (this.id === 0) {
        this.follow(this.target.x, this.target.y);
      }
      if (this.child === null) {
        this.setA(this.constPos.x, this.constPos.y);
      } else {
        this.child.follow(this.aPos.x, this.aPos.y);
        this.child.update();
        this.aPos = this.child.bPos;
      }

      this.calculateB();
    }

    calculateB() {
      this.bPos.x = this.aPos.x + p.cos(this.angle) * this.len;
      this.bPos.y = this.aPos.y + p.sin(this.angle) * this.len;
    }

    follow(targetX, targetY) {
      let targetPos = p.createVector(targetX, targetY);
      let dir = p.constructor.Vector.sub(targetPos, this.aPos);
      this.angle = dir.heading();
      dir.setMag(this.len);
      dir.mult(-1);
      this.aPos = p.constructor.Vector.add(targetPos, dir);
    }

    display() {
      p.push();
      this.id < 3 ? p.strokeWeight(10) : p.strokeWeight(4);
      p.stroke(0);
      p.line(this.aPos.x, this.aPos.y, this.bPos.x, this.bPos.y);
      p.pop();
      p.fill(0);
    }

    setA(x, y) {
      this.aPos.set(x, y);
    }

    setB(x, y) {
      this.bPos.set(x, y);
    }
  }
});
