let video;
let facemesh;
let handPose;
let predictions = [];
let hands = [];

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

    // 鼻子點 (第94點)
    const [x, y] = keypoints[94];
    noFill();
    stroke(255, 0, 0);
    strokeWeight(4);
    ellipse(x, y, 100, 100);
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
