const symbols = {}

function type(k) {
    let v = symbols[k]
    if (!v) {
        symbols[k] = Symbol(k)
        v = symbols[k]
    }
    return v
}

function symbol2str(k) {
    let v = typeof k == 'symbol' ? k.description : k
    return v
}

function parseExpr(expr) {
    let result = [];
    let stack = [];
    for (let i = 0; i < expr.length; i++) {
        if (expr[i] === '(') {
            // 遇到左括号，将当前结果压入栈中
            stack.push(result);
            result = [];
        } else if (expr[i] === ')') {
            // 遇到右括号，弹出栈顶元素，并将当前结果作为其子节点
            let parent = stack.pop();
            parent.push(result);
            result = parent;
        } else if (expr[i] !== ' ') {
            // 遇到非空格字符，将其解析并添加到当前结果中
            let j = i;
            let strFlag = false;
            while (j < expr.length && ((expr[j] !== ' ' && expr[j] !== '(' && expr[j] !== ')') || strFlag)) {
                if (expr[j] == '"' || expr[j] == "'") {
                    strFlag = !strFlag
                }
                j++;
            }
            let token = expr.substring(i, j);
            if (token === "#t") {
                result.push(true);
            } else if (token === "#f") {
                result.push(false);
            } else if (token.match(/^"(.*)"$/) || token.match(/^'(.*)'$/)) {
                result.push(token.slice(1, -1));
            } else {
                result.push(isNaN(token) ? type(token) : Number(token));
            }
            i = j - 1;
        }
    }
    return result.pop();
}

function evaluate(expr, env) {
    if (!env) {
        env = initEnv()
    }
    let car = Array.isArray(expr) ? expr[0] : expr
    let cdr = []
    if (Array.isArray(expr)) {
        cdr = expr.slice(1);
        cdr.isSub = true;
    }
    if (Array.isArray(car)) {
        let val = evaluate(car, env);
        // console.log('--', expr, val, cdr)
        if (typeof val == 'function' && !expr.isSub) {
            return apply(val, cdr.map(e => () => evalSub(e, env)), {
                env,
                car,
                cdr
            })
        }
        return cdr.length ? evaluate(cdr, env) : val
    } else if (typeof car == 'symbol') {
        let val = env.get(car)
        // console.log(expr, val, cdr)
        if (typeof val == 'function' && !expr.isSub) {
            return apply(val, cdr.map(e => () => evalSub(e, env)), {
                env,
                car,
                cdr
            })
        }
        return cdr.length ? evaluate(cdr, env) : val
    } else {
        return cdr.length ? evaluate(cdr, env) : car;
    }
}

function evalSub(expr, env) {
    let array = [expr];
    array.isSub = true;
    return evaluate(array, env)
}


function apply(func, lArgs, envHolder) {
    return func(lArgs, envHolder)
}


function initEnv() {
    function fork(env) {
        return {
            parent: env,
            _envs: {},
            get: function (key) {
                key = symbol2str(key)
                return this._envs[key] || (this.parent && this.parent.get(key))
            },
            set: function (key, value) {
                key = symbol2str(key)
                this._envs[key] = value
            },
            fork: function () {
                return fork(this)
            }
        }
    }
    const envs = {}
    envs['+'] = function (args) {
        return cal(args).reduce((acc, val) => acc + val, 0);
    };
    envs['-'] = function (args) {
        return cal(args).reduce((acc, val) => acc - val);
    };
    envs['*'] = function (args) {
        return cal(args).reduce((acc, val) => acc * val, 1);
    };
    envs['/'] = function (args) {
        return cal(args).reduce((acc, val) => acc / val);
    };
    envs['define'] = function (args, envHolder) {
        envHolder.env.set(envHolder.cdr[0], evaluate(envHolder.cdr[1], envHolder.env))
    }
    envs['lambda'] = function (_, envHolder) {
        const params = envHolder.cdr[0]
        const body = envHolder.cdr.slice(1)
        return  (args, envHolder)=> {
            // console.log(envHolder, args)
            let env = envHolder.env.fork()
            // bindArgs
            for (let i = 0; i < params.length; i++) {
                let param = params[i];
                if (symbol2str(param) == '.') {
                    i++;
                    param = params[i]
                    args = [args.map(g => g())]
                }
                env.set(param, args[0]())
                args = args.slice(1)
            }
            return evaluate(body, env)
        }
    }
    envs['map'] = function (args, envHolder) {
        let list = args[0]()
        let g = args[1]()
        return list.map(o => apply(g, [() => o], envHolder));
    };
    envs['filter'] = function (args, envHolder) {
        let list = args[0]()
        let g = args[1]()
        return list.filter(o => apply(g, [() => o], envHolder));
    };
    envs['reduce'] = function (args, envHolder) {
        let list = args[0]()
        let g = args[1]()
        return list.reduce((x, y) => apply(g, [() => x, () => y], envHolder));
    };
    envs['list'] = function (args) {
        return cal(args);
    };
    envs['list-ref'] = function (args) {
        let d = cal(args);
        return d[0][d[1]];
    };

    function cal(args) {
        // console.log(args)
        return Array.from(args).map(f => f())
    }
    return fork({
        _envs: envs,
        get: function (key) {
            key = symbol2str(key)
            return this._envs[key] || (window[key] && (typeof window[key] == 'function' && (function (args) {
                return window[key](cal(args))
            }) || window[key]))
        },
        set: function (key, value) {
            key = symbol2str(key)
            this._envs[key] = value
        },
        fork: function () {
            return fork(this)
        }
    })
}

function eval(sexpr) {
    return evaluate(parseExpr(sexpr))
}