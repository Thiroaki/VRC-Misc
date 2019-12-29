# 設計
MVPのMとPが一緒になった

`base.js`はページの切り替えやページIDのリスト保持を行う。  

`View`はUIの表示やイベントの設定だけをする。Presenterにイベントの処理を投げる。  

`Presenter`はViewからのイベントを受けてデータ取得等の処理を実行する。データを表示用に整形してViewに返す。サイドバーのアイコンやタイトルもここで持つ。

Viewは関数をmoduleとしてexportし、Presenterがそれをrequireして使用する。
base.jsがHTMLにscriptタグとしてロードする。
そのため各ページで起動時にデータを取得したり出来る。

UIイベントはbase.htmlにしか設定出来ないので、`$(document).on("click", "{セレクタ}", ()=>{})`を使う。

# 流れ
最初に`/base/base.html`が表示され、同時に`base.js`がロードされる。
base.jsが各ページのPresenterをHTMLにロードする。
UIイベントを設定したりデータを取得する。
base.jsがページを表示する。

# ページIDについて
IDは被り無く決めること  
base/page/ 以下のディレクトリ名とサブファイルの名前はIDと同じにすること  



