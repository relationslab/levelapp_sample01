(function() {

  var BASE_URL = "http://levelapp-env.elasticbeanstalk.com/"
  //var BASE_URL = "http://localhost:1337/"

  enchant.levelapp = {assets: ['./start.png', './end.png']};

  enchant.levelapp.Core = enchant.Class.create(enchant.Core, {
    initialize : function(width, height) {
      enchant.Core.call(this, width, height);

      this.preload(enchant.levelapp.assets);
    },
    gameStart : function(gameSceneClass) {
      this.start();

      this.gameSceneClass = gameSceneClass;

      this.addEventListener('load', function() {
        var titleScene = new enchant.levelapp.TitleScene();
        this.pushScene(new gameSceneClass());
        this.pushScene(titleScene);
      });
    },
    retry : function() {
      while (this.currentScene !== this.rootScene) {
        this.popScene();
      }

      var titleScene = new enchant.levelapp.TitleScene();
      this.pushScene(new this.gameSceneClass());
      this.pushScene(titleScene);
    },
    gameover: function(score) {
      var endScene = new enchant.levelapp.EndScene(score);
      this.pushScene(endScene);
    },
  });

  enchant.levelapp.TitleScene = enchant.Class.create(enchant.Scene, {
    initialize : function() {
      enchant.Scene.call(this);
      this.core = enchant.Core.instance;

      var title = new Sprite(236, 48);
      title.image = this.core.assets['./start.png'];
      title.x = (this.core.width - title.width) / 2;
      title.y = (this.core.height - title.height) / 2;
      this.addChild(title);

      this.addEventListener(Event.TOUCH_END, function() {
        this.core.popScene();
      });
    }
  });

  enchant.levelapp.EndScene = enchant.Class.create(enchant.Scene, {
    initialize : function(score) {
      enchant.Scene.call(this);
      this.core = enchant.Core.instance;

      var background = new Surface(this.core.width, this.core.height);
      background.context.globalAlpha = 0.5;
      background.context.fillStyle = 'Black';
      background.context.fillRect(0, 0, background.width, background.height);
      this.addChild(background);

      var title = new Sprite(189, 97);
      title.image = this.core.assets['./end.png'];
      title.x = (this.core.width - title.width) / 2;
      title.y = 20;
      this.addChild(title);

      var textBox = new InputTextBox();
      textBox.x = 30;
      textBox.y = 140;
      textBox.placeholder = "名前を入力してください";
      this.addChild(textBox);

      var sendButton = new enchant.ui.Button("スコアを送信", 'light', textBox.height, 100);
      sendButton.x = textBox.x + textBox.width + 20;
      sendButton.y = 140;
      this.addChild(sendButton);

      var self = this;
      var sending = false;
      sendButton.addEventListener(Event.TOUCH_END, function() {
        if (textBox.value && !sending) {
          sending = true;
          self.postScore(score, textBox.value);
        }
      });

      var retryButton = new enchant.ui.Button("リトライ", "light", 30, 150);
      retryButton.x = (this.core.width - retryButton.width) / 2;
      retryButton.y = this.core.height - 80;
      this.addChild(retryButton);

      retryButton.addEventListener(Event.TOUCH_END, function() {
        self.core.retry();
      });

      this.getScores();
    },
    getScores : function() {
      var self = this;
      $.ajax({
        type: 'GET',
        url: BASE_URL + 'score',
        data : {
          gameId : this.core.gameId
        },
        dataType: 'json',
        success : function(res) {
          self.showHighScore(res);
        },
        error : function() {
          alert("ハイスコアの取得に失敗しました");
        }
      });
    },
    postScore : function(score, name) {
      var self = this;
      $.ajax({
        type: 'POST',
        url: BASE_URL + 'score',
        data: {
          user_name : name,
          score : score,
          gameId : this.core.gameId
        },
        dataType: 'json',
        success : function() {
          alert("スコアを送信しました");
        },
        error : function() {
          alert("スコアの送信に失敗しました");
        }
      });
    },
    showHighScore : function(scores) {
      scores.sort(function(a, b) {
        if (a.score < b.score) return 1;
        if (a.score > b.score) return -1;
        return 0;
      });

      var highScore = new Label("ハイスコア");
      highScore.x = 20;
      highScore.y = 200;
      highScore.font = "20px serif";
      this.addChild(highScore);

      for (var i = 0; i < scores.length && i < 3; i++) {
        if (scores[i].score) {
          var label = new Label((i + 1) + "位 : " + scores[i].score + "点 / " + scores[i].userName);
          label.x = 30;
          label.y = highScore.y + highScore.height + (i + 1) * 30;
          this.addChild(label);
        }
      }
    }
  });

  enchant.levelapp.util = {
    rand : function(num) {
      return Math.floor(Math.random() * num);
    },
    rateOf : function(num) {
      return rand(num);
    }
  };
})();
