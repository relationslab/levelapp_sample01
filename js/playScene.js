
////////////////////////////////////////////////////////////
//----------------------------------------------------------
// プレイ画面用プログラム
// 　基本的にはここを書き換えていきます。
//----------------------------------------------------------

//----------------------------------------------------------
// プレイシーンクラス
//----------------------------------------------------------
var PlayScene = enchant.Class.create(enchant.Scene, {
  //初期化処理
  initialize : function() {
    enchant.Scene.call(this);
    this.core = enchant.Core.instance;

    //フィールドインスタンスを1つ生成
    this.field = new Field();
    this.field.x = 0;
    this.field.y = 0;
    this.addChild(this.field);

    //タッチアクション処理
    this.initTouchAction();
  },

  //タッチアクション処理
  initTouchAction : function() {
    //タッチ開始時の処理
    this.addEventListener(Event.TOUCH_START, function(event) {
      this.field.onTouchStart();
    });

    //タッチ中のドラッグ処理
    this.addEventListener(Event.TOUCH_MOVE, function(event) {
      this.field.onTouchMove();
    });

    //タッチ終了時の処理
    this.addEventListener(Event.TOUCH_END, function(event) {
      this.field.onTouchEnd();
    });
  },
});



//乱数の取得
function rand(num) {
  return Math.floor(Math.random() * num);
}



//----------------------------------------------------------
// フィールドクラス
//----------------------------------------------------------
var Field = enchant.Class.create(enchant.Group, {
  //初期化処理
  initialize : function() {
    this.core = enchant.Core.instance;
    enchant.Group.call(this, this.core.width, this.core.height);

    //初期マップの生成
    this.map = new Array(21);   //横に21列のマップにする
    this.floorLen = 0;          //床長さカウンタ
    for (var i = 0; i < 21; i++) {
      //陸地画像スプライトを生成、高さは下から96pxに置く
      this.map[i] = new Sprite(16, GAME_HEIGHT-96);
      this.map[i].image = this.core.assets['./img/map9.png'];
      this.map[i].x = i * 16;
      this.map[i].y = GAME_HEIGHT-96;
      this.addChild(this.map[i]);
    }

    //クマさんの生成
    this.cogoo = new Koguma();
    this.cogoo.x = 32;
    this.cogoo.y = GAME_HEIGHT-128;  //高さは下から96+32=128
    this.cogoo.jumpPow = -1;  //ジャンプ力
    this.cogoo.jumpAble = true;  //ジャンプ可
    this.addChild(this.cogoo);

    //スコアラベルの生成
    this.scoreLabel = new ScoreLabel(5, 5);
    this.addChild(this.scoreLabel);

    //フレームごとに呼ばれる関数を設定（初期状態で秒間30回呼ばれる）
    this.addEventListener(Event.ENTER_FRAME, function() {
      this.enterFrame();
    });

  },

  //タッチ開始時の処理
  onTouchStart : function() {
    //ジャンプ出来る状態なら、ジャンプする
    if (this.cogoo.jumpAble) {
      //ジャンプ中なのでジャンプ不能状態にし、初期ジャンプ力を設定
      this.cogoo.jumpAble = false;
      this.cogoo.jumpPow = 20;
      
	  this.cogoo.voice.stop();
	  this.cogoo.voice.play();
    }
  },

  //タッチ中のドラッグ処理
  onTouchMove : function() {
  },

  //タッチ終了時の処理
  onTouchEnd : function() {
    //上昇ジャンプ力をゼロにする→下降が始まる
    if (this.cogoo.jumpPow > 0) {
      this.cogoo.jumpPow = 0;
    }
  },

  //フレームごとに呼ばれる関数
  enterFrame : function() {
    //スコアを1加算
    this.scoreLabel.score++;

    //マップのスクロール
    for (var i = 0; i < 21; i++) {
      //左に少しずつずらしていく
      this.map[i].x -= 4;
    }

    //マップが1マス分ずれたら、新しいマップを作る
    if (this.map[0].x == -16) {
      //マップデータのシフト
      for (var i = 0; i < 21; i++) {
        //X位置は元に戻し、Y位置は隣の座標を受け継ぐ
        this.map[i].x += 16;
        if (i < 21 - 1) this.map[i].y = this.map[i + 1].y;
      }

      //新規マップの高さの計算
      if (this.floorLen > 0) {
        //（１）床長さカウンタがゼロではなく、まだ床が続いている状態
        //次のマップも、前回のマップと同じ高さになるので、
        //高さ情報は隣のマップのものを引き継ぐ
        this.floorLen--;
      } else if (this.map[21 - 2].y == GAME_HEIGHT) {
        //（２）床長さカウンタがゼロ && 前回は谷
        //新しい陸地を作る。床長さカウンタをランダムに作る
        //現在のスコアが大きいほど、床が短くなる設定
      	var len_base = Math.floor((3000-this.scoreLabel.score)/500);
        //最低長さを2とする（randが最低1を返すため）
      	if( len_base<1 ) len_base = 1;
        this.floorLen = len_base + rand(3);
        //陸地の高さをランダムに計算（6?14）
        this.map[21 - 1].y = GAME_HEIGHT - 16 * (5 + rand(8));
      } else {
        //（３）床長さカウンタがゼロ && 前回は陸地
        //新しい谷を作る。床長さカウンタをランダムに作る
        //谷の長さは特にスコアと関係なく作る設定
        this.floorLen = 1 + rand(5);
        //谷の深さは、ゲーム画面の高さと同じ＝画面外に画像が行く
        this.map[21 - 1].y = GAME_HEIGHT;
      }
    }

    //ゲームオーバー判定
    if (this.cogoo.y > this.map[3].y - 20) {
      this.cogoo.frame = 0;
      this.gameover();
    }

    //上昇
    if (this.cogoo.jumpPow >= 0) {
      //残りジャンプ力に応じて、こぐーを上昇させる
      this.cogoo.y -= this.cogoo.jumpPow;
      //残りジャンプ力を1減らす
      this.cogoo.jumpPow--;
    }
    //下降
    else {
      //ジャンプ力がマイナスになる→Y座標が増加する
      this.cogoo.y -= this.cogoo.jumpPow;
      this.cogoo.jumpPow--;
      //自動的にジャンプ不能状態にする
      this.cogoo.jumpAble = false;
      //こぐーが陸地に着地した場合（谷ではない && こぐーY座標が陸地Y座標を超えた）
      if (this.map[3].y != GAME_HEIGHT && this.cogoo.y > this.map[3].y - 32) {
        //こぐーY座標を陸地と同じに設定し、ジャンプ可能状態にする
        this.cogoo.y = this.map[3].y - 32;
        this.cogoo.jumpAble = true;
        this.cogoo.jumpPow = 0;
      }
    }
  },

  //ゲームオーバー処理
  gameover : function() {
    //ゲームオーバー画面へ
    this.core.gameover(this.scoreLabel.score);
  }
});


//こぐーオブジェクト
var Koguma = enchant.Class.create(enchant.Sprite, {
  initialize : function() {
    this.core = enchant.Core.instance;
    enchant.Sprite.call(this, 24, 32);  //24x32のスプライトになる

    //スプライト画像を設定、初期フレームは0
    this.image = this.core.assets['./img/cogoo.png'];
    this.frame = 0;
    
    //声
    this.voice = this.core.assets['./snd/cogoo_voice0.mp3'];
    this.voice.play();
    this.voice.stop();

    //フレームごとに呼ばれる関数を設定（初期状態で秒間30回呼ばれる）
    this.addEventListener(Event.ENTER_FRAME, function() {
      this.enterFrame();
    });
  },

  //フレームごとに呼ばれる関数
  enterFrame : function() {
    //こぐーの画像を切替える（自転車をこぐスプライト）
    if (this.jumpAble) {
      //ジャンプしていない時は、自転車をこぐ。
      //2フレームごとに、0,1,2,3と選択
      this.frame = Math.floor(this.core.frame / 2) % 4;
    } else {
      //足を伸ばしてるフレームに設定
      this.frame = 1;
    }
  }
});
