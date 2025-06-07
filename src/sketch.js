import p5 from "p5";

export const sketch = new p5((p) => {
  let gameStart = false;
  let isDataEntered = false;
  let gameOver = false;
  let score = 0;

  let pg;
  let body, ground, bg;

  let flower, flower_dead, title_img, bg_ground, bg_sky;
  let titleY = 0;

  // 입력 창 노드 취득
  const form = document.getElementById("form");
  // 입력 시 작동
  // 입력 창 입력 시 이벤트리스너입니다. to 성훈. 이 영역에서 데이터를 DB로 전달할 수 있습니다. -용파
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    form.style.display = "none";
    isDataEntered = true;
  });

  // 게임 중 점수 확인 영역 노드 취득
  const scoreSection = document.getElementById("score");
  const scoreNum = document.getElementById("score-num");

  // 스코어보드 노드 취득
  const score_board = document.getElementById("score-board");

  p.setup = async () => {
    p.createCanvas(window.innerWidth, window.innerHeight);
    pg = p.createGraphics(p.width, p.height, p.WEBGL);
    p.rectMode(p.CENTER);
    p.textAlign(p.CENTER, p.CENTER);
    p.imageMode(p.CENTER);
    pg.imageMode(p.CENTER);
    p.noSmooth();
    pg.noSmooth();
    pg.noStroke();
    pg.pixelDensity(0.4);
    pg.resetMatrix();
    pg.translate(-pg.width / 2, -pg.height / 2);

    // 이미지파일을 불러오는 부분입니다.
    // p5.js 2.0은 비동기함수로 이미지파일을 불러올 수 있더라구요.
    flower = await p.loadImage("./images/Face_basic_x4.png");
    flower_dead = await p.loadImage("./images/Face_dead_x4.png");
    title_img = await p.loadImage("./images/Title_.png");
    bg_ground = await p.loadImage("./images/BG_Ground.png");
    bg_sky = await p.loadImage("./images/BG_Sky.png");

    // 객체 생성 및 초기화 부분
    const groundY = p.height * 0.77;
    ground = new Ground(p.width / 2, groundY);
    body = new Body(p.width / 2, ground.pos.y, 0);
    body.update();
    bg = new BG(p.width / 2, p.height / 2, bg_ground, bg_sky);
  };

  p.draw = () => {
    // 각각 스크린의 초기화
    pg.clear();
    p.background(255);
    // 배경을 그리는 부분
    bg.updateScale();
    bg.display();

    // 시험삼아 넣은 태양
    // 제거해도 무관
    pg.fill(255, 225, 100);
    pg.ellipse(300, 120, 160);
    pg.fill(255, 255, 225);
    pg.ellipse(300, 120, 140);

    // 땅 그리는 부분
    // 제거해도 무관
    ground.display();
    // 몸통과 다리 등 캐릭터를 그리는 부분
    body.displayLegs();
    // offscreen 캔버스를 그리는 부분
    p.push();
    p.imageMode(p.CORNER);
    p.image(pg, 0, 0);
    p.pop();
    // 몸통 그리는 부분입니다
    body.display();

    if (!gameStart) {
      //게임 시작 전 화면입니다 (초기 화면)
      titleY = p.sin(p.frameCount * 0.015) * (p.height * 0.01);
      p.push();
      p.translate(p.width / 2, p.height * 0.25 + titleY);
      p.rotate(p.sin(p.frameCount * 0.025) * (p.QUARTER_PI * 0.0375) + 0.125);
      p.image(title_img, 0, 0, title_img.width * 0.2, title_img.height * 0.2);
      p.pop();
      // press to start 그리는 부분
      p.push();
      p.textFont("DOSGothic");
      p.textSize(28);
      p.strokeWeight(4);
      p.stroke(0);
      p.fill(255 - (p.sin(p.frameCount * 0.05) * 0.5 + 0.5) * 100);
      p.text("Press SPACE BAR to start", p.width * 0.5, p.height * 0.875);
      p.pop();
    } else {
      // 게임 진행 중 화면입니다.
      if (!isDataEntered) {
        // 아직 버튼이 눌리지 않았을 때
        form.style.display = "block";
      } else {
        // 정보가 입력되고 게임이 진행될 때
        scoreSection.style.display = "block";
        // 일정 시간마다 점수가 올라갑니다.
        // 점수는 score 변수로 관리됩니다.
        if (p.frameCount % 12 === 0) {
          score++;
        }
        scoreNum.textContent = `${score / 10}m`;
        // p.text(score / 10 + "m", p.width * 0.5, p.height * 0.1);
        body.update();
        bg.update();
      }
    }
    if (gameOver) {
      // 게임 오버되었을 경우입니다.
      gameStart = false;
      // p.text("GAME OVER", p.width / 2, p.height / 2);
      p.noLoop();

      // 점수 확인 영역 안 보이게
      scoreSection.style.display = "none";

      // 스코어보드 보이게끔
      score_board.style.display = "block";
    }
  };

  p.keyPressed = () => {
    if (p.keyCode !== 32) return;

    if (gameOver) {
      resetGame();
      // 바로 아래줄을 주석 해제하면 초기화면 없이 바로 입력 화면으로 재시작됩니다.
      // gameStart = true;
      return;
    }
    if (!gameStart) {
      gameStart = true;
      return;
    }
  };

  p.windowResized = () => {
    p.resizeCanvas(window.innerWidth, window.innerHeight);
  };

  class BG {
    constructor(x, y, img, img2) {
      this.pos = p.createVector(x, y);
      this.img = img;
      this.img2 = img2;
      this.bg1 = {
        src: this.img,
        loc: { x: 0, y: 0 },
        pos: { x: 0, y: 0 },
      };
      this.bg2 = {
        src: this.img,
        loc: { x: 0, y: 0 },
        pos: { x: 0, y: 0 },
      };
      this.speed = 1.2;

      this.updateScale();
    }

    updateScale() {
      const scale = p.height / this.img.height;
      this.w = this.img.width * scale;
      this.h = this.img.height * scale;
    }

    update() {
      this.speed += body.difficulty * 200;
      this.bg1.pos.x -= this.speed;
      this.bg2.pos.x -= this.speed;

      if (this.bg1.pos.x < this.bg1.loc.x - this.w) {
        this.bg1.pos.x = 0;
      }
      if (this.bg2.pos.x < this.bg2.loc.x - this.w) {
        this.bg2.pos.x = 0;
      }
    }

    display() {
      p.image(this.img2, this.pos.x, this.pos.y, this.w, this.h);
      p.push();
      p.translate(this.pos.x, this.pos.y);
      p.image(this.bg1.src, this.bg1.pos.x, this.bg1.pos.y, this.w, this.h);
      p.pop();
      p.push();
      p.translate(this.pos.x + this.w, this.pos.y);
      p.image(this.bg2.src, this.bg2.pos.x - 1, this.bg2.pos.y, this.w, this.h);
      p.pop();
    }
  }

  class Ground {
    constructor(x, y) {
      this.pos = p.createVector(x, y);
    }

    display() {
      p.push();
      p.stroke(0, 180, 0);
      p.strokeWeight(4);
      p.line(0, this.pos.y, p.width, this.pos.y);
      p.pop();
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
      this.length = 130;

      this.targetPoslevel = 0;
      this.targetPosL = p.createVector();
      this.targetPosR = p.createVector();

      this.calculateTargetPos(1.5);
      this.leftLeg = new Leg(this.targetPosL.x, this.targetPosL.y, 80, "LEFT");
      this.rightLeg = new Leg(
        this.targetPosR.x,
        this.targetPosR.y,
        80,
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

    displayLegs() {
      this.leftLeg.display();
      this.rightLeg.display();
    }

    display() {
      p.push();
      p.noStroke();
      p.translate(this.pos.x, this.pos.y);
      p.rotate(this.angle);
      // p.rect(0, 0, 50, 100);
      if (!gameOver) {
        p.image(flower, 0, 0, flower.width * 0.75, flower.height * 0.75);
      } else {
        p.image(flower_dead, 0, 0, flower.width * 0.75, flower.height * 0.75);
      }
      p.pop();
    }
  }

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

      thickLine(
        pg,
        this.segs[0].bPos.x,
        this.segs[0].bPos.y,
        this.foot.newPos.x,
        this.foot.newPos.y,
        12
      );
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
      thickLine(
        pg,
        this.newPos.x,
        this.newPos.y,
        this.newPos.x + this.step.x / 2,
        this.newPos.y,
        12
      );
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
      thickLine(
        pg,
        this.aPos.x,
        this.aPos.y,
        this.bPos.x,
        this.bPos.y,
        this.id < 3 ? 12 : 8
      );
    }

    setA(x, y) {
      this.aPos.set(x, y);
    }

    setB(x, y) {
      this.bPos.set(x, y);
    }
  }

  function resetGame() {
    gameStart = false;
    isDataEntered = false;
    gameOver = false;
    score = 0;

    form.reset();
    form.style.display = "none";
    score_board.style.display = "none";
    scoreSection.style.display = "none";

    const groundY = p.height * 0.77;
    ground = new Ground(p.width / 2, groundY);
    body = new Body(p.width / 2, ground.pos.y, 0);
    bg = new BG(p.width / 2, p.height / 2, bg_ground, bg_sky);

    p.loop();
  }
});

function thickLine(g, x1, y1, x2, y2, w, col = 0) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.hypot(dx, dy);
  const ang = Math.atan2(dy, dx);

  g.push();
  g.translate(x1, y1);
  g.rotate(ang);

  g.noStroke();
  g.fill(col);

  g.rectMode(g.CORNER);
  g.rect(0, -w / 2, len, w);

  g.circle(0, 0, w);
  g.circle(len, 0, w);
  g.pop();
}
