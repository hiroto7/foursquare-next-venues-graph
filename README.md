# foursquare-next-venues-graph

Foursquare Places API の "[Get Next Venues](https://developer.foursquare.com/docs/api/venues/nextvenues)" に繰り返しリクエストを行い、得られる Venues からグラフを構築する

## Installing
[Node.js](https://nodejs.org/) が必要。
```
npm install -g hiroto7/foursquare-next-venues-graph
```

## Configuration
実行前に、環境変数で `FOURSQUARE_CLIENT_ID` と `FOURSQUARE_CLIENT_SECRET` を設定する必要がある。

下記の内容を `.bash_profile` などに追加する。
もしくは、 [direnv]([hook.md](http://direnv.net)) を使用していれば、
適当なディレクトリに下記内容の `.envrc` ファイルを作成しても良い。
```
export FOURSQUARE_CLIENT_ID=XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
export FOURSQUARE_CLIENT_SECRET=XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

## Usage
### グラフの構築
適当なディレクトリに移動してから、引数に**起点となる Venue の id** を指定して `foursquare-next-venues-graph` コマンドを実行する。以下は [つくば駅](https://foursquare.com/v/%E3%81%A4%E3%81%8F%E3%81%B0%E9%A7%85/4b5522aff964a5206edc27e3) を起点とした場合の例である。
```
$ foursquare-next-venues-graph 4b5522aff964a5206edc27e3
2020-01-29T21:20:28.310Z Tsukuba Station (つくば駅)
2020-01-29T21:20:28.591Z 1 1
2020-01-29T21:20:28.867Z 2 3
2020-01-29T21:20:29.173Z 3 12
2020-01-29T21:20:29.726Z 4 25
2020-01-29T21:20:30.863Z 5 50
2020-01-29T21:20:32.220Z 6 92
2020-01-29T21:20:33.528Z 7 129
2020-01-29T21:20:34.676Z 8 168
2020-01-29T21:20:35.638Z 9 192
2020-01-29T21:20:36.700Z 10 211
2020-01-29T21:20:36.983Z 11 217
2020-01-29T21:20:37.244Z 12 219
2020-01-29T21:20:37.541Z 13 222
2020-01-29T21:20:38.358Z 14 223
2020-01-29T21:20:38.639Z 15 225
2020-01-29T21:20:38.927Z 16 228
```

リクエストはしばしば失敗することがある。失敗した場合は自動的に再試行し、**エラー内容**と**再試行回数**を出力する。ただし**403エラー（レートリミット超過など）の場合に限って**、自動的に再試行せず、一時停止する。一時停止した場合は `Retry? (yes)` と尋ねられ、 Enter キーを押すか `y` や `yes` と入力すれば再試行できる。

各反復でのリクエストが完了するたびに、**現在時刻**、**反復回数**、**累計リクエスト回数**を出力する。このときの反復回数が2の冪乗数 (1, 2, 4, 8, ..., 2^n) である場合に限って、その時点までに得られた **Venues の情報**と**辺のリスト**をファイルに書き出す。

反復から脱出したら、**最後の反復での** Venues の情報と辺のリストもファイルに書き出す。

### 生成されるディレクトリの構造
`foursquare-next-venues-graph` コマンドを実行したときのカレントディレクトリに、以下のような構造のディレクトが生成される。例は前述したものと同じである。

- `20200130T062028-4b5522aff964a5206edc27e3-つくば駅`
  - `1`
    - `edge-list.csv`
    - `venues.csv`
  - `2`
    - `edge-list.csv`
    - `venues.csv`
  - `4`
    - `edge-list.csv`
    - `venues.csv`
  - `8`
    - `edge-list.csv`
    - `venues.csv`
  - `16`
    - `edge-list.csv`
    - `venues.csv`

トップのディレクトリの名前は、**コマンドを実行した時刻**、**起点 Venue の id** 、**起点 Venue の名前**をハイフン `-` で連結したものである。この内部には、各反復回数ごとに `edge-list.csv` と `venues.csv` が保存される。

### `edge-list.csv` の例
上記において、 `20200130T062028-4b5522aff964a5206edc27e3-つくば駅/1/edge-list.csv`
```
4b5522aff964a5206edc27e3,4bd2ceaf462cb713cefbdc07
4b5522aff964a5206edc27e3,4b5d1eaff964a520735329e3
```

### `venues.csv` の例
上記において、 `20200130T062028-4b5522aff964a5206edc27e3-つくば駅/1/venues.csv`
```
4b5522aff964a5206edc27e3,Tsukuba Station (つくば駅),日本,茨城県,つくば市
4bd2ceaf462cb713cefbdc07,ジャムジャム つくば店,日本,茨城県,つくば市
4b5d1eaff964a520735329e3,Tsukuba Creo Square Q't (つくばクレオスクエア Q't),日本,茨城県,つくば市
```
