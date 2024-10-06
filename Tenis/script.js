class Ball {
    constructor(x, y, radius) {
      this.x = x;
      this.y = y;
      this.shadowY = y;
      this.velocity = createVector(radius * 0.21, random(-radius * 0.084, radius * 0.084));
      this.radius = radius;
    }
  
    update(ballArc) {
      this.x += this.velocity.x;
      this.shadowY += this.velocity.y;
      this.y = this.shadowY - ballArc;
    }
  
    render() {
      push();
      noStroke();
      fill(54, 54, 54, 100);
      ellipse(this.x, this.shadowY, this.radius);
      stroke(54);
      strokeWeight(1);
      fill(255, 255, 0);
      ellipse(this.x, this.y, this.radius);
      pop();
    }
  }
  
  class Paddle {
    constructor(x, y, slope, bottomBound, topBound, images, isPlayer, width) {
      this.x = x;
      this.y = y;
      this.bottomBound = bottomBound;
      this.topBound = topBound;
      this.slope = -slope;
      this.images = images;
      this.counter = 0;
      this.animationSpeed = 0.1;
      this.width = width;
      this.height = width * 2;
      this.moveDirection = "none";
      this.isPlayer = isPlayer;
      this.playerHasMoved = false;
    }
  
    move() {
      const speed = this.height * 0.05;
      if (this.moveDirection === 'up' && this.y > this.topBound) {
        this.y -= speed
        this.x += (speed/this.slope)
        this.counter += this.animationSpeed;
      } else if (this.moveDirection === 'down' && this.y < this.bottomBound) {
        this.y += speed
        this.x -= (speed/this.slope)
        this.counter += this.animationSpeed;
      }
    }
  
    autoMove(ballY) {
      const diff = this.y - ballY;
      if (diff < 0 && diff < -this.height * 0.5) { // Déplacement en bas
        this.switchMoveDirection('down');
      } else if (diff > 0 && diff > this.height * 0.5) { // Déplacement en haut
        this.switchMoveDirection('up');
      } else {
        this.switchMoveDirection('none');
      }
      this.move();
    }
  
    switchMoveDirection(type) {
      switch (type) {
        case 'up':
          this.moveDirection = 'up';
          this.playerHasMoved = true;
          break
        case 'down':
          this.moveDirection = 'down';
          this.playerHasMoved = true;
          break
        default:
          this.moveDirection = 'none'
      }
    }
  
    render() {
      const y1 = this.y - this.height;
      const x1 = this.x + (this.height/this.slope);
  
      const x2 = x1 + this.width;
      const y2 = y1;
  
      const x3 = this.x + this.width;
      const y3 = this.y;
  
      this.imageIdx = floor(this.counter) % this.images.length;
  
      if (this.images.length > 0) {
        noStroke();
        fill(54, 54, 54, 25);
        ellipse(this.x, this.y + this.height, this.height, this.width * 1.5);
        imageMode(CENTER);
        image(this.images[this.imageIdx], this.x, this.y, this.width * 2, this.height * 2);
        if (this.isPlayer && !this.playerHasMoved) {
          textSize(14);
          fill(54);
          text("Salut, flèches pour bouger !", this.x - padding, this.y - (this.height * 1.5));
        }
      } else {
        noStroke();
        fill(54);
        quad(this.x, this.y, x1, y1, x2, y2, x3, y3);
      }
    }
  }
  
  let width, height;
  let courtTopLeftX, courtTopLeftY, courtBottomLeftX, courtBottomLeftY,
      courtBottomRightX, courtBottomRightY, courtTopRightX, courtTopRightY;
  let netTopLeftX, netTopLeftY, netBottomLeftX, netBottomLeftY,
      netBottomRightX, netBottomRightY, netTopRightX, netTopRightY;
  let netWidth, shadowSize, padding, quadOffset;
  let paddleOne, paddleTwo;
  let ball;
  let leftPlayerScore, rightPlayerScore;
  let tennisManRedOne, tennisManRedTwo, tennisManBlueOne, tennisManBlueTwo;
  let courtHeight, courtWidth, maxBallArc, oneFourthPoint, threeFourthsPoint;
  
  function preload() {
    tennisManRedOne = loadImage('https://res.cloudinary.com/dkw0kkkgd/image/upload/v1550623424/tennisManRedOne_zaszr5.png');
    tennisManRedTwo = loadImage('https://res.cloudinary.com/dkw0kkkgd/image/upload/v1550623420/tennisManRedTwo_mz3skr.png');
    tennisManBlueOne = loadImage('https://res.cloudinary.com/dkw0kkkgd/image/upload/v1550623406/tennisManBlueOne_jo7ppq.png');
    tennisManBlueTwo = loadImage('https://res.cloudinary.com/dkw0kkkgd/image/upload/v1550623416/tennisManBlueTwo_ac6ppw.png');
  }
  
  function setup() {
    setupCanvas();
    leftPlayerScore = 0; rightPlayerScore = 0; // configuration du tableau d'affichage
    setupCourtCoordinates();
    setupNetCoordinates();
    setupPaddles();
    ball = new Ball(width * 0.5, height * 0.5, width * 0.021); // réglage de la balle
  }
  
  function setupCanvas() {
    height = min(window.innerHeight, window.innerWidth / 2);
    // keep court dimensions nice
    width = min(window.innerWidth, height * 2);
    createCanvas(width, height);
  }
  
  function draw() {
    paddleOne.move(); // déplacer le joueur en fonction des entrées clavier
    paddleTwo.autoMove(ball.y); // le joueur de l'ordinateur se déplace seul par rapport à la position de la balle
    updateBall();
    isColliding(); // vérifier si le ballon entre en collision avec les joueurs
    didHitWall(); // vérifier si le ballon entre en collision avec les joueurs
    didScore(); // vérifier si un joueur a marqué
    background(255); // dessiner l'arrière-plan
    drawCourt();
    drawCourtLines();
    paddleOne.render(); // dessiner le joueur
    paddleTwo.render(); // dessiner un joueur d'ordinateur
    drawNet();
    ball.render(); // dessiner la balle
    drawScore();
  }
  
  function setupCourtCoordinates() {
    padding = height * 0.125;
    quadOffset = width * 0.125;
  
    // coordonnées en haut à gauche du terrain
    courtTopLeftX = padding + quadOffset;
    courtTopLeftY = padding;
  
    // coordonnées en bas à gauche du terrain
    courtBottomLeftX = padding;
    courtBottomLeftY = height - padding;
  
    // coordonnées en bas à droite du terrain
    courtBottomRightX = width - padding - quadOffset;
    courtBottomRightY = height - padding;
  
    // coordonnées en haut à droite du terrain
    courtTopRightX = width - padding;
    courtTopRightY = padding;
  }
  
  function setupNetCoordinates() {
    // paramètres du filet
    netWidth = height * 0.125;
    shadowSize = width * 0.021;
  
    // en haut à gauche du filet
    netTopLeftX = (width * 0.5) + quadOffset * 0.5;
    netTopLeftY = padding - netWidth;
  
    // en bas à gauche du filet
    netBottomLeftX = width * 0.5 - quadOffset * 0.5;
    netBottomLeftY = height - padding - netWidth;
  
    // en bas à droite du filet
    netBottomRightX = width * 0.5 - quadOffset * 0.5;
    netBottomRightY = height - padding;
  
    // en haut à gauche du filet
    netTopRightX = width * 0.5 + quadOffset * 0.5;
    netTopRightY = padding;
  }
  
  function setupPaddles() {
    const bottomBound = courtBottomLeftY;
    const topBound = courtTopRightY;
    const yBounds = [bottomBound, topBound];
  
    const position = [courtBottomLeftX + 30, courtBottomLeftY - 60];
    const slope = (courtBottomLeftY - courtTopLeftY)/(courtBottomLeftX - courtTopLeftX);
    const blueImages = [tennisManBlueOne, tennisManBlueTwo];
    paddleOne = new Paddle(...position, slope, ...yBounds, blueImages, isPlayer = true, width * 0.03);
  
    const twoPosition = [courtTopRightX - 70, courtTopRightY + 60];
    const twoSlope = (courtTopRightY - courtBottomRightY)/(courtTopRightX - courtBottomRightX);
    const redImages = [tennisManRedOne, tennisManRedTwo];
    paddleTwo = new Paddle(...twoPosition, twoSlope, ...yBounds, redImages, isPlayer = false, width * 0.03);
  }
  
  function keyReleased() {
    if (keyCode === UP_ARROW || keyCode === DOWN_ARROW) {
      paddleOne.switchMoveDirection('none');
    } else if (keyCode === 87 || keyCode === 83) {
      paddleOne.switchMoveDirection('none');
    }
  }
  
  function keyPressed() {
    if (keyCode === UP_ARROW) {
      paddleOne.switchMoveDirection('up');
    } else if (keyCode === DOWN_ARROW) {
      paddleOne.switchMoveDirection('down');
    }
  }
  
  function isColliding() {
    const bottomOfBall = ball.y + ball.radius,
          topOfBall = ball.y - ball.radius,
          topOfPaddleOne = paddleOne.y - paddleOne.height,
          bottomOfPaddleOne = paddleOne.y + paddleOne.height,
          topOfPaddleTwo = paddleTwo.y - paddleTwo.height,
          bottomOfPaddleTwo = paddleTwo.y + paddleTwo.height;
  
    if (ball.x >= paddleOne.x - paddleOne.width && ball.x <= paddleOne.x + paddleOne.width) {
      if (topOfBall <= bottomOfPaddleOne && bottomOfBall >= topOfPaddleOne) {
        playerCollisionEvent();
      }
    } else if (ball.x >= paddleTwo.x - paddleTwo.width && ball.x <= paddleTwo.x + paddleTwo.width) {
      if (topOfBall <= bottomOfPaddleTwo && bottomOfBall >= topOfPaddleTwo) {
        computerCollisionEvent();
      }
    }
  }
  
  function playerCollisionEvent() {
    ball.velocity.x *= -1.03;
    ball.x = paddleOne.x + paddleOne.width + 5;
    let velocityMag;
    let xVel = ball.velocity.x;
  
    const maxTopSlope = (courtTopRightY - (paddleOne.y - paddleOne.height))/(courtTopRightX - (paddleOne.x + paddleOne.width)); // varient entre -0,38 et 0
    const maxBottomSlope = (courtBottomRightY - (paddleOne.y + paddleOne.height))/(courtBottomRightX - (paddleOne.x + paddleOne.width)); // varient entre 0 et 0.54
  
    if (ball.y < paddleOne.y) {
      velocityMag = -random(4);
      ball.velocity.y = map(velocityMag, -4, 0, xVel * maxTopSlope, 0);
    } else {
      velocityMag = random(4);
      ball.velocity.y = map(velocityMag, 0, 4, 0, xVel * maxBottomSlope);
    }
  }
  
  function computerCollisionEvent() {
    ball.velocity.x *= -1.03;
    ball.x = paddleTwo.x - paddleTwo.width - 4;
    let velocityMag;
    let xVel = ball.velocity.x;
  
    const maxTopSlope = (courtTopLeftY - (paddleTwo.y - paddleTwo.height))/(courtTopLeftX - (paddleTwo.x - paddleTwo.width)); // 0 et 0.56
    const maxBottomSlope = (courtBottomLeftY - (paddleTwo.y + paddleTwo.height))/(courtBottomLeftX - (paddleTwo.x - paddleTwo.width)); // 0 et -0.39
  
    if (ball.y < paddleTwo.y) {
      velocityMag = -random(4);
      ball.velocity.y = map(velocityMag, -4, 0, xVel * maxTopSlope, 0);
    } else {
      velocityMag = random(4);
      ball.velocity.y = map(velocityMag, 0, 4, 0, xVel * maxBottomSlope);
    }
  }
  
  function resetBall() {
    ball.x = width * 0.5;
    ball.y = height * 0.5;
    ball.shadowY = height * 0.5;
    ball.velocity.x = (ball.velocity.x < 0) ? ball.radius * 0.21 : -(ball.radius * 0.21);
    ball.velocity.y = random(-ball.radius * 0.084, ball.radius * 0.084);
  }
  
  function didHitWall() {
    const upperBound = courtTopLeftY;
    const lowerBound = courtBottomLeftY;
  
    if (ball.y <= upperBound) { ball.velocity.y *= -1 }
    if (ball.y >= lowerBound) { ball.velocity.y *= -1 }
  }
  
  function didScore() {
    const leftBound = courtBottomLeftX;
    const rightBound = courtTopRightX;
  
    if (ball.x <= leftBound) { rightPlayerScore++; resetBall(); }
    if (ball.x >= rightBound) { leftPlayerScore++; resetBall(); }
  }
  
  function updateBall() {
    let ballArc;
    maxBallArc = height * 0.0625;
    courtWidth = width - (2 * padding) - quadOffset;
    oneFourthPoint = courtBottomLeftX + quadOffset * 0.5 + courtWidth * 0.25;
    threeFourthsPoint = courtTopRightX - quadOffset * 0.5 - courtWidth * 0.25;
  
    const oneRacketX = paddleOne.x + paddleOne.width;
    const twoRacketX = paddleTwo.x - paddleTwo.width;
  
    if (ball.velocity.x > 0) { // la balle se déplace vers la droite
      if (ball.x <= width * 0.5) {
        ballArc = map(ball.x, oneRacketX, width * 0.5, maxBallArc * 0.5, maxBallArc);
      } else if (ball.x > width * 0.5 && ball.x <= threeFourthsPoint) {
        ballArc = map(ball.x, width * 0.5, threeFourthsPoint, maxBallArc, 0);
      } else {
        ballArc = map(ball.x, threeFourthsPoint, twoRacketX, 0, maxBallArc * 0.5);
      }
    } else { // la balle se déplace vers la gauche
      if (ball.x >= width * 0.5) {
        ballArc = map(ball.x, twoRacketX, width * 0.5, maxBallArc * 0.5, maxBallArc);
      } else if (ball.x < width * 0.5 && ball.x >= oneFourthPoint) {
        ballArc = map(ball.x, width * 0.5, oneFourthPoint, maxBallArc, 0);
      } else {
        ballArc = map(ball.x, oneFourthPoint, oneRacketX, 0, maxBallArc * 0.5);
      }
    }
    ball.update(ballArc);
  }
  
  function drawCourt() {
    noStroke();
    fill(54);
    const shift = 10;
    quad(courtTopLeftX + shift, courtTopLeftY + shift, courtBottomLeftX + shift, courtBottomLeftY + shift, courtBottomRightX + shift, courtBottomRightY + shift, courtTopRightX + shift, courtTopRightY + shift);
  
    fill(161, 238, 168);
    quad(courtTopLeftX, courtTopLeftY, courtBottomLeftX, courtBottomLeftY, courtBottomRightX, courtBottomRightY, courtTopRightX, courtTopRightY);
  }
  
  function drawCourtLines() {
    stroke(255);
  
    courtHeight = height - (2 * padding);
    const topSingleLineX1 = padding + ((1 - 0.125) * quadOffset),
          topSingleLineY = padding + (0.125 * courtHeight),
          topSingleLineX2 = width - padding - (0.125 * quadOffset);
  
    // la ligne du milieu
    line(oneFourthPoint, height* 0.5, threeFourthsPoint, height* 0.5);
  
    // les encoches des marqueurs centraux
    const markerLength = width/64;
    const leftX = courtBottomLeftX + quadOffset * 0.5;
    const rightX = courtTopRightX - quadOffset * 0.5;
    line(leftX, height * 0.5, leftX + markerLength, height * 0.5);
    line(rightX - markerLength, height * 0.5, rightX, height * 0.5);
  
    line(topSingleLineX1, topSingleLineY, topSingleLineX2, topSingleLineY);
  
    const bottomSingleLineX1 = padding + (0.125 * quadOffset),
          bottomSingleLineY = padding + ((1 - 0.125) * courtHeight),
          bottomSingleLineX2 = width - padding - ((1 - 0.125) * quadOffset);
  
    line(bottomSingleLineX1, bottomSingleLineY, bottomSingleLineX2, bottomSingleLineY);
  
    // lignes verticales au milieu du terrain
    line(bottomSingleLineX1 + courtWidth * 0.25, bottomSingleLineY, topSingleLineX1 + courtWidth * 0.25, topSingleLineY);
  
    line(bottomSingleLineX2 - courtWidth * 0.25, bottomSingleLineY, topSingleLineX2 - courtWidth * 0.25, topSingleLineY);
  }
  
  function drawNet() {
    strokeWeight(1);
    // l'ombre
    noStroke();
    fill(54, 54, 54, 54);
    quad(netTopRightX, netTopRightY, netBottomRightX, netBottomRightY, netBottomRightX + shadowSize, netBottomRightY, netTopRightX + shadowSize, netTopRightY);
  
    stroke(54);
    // ligne à travers
    line(netBottomLeftX, netBottomRightY - netWidth * 0.75, netTopRightX, netTopRightY - netWidth * 0.75);
    line(netBottomLeftX, netBottomRightY - netWidth * 0.5, netTopRightX, netTopRightY - netWidth * 0.5);
    line(netBottomLeftX, netBottomRightY - netWidth * 0.25, netTopRightX, netTopRightY - netWidth * 0.25);
  
    line(netBottomRightX, netBottomRightY, netTopRightX, netTopRightY);
  
    // ligne verticale du filet
    line(netBottomLeftX + quadOffset/10, (9*courtHeight)/10 + netWidth, netBottomLeftX + quadOffset/10, (9*courtHeight)/10);
    line(netBottomLeftX + (2*quadOffset)/10, (8*courtHeight)/10 + netWidth, netBottomLeftX + (2*quadOffset)/10, (8*courtHeight)/10);
    line(netBottomLeftX + (3*quadOffset)/10, (7*courtHeight)/10 + netWidth, netBottomLeftX + (3*quadOffset)/10, (7*courtHeight)/10);
    line(netBottomLeftX + (4*quadOffset)/10, (6*courtHeight)/10 + netWidth, netBottomLeftX + (4*quadOffset)/10, (6*courtHeight)/10);
    line(netBottomLeftX + (6*quadOffset)/10, (4*courtHeight)/10 + netWidth, netBottomLeftX + (6*quadOffset)/10, (4*courtHeight)/10);
    line(netBottomLeftX + (7*quadOffset)/10, (3*courtHeight)/10 + netWidth, netBottomLeftX + (7*quadOffset)/10, (3*courtHeight)/10);
    line(netBottomLeftX + (8*quadOffset)/10, (2*courtHeight)/10 + netWidth, netBottomLeftX + (8*quadOffset)/10, (2*courtHeight)/10);
    line(netBottomLeftX + (9*quadOffset)/10, courtHeight/10 + netWidth, netBottomLeftX + (9*quadOffset)/10, courtHeight/10);
  
    stroke(245);
  
    strokeWeight(4);
    line(netTopLeftX, netTopLeftY, netBottomLeftX, netBottomLeftY);
    // ligne au milieu du filet
    line(width * 0.5, height * 0.5, width * 0.5, height * 0.5 - netWidth)
    stroke(54);
    // poste gauche
    line(netBottomRightX, netBottomRightY, netBottomLeftX, netBottomLeftY);
  
    // poste droite
    strokeWeight(3);
    line(netTopRightX, netTopRightY, netTopLeftX, netTopLeftY);
  }
  
  function drawScore() {
    textSize(height * 0.1);
    noStroke();
    fill(54);
    textAlign(RIGHT);
    text(leftPlayerScore, padding + quadOffset + (courtWidth * 0.25), padding - 10); // score du joueur
    textAlign(LEFT);
    text(rightPlayerScore, width - padding - (courtWidth * 0.25), padding - 10); // score du joueur de l'ordinateur
  }
            