# 概要
DIscord bot x youtubeDataApi

ディスコードにyoutubeのリンクを貼ったら自動で再生リストに追加してくれるbot

# 事前準備
事前にYoutubeのチャンネルを作成して空のプレイリストを作成してください

youtubeDataApiを利用するのに必要な設定を済ませてから、`client_secret.json`をダウンロードしてプロジェクトフォルダに配置してください

[GoogleAPIs](https://console.developers.google.com/)

[公式ドキュメント](https://developers.google.com/youtube/registering_an_application?hl=ja)

# インストール
`git clone`が完了したらこのプロジェクトに移動してください
```
$ cd project_name
```

```
$ npm install
```

`config.json`にdiscord botのトークンとyoutubeのプレイリストIDを入力してください


# 実行
```
$ node main.js
```
