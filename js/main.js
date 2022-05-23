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
let time = 10;
let checkInterval;
let level = 0.5;
let URL;

let createWords;

/* モーダル出力関数、言語設定関数、resizeイベントを実行*/
function init() {
  visibleModal();
  language();
  window.addEventListener('resize', resize);
}

/* モーダルを出力コード */
function visibleModal() {
  const displayModal = document.querySelector('.start');
  displayModal.click();
}

/* 言語設定 */
function language() {
  if (JP.checked) {
    URL = `https://random-word.ryanrk.com/api/jp/word/random/${
      level * 200 // ランダム単語100個の中で６桁以下
    }`;
  } else if (EN.checked) {
    URL = `https://random-word-api.herokuapp.com/word?number=${
      level * 300 // ランダム単語150個の中で10桁以下
    }`;
  }
}

/* Resizeによって、Cavasのサイズが動的に変わる。 */
function resize() {
  canvas.width = window.innerWidth; // ブラウザの幅
  canvas.height = window.innerHeight; // ブラウザの高さ
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
  isPlaying = true;
  getWords(); // プログラムが始まると、getWords関数が実行し、単語をサーバーから持ってくる。
  wordInput.addEventListener('input', checkMatch);
  wordInput.addEventListener('keydown', checkMatch);
  wordInput.addEventListener('keydown', enterEvent);
  wordInput.removeAttribute('disabled'); // .word-inputのdiabled属性を削除
  wordInput.placeholder = '';

  animate(); // animate関数を実行

  createWords = setInterval(() => {
    createWord();
  }, 6000); // 6秒ずつcreateWord()実行。

  checkInterval = setInterval(checkStatus, 50); // プログラムが実行中にisPlayingの状態を確認

  startTime = Date.now(); // 現在のDateを定義
}

/* ゲームを終了する */
function checkStatus() {
  if (missings.length === 30 || updateTimer() === 0) {
    // 30個ミスまたは、時間切れし
    wordInput.setAttribute('disabled', '');
    isPlaying = false;
    clearInterval(checkInterval);
  }
}

/* axiosライブラリーを使い、単語をOpen APIで持ってくる */
let words = [];
function getWords() {
  axios
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

/* 毎秒、「ゲーム終了＆スコア＆単語生成」 */
const resetBtn = document.querySelector('.reset-btn');
const colors = ['#ff006e', '#14213d', '#8338ec', '#606c38']; // カラーセット
let wordArray = [];
function animate() {
  const currentWordCount = document.querySelector('.word-count');
  const currectCount = document.querySelector('.count');
  const currectScore = document.querySelector('.score');
  const tryCount = document.querySelector('.try-count');
  const life = document.querySelector('.life');
  const timerLabel = document.querySelector('.time');

  ctx.clearRect(0, 0, canvas.width, canvas.height); // canvasで書いたもの消す。残像をなくすため

  if (!isPlaying) {
    // isPlayingがcheckStatus()によってfalseの時
    ctx.beginPath();
    ctx.font = '10vw Noto Sans JP';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = colors[0];
    ctx.fillText(' GAME OVER', innerWidth / 2, innerHeight / 2 - 60);

    timeLimit = 0;
    resetBtn.classList.remove('invisible'); //やり直しボタンが見えるようになる。
    wordInput.value = '';
    return; // animate()が止まる
  }

  /* requestAnimationFrameが１秒で６０回実行する*/
  requestAnimationFrame(animate);
  for (let i = 0; i < wordArray.length; i++) {
    wordArray[i].update(); // それぞれのclass Wordにあるメソッドupdate()を実行。
  }

  /* HTMLにそれぞれのスコアを出力する */
  life.innerHTML = `Life : ${30 - missings.length}`;
  tryCount.innerHTML = `Try : ${tryArray.length}`;
  currectCount.innerHTML = `Level : ${count}`; // count出力
  currectScore.innerHTML = `Score : ${score}`; // score出力
  currentWordCount.innerHTML = `Word : ${words.length}`; // Word出力
  timerLabel.innerHTML = `Time   ${updateTimer()}`;
}

/* 単語を作るcreateWord()関数はそれぞれのclassを生成 */
let oldWords = [];
function createWord() {
  words = words.slice(0, 60); // getWords()からもらった配列の長さを60個にする。
  /* 単語を 3個ずつ作る*/
  for (let i = 0; i < 3; i++) {
    const distance = Math.random() * i + 150;
    let x = (canvas.width / 3) * i + distance; // 初期x座標
    let y = 60; // 初期y座標
    let dy = Math.random() * 0.5 + (Math.random() * level + speed); // 初期y軸の速度

    wordArray.push(new Word(x, y, dy, distance, words[0])); // class Wordを生成し、wordArrayに入れて配列に作る。
    oldWords.push(words.shift()); // サーバーからもらった単語のwords配列の要素を最初から次々とoldWordsに入れる。
  }

  /*  run()で実行しているcreateWordsが、単語６０個が全部出たら終わる。 */
  if (wordArray.length === 60) {
    clearInterval(createWords);
  }
}

/* classでWordを作る */
let missings = [];
class Word {
  constructor(x, y, dy, distance, word) {
    this.x = x; // x座標
    this.y = y; // ｙ座標
    this.dy = dy; // 横の速度
    this.distance = distance; // 領域
    this.word = word;
    this.color = colors;
  }

  /* 表示メソッド */
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

  /* y軸追加速度を移動させ、持続的にcanvasに表示するメソッド */
  update() {
    /* 画面から消えたらmissings配列に落ちた単語を入れる */
    if (this.y > innerHeight) {
      missings.push(this.word);
      /* update()はanimate()から呼び出しているので、missingsの要素の中腹を削除する。 */
      missings = missings.filter((element, index) => {
        return missings.indexOf(element) === index;
      });
    }
    this.y += this.dy; //ｙ座標が落ちていく
    this.draw(); // draw()呼び出し
    wordInput.focus(); // input tegに書けるようにする
  }
}

/* タイマー関数を実装 */
let timeLimit = time * 1000;
let startTime;
function updateTimer() {
  let timeLeft = startTime + timeLimit - Date.now();
  const timeoutId = setTimeout(() => {
    updateTimer();
  }, 50);

  /* 時間切れの時、0になったtimeLeftをreturnする。 */
  if (timeLeft <= 0) {
    timeLeft = 0;
    clearTimeout(timeoutId);
    return timeLeft;
  }
  /* 小数点２桁までtimeLeftを1000で割った値をreturnする。 */
  return (timeLeft / 1000).toFixed(2);
}

/* 正解か不正解か判別して処理する関数 */
let tryArray = [];
let answers = [];
function checkMatch(e) {
  /* Enterを入力したら、実行 */
  if (e.keyCode == 13) {
    tryArray.push(wordInput.value); // tryArrayに入力した値を入れる。

    /* missings配列に入力した値があるかどうか確認 */
    if (missings.includes(wordInput.value)) {
      alert('すでに過ぎ去った単語です。');

      /* 画面に表示されている単語oldWords配列に入力した値があるかどうか確認 */
    } else if (oldWords.includes(wordInput.value)) {
      answers.push(wordInput.value); // 答えの配列answersに入力した値を入れる。
      count++; // 正解なら1追加
      speed += 0.05; // スピード追加で難易度増加
      startTime = Date.now(); // 時間を初期化

      /* oldWordsに入力した値のindexを変換して、wordArrayのwordをinputValueに入れる */
      let inputValue = wordArray[oldWords.indexOf(wordInput.value)].word;
      /* 答えを🌞に変える */
      wordArray[oldWords.indexOf(wordInput.value)].word = `🌞`;

      /* 桁数によるスコア*/
      if (EN.checked) {
        if (inputValue.length >= 8) {
          score += 100;
        } else if (inputValue.length >= 6) {
          score += 50;
        } else if (inputValue.length >= 4) {
          score += 30;
        } else {
          score += 10;
        }
      } else {
        if (inputValue.length > 4) {
          score += 100;
        } else if (inputValue.length > 3) {
          score += 50;
        } else if (inputValue.length >= 2) {
          score += 30;
        } else {
          score += 10;
        }
      }

      /*[正解] input tegにhtml classの「is-valid」を追加 */
      wordInput.classList.remove('is-invalid');
      wordInput.classList.add('is-valid');
      wordInput.value = '';

      /* answers配列にすでに正解が入っている場合 */
    } else if (answers.includes(wordInput.value)) {
      alert('すでに正解として入力しました。');

      /* [不正解] input tegにhtml classの「is-invalid」を追加 */
    } else {
      wordInput.classList.remove('is-valid');
      wordInput.classList.add('is-invalid');
    }
  }
}

/* 入力するときEnterを押すとvalueの値が初期化 */
function enterEvent(e) {
  if (e.keyCode == 13) {
    wordInput.value = '';
  }
}

init(); // init関数の呼び出し
