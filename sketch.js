let video;
let facemesh;
let handPose;
let predictions = [];
let hands = [];

// 定義臉部特徵點的陣列
const forehead = [9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 66, 67, 68, 69, 70, 71, 72, 73];
const leftCheek = [126, 127, 128, 129, 134, 135, 136, 137, 147, 148, 149, 150, 151, 152, 164, 165, 166, 167, 168, 169, 170, 171];
const rightCheek = [293, 294, 295, 296, 297, 298, 299, 300, 309, 310, 311, 312, 313, 314, 324, 325, 326, 327, 328, 329, 330, 331];

function setup() {
  createCanvas(640, 480).position(
    (windowWidth - 640) / 2,
    (windowHeight - 480) / 2
  );
  video = createCapture(VIDEO);
  video.size(width, height);
  video.hide();

  // 初始化 Facemesh 與 HandPose 模型
  facemesh = ml5.facemesh(video, modelReady);
  facemesh.on('predict', results => {
    predictions = results;
  });

  handPose = ml5.handPose(video, { flipped: true }, modelReady);
  handPose.on('predict', results => {
    hands = results;
  });
}

function modelReady() {
  console.log('模型載入完成');
}

function draw() {
  image(video, 0, 0, width, height);

  // 畫出鼻子的紅色圓
  if (predictions.length > 0) {
    const keypoints = predictions[0].scaledMesh;

    // 根據手勢移動紅色圓圈
    if (hands.length > 0) {
      const gesture = detectGesture(hands[0]);
      let targetPoints = [];

      if (gesture === "rock") {
        targetPoints = forehead; // 石頭 -> 額頭
      } else if (gesture === "scissors") {
        targetPoints = leftCheek; // 剪刀 -> 左臉頰
      } else if (gesture === "paper") {
        targetPoints = rightCheek; // 布 -> 右臉頰
      }

      if (targetPoints.length > 0) {
        drawFeatureCircle(keypoints, targetPoints, color(255, 0, 0));
      }
    }
  }

  // 畫出手勢辨識的點
  if (hands.length > 0) {
    for (let hand of hands) {
      if (hand.confidence > 0.1) {
        for (let keypoint of hand.keypoints) {
          // 根據左右手設定顏色
          fill(hand.handedness === "Left" ? color(255, 0, 255) : color(255, 255, 0));
          noStroke();
          circle(keypoint.x, keypoint.y, 16);
        }
      }
    }
  }
}

// 根據手勢辨識結果判斷剪刀石頭布
function detectGesture(hand) {
  const fingers = hand.annotations;
  const extendedFingers = Object.keys(fingers).filter(finger => {
    const tip = fingers[finger][3]; // 指尖
    const dip = fingers[finger][2]; // 第二關節
    return tip[1] < dip[1]; // 指尖高於第二關節
  }).length;

  if (extendedFingers === 0) return "rock"; // 石頭
  if (extendedFingers === 2) return "scissors"; // 剪刀
  if (extendedFingers === 5) return "paper"; // 布
  return "unknown";
}

// 繪製紅色圓圈於指定的臉部特徵點
function drawFeatureCircle(keypoints, points, circleColor) {
  noFill();
  stroke(circleColor);
  strokeWeight(4);

  for (let i of points) {
    const [x, y] = keypoints[i];
    ellipse(x, y, 20, 20);
  }
}
