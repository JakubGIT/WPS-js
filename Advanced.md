# JavaScript Advanced

## Functions

### Closures

```js
function makeCounter() {
    let next = 1;

    return function () {
        return next++;
    };
}

const a = makeCounter();
const b = makeCounter();

console.log(a ()); // 1
console.log(a ()); // 2
console.log( b()); //  1
console.log(a ()); // 3
console.log( b()); //  2
console.log( b()); //  3
```

- Functions have access to their surrounding context
- Even after the enclosing function has returned!

> **Exercise:** Complete the function `makeFibonacci()`:

```js
function makeFibonacci() {
    // TODO initialize state

    return function () {
        // TODO update state
        // TODO return value
    };
}

const f = makeFibonacci();

console.log(f()); // 0
console.log(f()); // 1
console.log(f()); // 1
console.log(f()); // 2
console.log(f()); // 3
console.log(f()); // 5
console.log(f()); // 8
console.log(f()); // 13
console.log(f()); // 21
console.log(f()); // 34
console.log(f()); // 55
console.log(f()); // 89
```

### Generators

- What is wrong with the following function?

```js
function fibonacci() {
    const result = [];

    let a = 0n;
    result.push(a);            // 0n

    let b = BigInt(1);
    result.push(b);            // 1n

    while (true) {
        result.push(a += b);   // 1n    3n    8n     21n     55n     ...
        result.push(b += a);   //    2n    5n    13n     34n     89n     ...
    }

    return result;
}
```

- The infinite `while(true)` loop keeps consuming memory
  - This will eventually throw an out-of-memory error
- The unreachable `return` statement is never executed
  - Generators “return” each element separately for immediate consumption:

```js
/////// v
function* fibonacci() {
    let a = 0n;
    yield a;            // 0n

    let b = BigInt(1);
    yield b;            // 1n

    while (true) {
        yield a += b;   // 1n    3n    8n     21n     55n     ...
        yield b += a;   //    2n    5n    13n     34n     89n     ...
    }
}

const generator = fibonacci();

console.log(generator.next());   // { value: 0n, done: false }
console.log(generator.next());   // { value: 1n, done: false }
console.log(generator.next());   // { value: 1n, done: false }
console.log(generator.next());   // { value: 2n, done: false }
console.log(generator.next());   // { value: 3n, done: false }
```

- Generator `function*`s return generator objects
- Generator objects are iterable:

```js
for (const value of fibonacci()) {
    if (value >= 1000) break;
    console.log(value);   // 0n 1n 1n 2n 3n 5n 8n 13n 21n 34n 55n 89n 144n 233n 377n 610n 987n
}
```

- Iterating over generator objects roughly desugars to:

```js
const generator = fibonacci();
let value, done;
while ({value, done} = generator.next(), !done) {
    if (value >= 1000) break;       // ^
    console.log(value);            //  comma operator
}
```

- Generators are stackless coroutines
- Implemented via state machines
  - Working C++ example:

```cpp
class Fibonacci {
    long a;
    long b;

    int state = 0;

public:
                    long next() {
switch (state) {
    case 0:             a = 0;
    state = 1;          return a;

    case 1:             b = 1;
    state = 2;          return b;

                        while (true) {
    case 2:                 a += b;
    state = 3;              return a;

    case 3:                 b += a;
    state = 4;              return b;

    case 4: ;           }
}                   }
};
```

> **Exercise:**
> - Study the callback-based function `walkTheDom1` and its example call
> - Visit any website and paste the code into the browser console

```js
function walkTheDom1(node, callback) {
    callback(node);
    for (const child of node.children) {
        walkTheDom1(child, callback);
    }
}

walkTheDom1(document, function (node) {
    console.log(node.nodeName);
});
```

> **Exercise:**
> - Complete the generator function `walkTheDom2`
> - Does it find the same nodes as `walkTheDom1`?

```js
function* walkTheDom2(node) {
    // TODO recursively yield all nodes
}

for (const node of walkTheDom2(document)) {
    console.log(node.nodeName);
}
```

## Objects

- A JavaScript object is essentially a `java.util.LinkedHashMap<String, Object>`

```js
// Object literal
const account = { balance: 1000, getBalance: function () { return this.balance; } };

// read properties
account["balance"]   // 1000
account.balance      // 1000
account.getBalance   // [Function: getBalance]
account.getBalance() // 1000

// write properties
account["id"]   = 42;
account.deposit = function (amount) { this.balance += amount; };

// delete properties
delete account.id;
```

- Properties are accessed:
  - unquoted after dot, or
  - quoted inside brackets
- Objects are class-free
  - Properties can be added and removed at will

### Factory functions

```js
function createAccount(initialBalance, accountId) {
    return {
        balance: initialBalance,
        id: accountId,

        deposit: function (amount) {
            this.balance += amount;
        },

        getBalance: function () {
            return this.balance;
        },
    };
}

const account = createAccount(1000, 42);
// { balance: 1000, id: 42, deposit: [Function: deposit], getBalance: [Function: getBalance] }

account.deposit(234);
account.getBalance() // 1234

createAccount(1234, 42).getBalance === account.getBalance // false
```

### Object inheritance

```js
const accountMethods = {
    deposit: function (amount) {
        this.balance += amount;
    },

    getBalance: function () {
        return this.balance;
    },
};

function createAccount(initialBalance, accountId) {
    return {
        __proto__: accountMethods,

        balance: initialBalance,
        id: accountId,
    };
}

const account = createAccount(1000, 42);
// { balance: 1000, id: 42 }

account.__proto__
// { deposit: [Function: deposit], getBalance: [Function: getBalance] }

account.deposit(234);
account.getBalance() // 1234

createAccount(1234, 42).getBalance === account.getBalance // true
```

- *Reading* a property `obj.key` starts at `obj` and climbs the inheritance chain:
  - `obj.key`
  - `obj.__proto__.key`
  - `obj.__proto__.__proto__.key`
  - `obj.__proto__.__proto__.__proto__.key`
  - etc. until `key` is found (or `__proto__` is `null`)
- *Writing* a property `obj.key = value` ignores `obj.__proto__`

### Constructor functions

```js
function Account(initialBalance, accountId) {
    this.balance = initialBalance;
    this.id = accountId;
}

// Account.prototype = { constructor: Account };

Account.prototype.deposit = function (amount) {
    this.balance += amount;
};

Account.prototype.getBalance = function () {
    return this.balance;
};

            /* Account.call({ __proto__: Account.prototype },
                            1000, 42) */
const account = new Account(1000, 42);
// Account { balance: 1000, id: 42 }

account.__proto__
// { deposit: [Function (anonymous)], getBalance: [Function (anonymous)] }

account.deposit(234);
account.getBalance() // 1234

new Account(1234, 42).getBalance === account.getBalance // true
```

- By convention, functions starting with an uppercase letter are *constructor functions*
  - Must be invoked with `new` to create `{ __proto__: F.prototype }`
  - Otherwise, `this` is `undefined`
- *Every* function has an associated `prototype` property
  - But it's only useful for constructor functions

> **Exercise:** Add `withdraw` functions to the 3 previous `Account` examples:
> - “Factory functions”
> - “Object inheritance”
> - “Constructor functions”

| Function call syntax      | `this`      |
| ------------------------- | :---------: |
| `f(x, y, z)`              | `undefined` |
| `obj.f(x, y, z)`          | `obj`       |
| `new F(x, y, z)`          | `{ __proto__: F.prototype }` |
| `f.apply(obj, [x, y, z])` | `obj`       |
| `f.call(obj, x, y, z)`    | `obj`       |
| `f.bind(obj)(x, y, z)`    | `obj`       |

&nbsp;

![](img/proto.svg)

### The `class` keyword

> Even though ECMAScript includes syntax for class definitions,
> **[ECMAScript objects](https://tc39.es/ecma262/#sec-objects) are not fundamentally class-based**
> such as those in C++, Smalltalk, or Java

```js
class Account {
    constructor(initialBalance, accountId) {
        this.balance = initialBalance;
        this.id = accountId;
    }

    deposit(amount) {
        this.balance += amount;
    }

    getBalance() {
        return this.balance;
    }
}

const account = new Account(1000, 42);
// Account { balance: 1000, id: 42 }

account.__proto__                       // {}
account.__proto__ === Account.prototype // true
account.__proto__.deposit               // [Function: deposit]
account.__proto__.getBalance            // [Function: getBalance]
```

### Callbacks and `this`

```js
const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;

class Account {
    constructor() {
        this.balance = 0;
    }

    depositTomorrow(amount) {
        setTimeout(() => {
            this.balance += amount; // this = the account object
        }, MILLISECONDS_PER_DAY);
    }

    depositTomorrow_failsSilently(amount) {
        setTimeout(function () {
            this.balance += amount; // this = the global object (window)
        }, MILLISECONDS_PER_DAY);
    }

    depositTomorrow_worksVintage(amount) {
        var that = this;            // this = the account object
        setTimeout(function () {
            that.balance += amount; // that = the account object
        }, MILLISECONDS_PER_DAY);
    }

    deposit(amount) {
        this.balance += amount;
    }

    depositTomorrow_failsAgain(amount) {
        setTimeout(this.deposit, MILLISECONDS_PER_DAY);
        //         this.deposit does not preserve this for later call
        //        (also, amount will be undefined)
    }

    depositTomorrow_worksAgain(amount) {
        setTimeout(this.deposit.bind(this, amount), MILLISECONDS_PER_DAY);
        //                      preserves this (and amount) for later call
    }
}
```

- Ordinary functions `function () {}` do not preserve outer `this`
  - Arrow functions `() => {}` do
- Uncalled methods `obj.method` do not bind `this` to `obj`
  - Bound methods `obj.method.bind(obj)` do

### Polyfills

- Hypothetical implementation if `bind` (2009) wasn't built in:

```js
//                                       rest parameters
Function.prototype.bind = function (obj, ...xs) {

    return (...ys) => this.call(obj, ...xs, ...ys);
    //      rest parameters          spread operator
};
```

- Since 2023, arrays have a `toSorted` method:

```js
const sortedByYear = people.toSorted((a, b) => a.year - b.year);
                            ////////
```

- Not all JavaScript environments provide `toSorted` yet
- In that case, it can be monkey-patched into the prototype:

```js
if (Array.prototype.toSorted === undefined) {
    Array.prototype.toSorted = function (compare) {
        //            spread operator
        const copy = [...this];
        copy.sort(compare);
        return copy;
    };
}
```

## Modules

- One `.js` file per module
- Explicit `export`s and `import`s
- Simple but effective

### Named exports

```js
// file trig.js

export const PI = 3.141592653589793;
const RADIANS_PER_DEGREE = PI / 180; // unexported

export function radians(degrees) {
    return degrees * RADIANS_PER_DEGREE;
}

export function degrees(radians) {
    return radians / RADIANS_PER_DEGREE;
}

export function distance(x, y) {
    return Math.sqrt(square(x) + square(y));
}

// unexported
function square(x) {
    return x * x;
}
```

### Named imports

```js
// some other file

import { PI, distance as distanceFromOrigin } from './trig.js';

const distance = 1.5;

console.log(PI);
console.log(distanceFromOrigin(3, 4));
```

### Namespace import

```js
// some other file

import * as trig from './trig.js';

const distance = 1.5;

console.log(trig.PI);
console.log(trig.distance(3, 4));
```

### Browser support

- Traditionally, all modules are bundled into a single `bundle.js` file
  - by module bundlers like Webpack
  - requires additional build step
- These days, browsers support modules directly, but:
  - ⚠️ Modules **must** be served by a (local) web server
    - “double-click on `index.html`” will *not* work
    - browse `http://localhost:8080` instead
  - Any web server capable of serving files from the file system will do, for example:

|                                | Node                         | Debian derivatives       |
| ------------------------------ | ---------------------------- | ------------------------ |
| install (once, from anywhere)  | `npm install -g http-server` | `sudo apt install webfs` |
| serve (from project directory) | `http-server`                | `webfsd -F -p 8080`      |

### HTML `script` tag

- Execute all JavaScript code inside a module:

```html
<script type="module" src="filename.js">
```

- ⚠️ Exported module functions are invisible to HTML tag attributes:

```html
<button onclick="callback()">I have never met this callback in my life</button>
```

- Import and register the callback inside a module script instead:

```html
<button id="button">Of course I know him</button>

<script type="module">
import { callback } from "filename.js";

document.getElementById("button").onclick = callback;
</script>
```

## Privacy

- Before 2022, JavaScript had no private properties:

```js
class Account {
    constructor(initialBalance) {
        this.balance = initialBalance;
    }

    deposit(amount) {
        this.balance += amount;
    }

    getBalance() {
        return this.balance;
    }
}

const a = new Account(123);

a.balance = 1000000; // whoops
```

### ES2022

- Since 2022, private properties are marked with the `#` prefix:

```js
class Account {
    #balance; // mandatory declaration

    constructor(initialBalance) {
        this.#balance = initialBalance;
    }

    deposit(amount) {
        this.#balance += amount;
    }

    getBalance() {
        return this.#balance;
    }
}

const a = new Account(123);

a.#balance = 1000000;
// Uncaught SyntaxError: Private field '#balance' ...
// Property '#balance' is not accessible outside class 'Account' ...
```

- Many JavaScript programmers are not aware of this syntax, yet

### ES2015

- Between 2015 and 2022, private properties could be simulated with modules and `WeakMap`s:

```js
// file Account.js

const properties = new WeakMap(); // unexported, i.e. inaccessible outside the module

export class Account {
    constructor(initialBalance) {
        properties.set(this, {
            balance: initialBalance,
        });
    }

    deposit(amount) {
        properties.get(this).balance += amount;
    }

    getBalance() {
        return properties.get(this).balance;
    }
}
```

```js
// some other file

import { Account } from './Account.js';

const a = new Account(123);

properties.get(this).balance = 1000000;
// Uncaught ReferenceError: properties is not defined
```

- Why `WeakMap` instead of `Map`?
  - A normal `Map` would keep growing with every `new Account`
  - But a `WeakMap` can shrink during garbage collection
- This approach to privacy is not widespread

### 1995 Closures

- Closures were always powerful enough to simulate privacy:

```js
function createAccount(balance) {
    return {
        deposit: function(amount) {
            balance += amount;
        },

        getBalance: function() {
            return balance;
        },
    };
}

const a = createAccount(123);

a.balance = 1000000; // unrelated property
a.getBalance()       // 123
a.balance            // 1000000
```

- Note how `deposit` and `getBalance` close over `balance`
  - That `balance` is *not* an object property!
- Also note the low number of keywords
- Lisp programmers love this style
  - Other programmers... tend not to

### 2009 freeze

- `Object.freeze` prevents properties from being added (or modified):

```js
function createAccount(balance) {
    return Object.freeze({
        deposit: function(amount) {
            balance += amount;
        },

        getBalance: function() {
            return balance;
        },
    });
}

const a = createAccount(123);

a.balance = 1000000; // fails silently
a.getBalance()       // 123
a.balance            // undefined
```

### 2015 strict mode

```js
"use strict"; // default inside modules, btw

function createAccount(balance) {
    return Object.freeze({
        deposit(amount) {
            balance += amount;
        },

        getBalance() {
            return balance;
        },
    });
}

const a = createAccount(123);

a.balance = 1000000;
// Uncaught TypeError: Cannot add property balance, object is not extensible
```

- The only way to provide true privacy before 2022
- In practice, programmers either
  - just don't care about privacy that much, or
  - use `private` in TypeScript:

### TypeScript

- The TypeScript compiler checks `private`, and then compiles it away:

```ts
class Account {
    private balance: number;

    constructor(initialBalance: number) {
        this.balance = initialBalance;
    }

    // ...
}
```

- The property and constructor can be fused together:

```ts
class Account {
    constructor(private balance: number) {
    }

    // ...
}
```

- This approach to privacy is very popular
- Everybody knows `private` from some other language
