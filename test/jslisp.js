var should = require('should'),
    lisp   = require('../jslisp');

describe('fundamentals', function (){
    describe('car', function (){
        it('should returns first elem', function () {
            var car = lisp.car;
            car([1, 2, 3]).should.equal(1);
            should.not.exist(car([]));
            should.not.exist(car());
        });
    });
    describe('cdr', function (){
        it('should returns rest elem', function () {
            var cdr = lisp.cdr;
            cdr([1, 2, 3]).should.eql([2, 3]);
            cdr([1]).should.eql([]);
            should.not.exist(cdr([]));
            should.not.exist(cdr());
        });
    });
});

describe('eval', function (){
    it('should evaluate s-expressions', function () {
        var ffun = function(n) {
            return function(m) {
                return n + m;
            };
        };

        lisp.eval([[ffun, 10], 10]).should.equal(20);
    });

    it('should evaluate value', function () {
        lisp.eval(10).should.equal(10);
        lisp.eval('hello').should.equal('hello');
        lisp.eval(true).should.equal(true);
    });
    
    it('should evaluate anonymous function', function () {
        lisp.eval([[lisp.fn, ['a', 'b'],
                    [lisp.plus, [lisp.sym, 'a'], [lisp.sym, 'b']]
                   ], 10, 10]).should.equal(20);
    });
    
    it('should define variable', function () {
        lisp.eval([lisp.def, 'a', 10],
                  [lisp.sym, 'a']).should.equal(10);
        lisp.eval([lisp.def, 'f', [lisp.fn, ['a'], [lisp.sym, 'a']]],
                  [[lisp.sym, 'f'], 10]).should.equal(10);
    });

    it('should work with if special form', function () {
        lisp.eval([lisp.if, false, 1, 0]).should.equal(0);
        lisp.eval([lisp.def, 'func', [lisp.fn, ['a'],
                                 [lisp.if, [lisp.sym, 'a'], true, false]]],
                  [lisp.if, [[lisp.sym, 'func'], true],
                       [parseInt, 20, 10],
                       [parseInt, 30, 10]]).should.equal(20);
    });
    
    it('should do fibonacci', function () {
        var def = lisp.def,
            fn  = lisp.fn,
            if_ = lisp.if,
            lt  = lisp.lt,
            gt  = lisp.gt,
            sym = lisp.sym,
            plus  = lisp.plus,
            minus = lisp.minus;

        lisp.eval([def, 'fib', [fn, ['n'],
            [if_, [lt, [sym, 'n'], 3],
                       1,
                       [plus, [[sym, 'fib'], [minus, [sym, 'n'], 1]],
                              [[sym, 'fib'], [minus, [sym, 'n'], 2]]]]]]);
        lisp.eval([[sym, 'fib'], 1]).should.equal(1);
        lisp.eval([[sym, 'fib'], 2]).should.equal(1);
        lisp.eval([[sym, 'fib'], 3]).should.equal(2);
        lisp.eval([[sym, 'fib'], 4]).should.equal(3);
        lisp.eval([[sym, 'fib'], 5]).should.equal(5);
    });
    
    it('should quote', function () {
        lisp.eval([lisp.q, [1, 2, 3]]).should.eql([1, 2, 3]);
    });
    
    it('should car/cdr', function () {
        lisp.eval([lisp.car, [lisp.q, [1, 2, 3]]]).should.equal(1);
        lisp.eval([lisp.cdr, [lisp.q, [1, 2, 3]]]).should.eql([2, 3]);
    });
});
