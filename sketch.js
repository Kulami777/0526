let video;
let facemesh;
let handpose;
let predictions = [];
let hands = [];

// 臉部特徵頂點索引
const forehead = [9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 66, 67, 68, 69, 70, 71, 72, 73];
const leftCheek = [126, 127, 128, 129, 134, 135, 136, 137, 147, 148, 149, 150, 151, 152, 164, 165, 166, 167, 168, 169, 170, 171];
const rightCheek = [293, 294, 295, 296, 297, 298, 299, 300, 309, 310, 311, 312, 313, 314, 324, 325, 326, 327, 328, 329, 330, 331];

function setup() {
  createCanvas(640, 480);
  video = createCapture(VIDEO);
  video.size(width, height);
  video.hide();

  // 載入 Facemesh 模型
  facemesh = ml5.facemesh(video, () => {
    console.log('Facemesh 模型已載入');
  });
  facemesh.on('predict', results => {
    predictions = results;
  });

  // 載入 Handpose 模型
  handpose = ml5.handpose(video, () => {
    console.log('Handpose 模型已載入');
  });
  handpose.on('predict', results => {
    hands = results;
  });
}

function draw() {
  background(220);
  image(video, 0, 0, width, height);

  // 臉部紅色圓圈控制
  if (predictions.length > 0) {
    const keypoints = predictions[0].scaledMesh;

    if (hands.length > 0) {
      const gesture = detectGesture(hands[0]);
      let targetPoints = [];

      if (gesture === "rock") {
        targetPoints = forehead;
      } else if (gesture === "scissors") {
        targetPoints = leftCheek;
      } else if (gesture === "paper") {
        targetPoints = rightCheek;
      }

      if (targetPoints.length > 0) {
        drawFeatureCircle(keypoints, targetPoints, color(255, 0, 0));
      }
    }
  }

  // 畫出手部點位
  for (let hand of hands) {
    if (hand.keypoints && hand.annotations) {
      for (let keypoint of hand.keypoints) {
        fill(100, 200, 255); // 統一顏色
        noStroke();
        circle(keypoint.x, keypoint.y, 16);
      }
    }
  }
}

// 判斷剪刀石頭布手勢
function detectGesture(hand) {
  const fingers = hand.annotations;

  // 只偵測這幾根主要手指（不含 thumb）
  const fingerNames = ["indexFinger", "middleFinger", "ringFinger", "pinky"];
  const extendedFingers = fingerNames.filter(finger => {
    const tip = fingers[finger]?.[3];
    const dip = fingers[finger]?.[2];
    return tip && dip && tip[1] < dip[1]; // y 軸越小表示手指越高
  }).length;

  if (extendedFingers === 0) return "rock";
  if (extendedFingers === 2) return "scissors";
  if (extendedFingers >= 4) return "paper"; // 至少四根手指伸直視為布
  return "unknown";
}

// 繪製指定的臉部點位圓圈
function drawFeatureCircle(keypoints, points, circleColor) {
  noFill();
  stroke(circleColor);
  strokeWeight(4);

  for (let i of points) {
    const point = keypoints[i];
    if (!point) continue;
    const [x, y] = point;
    ellipse(x, y, 20, 20);
  }
}
