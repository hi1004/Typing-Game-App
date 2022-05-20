'use strict';
const canvas = document.querySelector('canvas');
const wrap = document.querySelector('.wrap');
canvas.width = wrap.offsetWidth;
canvas.height = window.innerHeight;
const ctx = canvas.getContext('2d');
/* .count teg*/
const correctCount = document.querySelector('.count');
/* .score teg */
const correctScore = document.querySelector('.score');

let speed = 0;
let count = 0;
let score = 0;
let answers = [];

/* モーダルを隠す（Enter, ESCで）*/
const modal = document.getElementById('modal');
const modalEnter = new bootstrap.Modal(modal);
function modalKeyEvent() {
  const keyCode = event.keyCode;
  if (keyCode === 13 || keyCode === 27) {
    modalEnter.hide(); // 条件に合うキーを入力し、モダールが見えなくなる。
    run(); // ゲームを実行する関数
  }
}

/* プログラムを実行する関数 => この関数はHTMLの modalのボタンと modalKeyEvent()で実行 */
const wordInput = document.querySelector('.word-input');
let isPlaying = false;
function run() {
  getWords(); // プログラムが始まると、getWords関数が実行し、単語をサーバーから持ってくる。
  if (isPlaying) {
    return;
  }
  isPlaying = true; // ゲームを始める
  wordInput.removeAttribute('disabled'); // .word-inputのdiabled属性を削除
  animate(); // animate関数を実行
}

/* axiosライブラリーを使い、単語をOpen APIで持ってくる */
let words = [];
let level = 0.5;
function getWords() {
  const URL = `https://random-word-api.herokuapp.com/word?number=${
    level * 100 // ランダム単語50個を持ってくる
  }`;
  axios
    .get(URL)
    .then(res => {
      res.data.forEach(word => {
        words.push(word); // 各単語を配列に入れる
      });
      init(); // class 「Word」を作る関数を実行する。
    })

    // もし、エラーが発生したらerror内容をコンソールに教えてくれる。
    .catch(error => {
      console.log(error);
    });
}

/* 単語を作るinit()関数はそれぞれのclassを生成 */
let oldWords = [];
let wordArray = [];
const createWords = setInterval(() => {
  init();
}, 5000); // 5秒ずつinit()実行。

function init() {
  for (let i = 0; i < Math.floor(words.length / i + 5); i++) {
    const distance = Math.random() * 10 + 150;
    let x = Math.random() * (innerWidth - distance * 2) + distance; // 初期ｘ座標
    let y = 0; // 初期y座標
    let dy = Math.random() * 1 + (level + speed); // 初期y軸の速度

    wordArray.push(new Word(x, y, dy, distance, words[0])); // class Wordを生成し、wordArrayに入れて配列に作る。
    oldWords.push(words.shift()); // サーバーからもらった単語のwords配列の要素を最初から次々と入れる。
  }
  if (wordArray.length === 50) {
    clearInterval(createWords); // 単語５０個が全部出たら、終わる。
  }
}
/* requestAnimationFrameが１秒で６０回実行する*/
function animate() {
  requestAnimationFrame(animate);
  ctx.clearRect(0, 0, canvas.width, canvas.height); // canvasで書いたもの消す。残像をなくすため
  for (let i = 0; i < wordArray.length; i++) {
    wordArray[i].update(); // それぞれのclass Wordにあるメソッドupdate()を実行。
  }
  correctCount.innerHTML = `Count : ${count}`; // count出力
  correctScore.innerHTML = `Score : ${score}`; // score出力
}

/* classでWordを作る */
const colors = ['#FF595E', '#F46036', '#1B998B', '#8E9AAF']; // カラーセット
class Word {
  constructor(x, y, dy, distance, word) {
    this.x = x; // x座標
    this.y = y; // ｙ座標
    this.dy = dy; // 横の速度
    this.distance = distance; // 領域
    this.word = word;
    this.color = colors;
  }

  /* 書くメソッド */
  draw() {
    ctx.beginPath();
    ctx.font = '30px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    /* 桁数による色変わり */
    if (this.word.length > 10) {
      ctx.fillStyle = '#ff0000';
    } else if (this.word.length > 8) {
      ctx.fillStyle = this.color[1];
    } else if (this.word.length > 5) {
      ctx.fillStyle = this.color[2];
    } else {
      ctx.fillStyle = this.color[3];
    }
    ctx.fillText(this.word, this.x, this.y);
  }

  /* y軸に追加速度で移動させ、持続的にcanvasに書くメソッド */
  update() {
    this.y += this.dy;
    this.draw();
    wordInput.focus();
  }
}

wordInput.addEventListener('input', checkMatch);
wordInput.addEventListener('keydown', enterEvent);
const startBtn = document.querySelector('.start');
window.addEventListener('load', () => {
  startBtn.click();
  wordInput.focus();
});

function checkMatch() {
  if (answers.includes(wordInput.value)) {
    alert('이미 정답으로 입력했습니다.');
    wordInput.value = '';
  } else if (oldWords.includes(wordInput.value)) {
    count++;
    answers.push(wordInput.value);
    let inputValue = wordArray[oldWords.indexOf(wordInput.value)].word;
    if (inputValue.length > 10) {
      score += 100;
    } else if (inputValue.length > 8) {
      score += 50;
    } else if (inputValue.length > 5) {
      score += 30;
    } else {
      score += 10;
    }
    wordArray[oldWords.indexOf(wordInput.value)].word = '';
    wordInput.value = '';
    speed += 0.1;
  }
}
function enterEvent(e) {
  if (e.keyCode == 13) {
    wordInput.value = '';
  }
}

/* Resizeによって、Cavasのサイズが動的に変わる。 */
window.addEventListener('resize', () => {
  canvas.width = window.innerWidth; // ブラウザの幅
  canvas.height = window.innerHeight; // ブラウザの高さ
});
