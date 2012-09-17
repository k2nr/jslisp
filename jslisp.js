lisp = function(env) {
    this.env = env || {};
};
exports = module.exports = lisp;

lisp.GLOBAL_ENVIRONMENT = {
    frames: []
};
var SYMBOL_PREFIX = '__sym:';

/** resolves requested var */
function resolveVar( v, current ){
    var frame, name;
    if(isSymbol(v)) {
        name = getSymName(v);
        for(frame=current; frame; frame=frame.prev) {
            if(frame[name]){
                return frame[name];
            }
        }
    }
    return v;
}


function isSymbol(v) {
    return typeof v === 'string' && v.search(new RegExp('^'+SYMBOL_PREFIX)) === 0;
}

function getSymName(v) {
    if(isSymbol(v)) {
        return v.slice(SYMBOL_PREFIX.length);
    } else {
        return null;
    }
}

function defineSymbol(name, value, frame) {
    frame[name] = value;
}

function isFunction(func) {
    return typeof func === 'function' || func.type === 'function';
}

function isSpecialForm(form) {
    return typeof form === 'object' && form.type === 'special';
}

function newEnvironment(env) {
    var newEnv = {
        frames: [],
        prev: env
    };
    env.frames.push(newEnv);
    
    return newEnv;
}
function applySpecialForm(form, args, env) {
    return form.body(args, env);
}

lisp.apply = function(fun, args, env){
    var len, i, last, name, newEnv;
    if(!isFunction(fun) && !isSpecialForm(fun)) {
        throw new Error('not a function or special form');
    }
    if(typeof fun === 'function') {
        last = fun.apply(context, args);
    } else if(isSpecialForm(fun)) {
        last = applySpecialForm(fun, args, env);
    } else {
        newEnv = newEnvironment(fun.env);
        len = fun.args.length;
        for(i=0; i < len; i++) {
            name = fun.args[i];
            newEnv[name] = args[i];
        }

        len = fun.body.length;
        for(i=0; i < len; i++) {
            last = lisp.eval(newEnv, fun.body[i]);
        }
    }
    return last;
};

lisp.eval = function() {
    var fun, args, i, last, body, len,
        env = arguments[0];

    if(!(env instanceof Array) && typeof env === 'object') {
        body = [].slice.call(arguments, 1);
    } else {
        env = lisp.GLOBAL_ENVIRONMENT;
        body = [].slice.call(arguments, 0);
    }

    len = body.length;
    for(i=0; i < len; i++) {
        if(!(body[i] instanceof Array)){
            last = resolveVar(body[i], env);
        } else {
            fun = resolveVar(body[i][0]);
            if(isSpecialForm(fun)) {
                args = body[i].slice(1).map(function(v){return resolveVar(v, env);});
            } else {
                args = body[i].slice(1)
                    .map(function(v){return lisp.eval(env, v);})
                    .map(function(v){return resolveVar(v, env);});
            }
            if(fun instanceof Array) {
                fun = lisp.eval(env, fun);
            }
            last = lisp.apply(fun, args, env);
        }
    }
    
    return last;
};


/****************************
 * Native Functions
 ****************************/
lisp.car = function (){
    var list = arguments[0];
    if(!list){
        return null;
    } else if(!(list instanceof Array)){
        throw new Error('arg is not Array');
    }
    return list[0];
};

lisp.cdr = function(){
    var list = arguments[0];
    if(!list || list.length === 0){
        return null;
    } else if(!(list instanceof Array)){
        throw new Error('arg is not Array');
    }
    
    return list.slice(1);
};

lisp.plus = function(a, b) {
    return a + b;
};
lisp.minus = function(a, b) {
    return a - b;
};
lisp.gt = function(a, b) {
    return a > b;
};
lisp.lt = function(a, b) {
    return a < b;
};
lisp.eq = function(a, b) {
    return a === b;
};
lisp.range = function(n) {
    var i, res = ['__quoted'];
    for(i=0; i < n; i++) {
        res.push(i);
    }
    return res;
};

lisp.fn = {
    type: 'special',
    body: function(args, env) {
        return {
            type: 'function',
            args: args[0],
            body: args.slice(1),
            env:  env
        };
    }
};

lisp.def = {
    type: 'special',
    body: function(args, env) {
        env[args[0]] = lisp.eval(env, args[1]);
    }
};

lisp.sym = {
    type: 'special',
    body: function(args, env) {
        return resolveVar(SYMBOL_PREFIX + args[0], env);
    }
};

lisp.if = {
    type: 'special',
    body: function(args, env) {
        var pred = args[0],
            clause = (lisp.eval(env, pred)) ? args[1] : args[2];
        return lisp.eval(env, clause);
    }
};

lisp.q = {
    type: 'special',
    body: function(args, env) {
        return args[0];
    }
};

lisp.emp = function(lst) {
    return lst && lst.length === 0;
};

lisp.nilp = function(lst) {
    return lst == null;
};