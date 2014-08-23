
//ゲームに必要なライブラリの初期化
enchant();

//ゲームで使用する定数値
//定数値はすべて大文字で書きましょう（規約として）
var GAME_WIDTH = 320;
var GAME_HEIGHT = 480;

//メインプログラム
window.onload = function() {
    //ゲームオブジェクトの生成
    core = new enchant.levelapp.Core(GAME_WIDTH, GAME_HEIGHT);

    //ゲームの背景色
    core.rootScene.backgroundColor = "rgb(80,239,255)";

    //ゲームID
    //開発するゲームごとに発行されます。必ず変更して下さい。
    //ハイスコアサーバに影響します
    core.gameId = "111111";

    //画像の読み込み
    //使用する画像や音声は、ここで読み込んでおいて下さい
    core.preload( './img/start.png'
      , './img/end.png'
      , './img/cogoo.png'
      , './img/map9.png'
       , './snd/cogoo_voice.mp3'
    );

    //ゲーム開始
    core.gameStart(PlayScene);
}
