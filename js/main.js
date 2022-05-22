'use strict';
const canvas = document.querySelector('canvas');
const wrap = document.querySelector('.wrap');
canvas.width = wrap.offsetWidth;
canvas.height = window.innerHeight;
const ctx = canvas.getContext('2d');
const JP = document.querySelector('#japanese');
const EN = document.querySelector('#english');

let speed = 0;
let count = 1;
let score = 0;
let answers = [];
let tryArray = [];
let level = 0.5;
let URL = `https://random-word.ryanrk.com/api/jp/word/random/${
  level * 100 // ランダム単語50個を持ってくる
}`;

/* モーダルを出力 */
function init() {
  visibleModal();
  language();
  wordInput.addEventListener('input', checkMatch);
  wordInput.addEventListener('keydown', checkMatch);
  wordInput.addEventListener('keydown', enterEvent);
  window.addEventListener('resize', resize);
}

function visibleModal() {
  const displayModal = document.querySelector('.start');
  displayModal.click();
}

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

  isPlaying = true; // ゲームを始める
  wordInput.removeAttribute('disabled'); // .word-inputのdiabled属性を削除
  wordInput.placeholder = '';
  animate(); // animate関数を実行
}

/* axiosライブラリーを使い、単語をOpen APIで持ってくる */

let sliceWords = [];

let words = [];
async function getWords() {
  await axios
    .get(URL)
    .then(res => {
      res.data.forEach(word => {
        if (JP.checked) {
          if (word.length <= 6) {
            words.push(word); // 各単語を配列に入れる
          }
        } else {
          if (word.length <= 10) {
            words.push(word); // 各単語を配列に入れる
          }
        }
      });
      createWord(); // class 「Word」を作る関数を実行する。
    })

    // もし、エラーが発生したらerror内容をコンソールに教えてくれる。
    .catch(error => {
      console.log(error);
    });
}

/* 単語を作るcreateWord()関数はそれぞれのclassを生成 */
let oldWords = [];
let wordArray = [];

const createWords = setInterval(() => {
  createWord();
}, 8000); // 5秒ずつcreateWord()実行。

function createWord() {
  words = words.slice(0, 50);
  for (let i = 0; i < 5; i++) {
    const distance = Math.random() * i + 150;
    let x = (canvas.width / 5) * i + distance;
    let y = 0; // 初期y座標
    let dy = Math.random() * 0.1 + (Math.random() * level + speed); // 初期y軸の速度

    wordArray.push(new Word(x, y, dy, distance, words[0])); // class Wordを生成し、wordArrayに入れて配列に作る。
    oldWords.push(words.shift()); // サーバーからもらった単語のwords配列の要素を最初から次々と入れる。
  }

  if (wordArray.length === 50) {
    clearInterval(createWords); // 単語５０個が全部出たら、終わる。
  }
}

function animate() {
  /* requestAnimationFrameが１秒で６０回実行する*/
  const currentWordCount = document.querySelector('.word-count');
  /* .count teg*/
  const currectCount = document.querySelector('.count');
  /* .score teg */
  const currectScore = document.querySelector('.score');

  const tryCount = document.querySelector('.try-count');
  requestAnimationFrame(animate);

  ctx.clearRect(0, 0, canvas.width, canvas.height); // canvasで書いたもの消す。残像をなくすため
  for (let i = 0; i < wordArray.length; i++) {
    wordArray[i].update(); // それぞれのclass Wordにあるメソッドupdate()を実行。
  }
  tryCount.innerHTML = `Try : ${tryArray.length}`;
  currectCount.innerHTML = `Level : ${count}`; // count出力
  currectScore.innerHTML = `Score : ${score}`; // score出力
  currentWordCount.innerHTML = `Word : ${words.length}`; // Word出力
}

/* classでWordを作る */
const colors = ['#ff006e', '#14213d', '#8338ec', '#606c38']; // カラーセット
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
    ctx.font = '30px Noto Sans JP';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    if (JP.checked) {
      /* 桁数による色変わり 6~1*/
      if (this.word.length > 4) {
        ctx.fillStyle = this.color[0];
      } else if (this.word.length > 3) {
        ctx.fillStyle = this.color[1];
      } else if (this.word.length >= 2) {
        ctx.fillStyle = this.color[2];
      } else {
        ctx.fillStyle = this.color[3];
      }
    } else {
      if (this.word.length >= 8) {
        ctx.fillStyle = this.color[0];
      } else if (this.word.length >= 6) {
        ctx.fillStyle = this.color[1];
      } else if (this.word.length >= 4) {
        ctx.fillStyle = this.color[2];
      } else {
        ctx.fillStyle = this.color[3];
      }
    }

    ctx.fillText(this.word, this.x, this.y);
  }

  /* y軸追加速度を移動させ、持続的にcanvasに書くメソッド */
  update() {
    this.y += this.dy;
    this.draw();
    wordInput.focus();
  }
}

function checkMatch(e) {
  if (e.keyCode == 13) {
    tryArray.push(wordInput.value);
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
      speed += 0.05;
      wordInput.classList.remove('is-invalid');
      wordInput.classList.add('is-valid');
      wordInput.value = '';
    } else {
      wordInput.classList.remove('is-valid');
      wordInput.classList.add('is-invalid');
    }
  }
}

function enterEvent(e) {
  if (e.keyCode == 13) {
    wordInput.value = '';
  }
}

/* Resizeによって、Cavasのサイズが動的に変わる。 */
function resize() {
  canvas.width = window.innerWidth; // ブラウザの幅
  canvas.height = window.innerHeight; // ブラウザの高さ
}

function language() {
  if (JP.checked) {
    URL = `https://random-word.ryanrk.com/api/jp/word/random/${
      level * 200 // ランダム単語50個を持ってくる
    }`;
  } else if (EN.checked) {
    URL = `https://random-word-api.herokuapp.com/word?number=${
      level * 200 // ランダム単語50個を持ってくる
    }`;
  }
}

init();
