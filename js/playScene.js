
//プレイ画面
var PlayScene = enchant.Class.create(enchant.Scene, {
  initialize : function() {
    enchant.Scene.call(this);
    this.core = enchant.Core.instance;

    this.field = new Field();
    this.field.x = 0;
    this.field.y = 0;
    this.addChild(this.field);

    //タッチアクションの割り当て
    this.initTouchAction();
  },

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



//フィールドオブジェクト
var Field = enchant.Class.create(enchant.Group, {
  initialize : function() {
    this.core = enchant.Core.instance;
    enchant.Group.call(this, this.core.width, this.core.height);

    //初期マップの生成
    this.map = new Array(21);
    this.floorLen = 0; //床の長さ
    for (var i = 0; i < 21; i++) {
      this.map[i] = new Sprite(16, GAME_HEIGHT-96);
      this.map[i].image = this.core.assets['./img/map9.png'];
      this.map[i].x = i * 16;
      this.map[i].y = GAME_HEIGHT-96;
      this.addChild(this.map[i]);
    }

    //クマさんの生成
    this.cogoo = new Koguma();
    this.cogoo.x = 32;
    this.cogoo.y = GAME_HEIGHT-128;
    this.cogoo.jumpPow = -1; //ジャンプ力
    this.cogoo.jumpAble = true; //ジャンプ可
    this.addChild(this.cogoo);

    //スコアラベルの生成
    this.scoreLabel = new ScoreLabel(5, 5);
    this.addChild(this.scoreLabel);

    //フレームごと処理の割り当て
    this.addEventListener(Event.ENTER_FRAME, function() {
      this.enterFrame();
    });

  },

  //タッチ開始時の処理
  onTouchStart : function() {
    if (this.cogoo.jumpAble) {
      this.cogoo.jumpAble = false;
      this.cogoo.jumpPow = 20;
    }
  },

  //タッチ中のドラッグ処理
  onTouchMove : function() {
  },

  //タッチ終了時の処理
  onTouchEnd : function() {
    if (this.cogoo.jumpPow > 0) {
      this.cogoo.jumpPow = 0;
    }
  },

  //フレーム単位で行われる処理
  enterFrame : function() {
    //スコアの加算
    this.scoreLabel.score++;

    //マップのスクロール
    for (var i = 0; i < 21; i++) {
      this.map[i].x -= 4;
    }

    if (this.map[0].x == -16) {
      //マップのシフト
      for (var i = 0; i < 21; i++) {
        this.map[i].x += 16;
        if (i < 21 - 1) this.map[i].y = this.map[i + 1].y;
      }
      //新規マップの高さの計算
      if (this.floorLen > 0) {
        this.floorLen--;
        this.map[21 - 1].y = this.map[22 - 2].y;
      } else if (this.map[21 - 2].y == GAME_HEIGHT) {
      	var len_base = Math.floor((3000-this.scoreLabel.score)/500);
      	if( len_base<1 ) len_base = 1;
        this.floorLen = len_base + rand(3);
        this.map[21 - 1].y = GAME_HEIGHT - 16 * (5 + rand(8));
      } else {
        this.floorLen = 1 + rand(5);
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
      this.cogoo.y -= this.cogoo.jumpPow;
      this.cogoo.jumpPow--;
    }
    //下降
    else {
      this.cogoo.y -= this.cogoo.jumpPow;
      this.cogoo.jumpPow--;
      this.cogoo.jumpAble = false;
      if (this.map[3].y != GAME_HEIGHT && this.cogoo.y > this.map[3].y - 32) {
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
    enchant.Sprite.call(this, 24, 32);

    this.image = this.core.assets['./img/cogoo.png'];
    this.frame = 0;
    this.walk = [0,1,2,3];

    // animation
    this.addEventListener(Event.ENTER_FRAME, function() {
      this.enterFrame();
    });
  },

  enterFrame : function() {
    //こぐーの画像を切替え
    if (this.jumpAble) {
      this.frame = this.walk[Math.floor(this.core.frame / 2) % 4];
    } else {
      this.frame = 0;
    }
  }
});
