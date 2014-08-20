enchant();

var GAME_HEIGHT = 480;

//メインプログラム
window.onload = function() {
    //ゲームオブジェクトの生成
    core = new enchant.levelapp.Core(320, GAME_HEIGHT);
    core.rootScene.backgroundColor = "rgb(80,239,255)";
    core.gameId = "111111";

    //画像の読み込み
    core.preload( './img/start.png'
      , './img/end.png'
      , './img/cogoo.png'
      , './img/map9.png'
    );

    //ゲーム開始
    core.gameStart(PlayScene);
}
