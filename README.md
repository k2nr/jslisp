## Javascriptに埋め込んで使えるlispインタプリタ的な何か

javascriptの「中」でlisp的なことを実行できないかと、ふと思い立って作ってみました。
jsのコードの中にlispライクなコードを埋め込んで使えることが最大の長所、といいたいところですが、あまりに使いづらくて全く役に立たないただのお遊びプログラムです。

### USAGE

* Javascriptの配列を用いてS式を表現します。
* 変数の定義は定義するシンボルを文字列で表現して、シンボルの参照はsym関数を使わなければならない辺りから狂気を感じますね。

    
    // 変数aを10で定義
    [lisp.def, 'a', 10]
    
    // 変数aを参照
    [lisp.sym, 'a']

### Example

フィボナッチ数列求めてみたり。
    
    var lisp = require('./jslisp'),
        def = lisp.def,
        fn  = lisp.fn,
        if_ = lisp.if,
        lt  = lisp.lt,
        gt  = lisp.gt,
        sym = lisp.sym,
        plus  = lisp.plus,
        minus = lisp.minus;

    // フィボナッチ関数を定義
    lisp.eval([def, 'fib', [fn, ['n'],
        [if_, [lt, [sym, 'n'], 3],
                   1,
                   [plus, [[sym, 'fib'], [minus, [sym, 'n'], 1]],
                          [[sym, 'fib'], [minus, [sym, 'n'], 2]]]]]]);

    // n番目のfib数列の値を求める
    lisp.eval([[sym, 'fib'], 1]); // 1
    lisp.eval([[sym, 'fib'], 2]); // 1
    lisp.eval([[sym, 'fib'], 3]); // 2
    lisp.eval([[sym, 'fib'], 4]); // 3
    lisp.eval([[sym, 'fib'], 5]); // 5
