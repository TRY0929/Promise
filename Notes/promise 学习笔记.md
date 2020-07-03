# promise 学习笔记

## 一、准备部分

### 1）函数对象与实例对象

+ 函数对象：将函数作为对象使用时 成为函数对象：
  + `$.get('/test')`，利用jQuery发出Ajax请求，左边是点，就是当作对象用；

+ 实例对象：new 函数产生的对象，简称对象：
  + `function Fn() {}; const fn = new Fn()`，Fn是构造函数，fn是实例对象。

### 2）两种类型的回调函数

　　回调函数一般包含以下三种定义：1)  自己定义的 不是系统具备的；2) 自己一般不会去亲自调用；3) 最后都被执行了，一般是在某种情况下被自动调用了(如setTimeOut的回调函数)。

+ 同步回调：
  + 立即执行，完全执行完了才结束，不会放入回调队列；
  + 例如：数组遍历相关的回调函数(forEach) / Promise的excutor函数；

```javascript
const arr = [1, 2, 3];
	arr.forEach(item => {
		console.log(item);
	})
console.log('after forEach');
//这里会等上面数组遍历完毕，才打印下面的字符串
```

+ 异步回调：
  + 不会立即执行，会放入回调队列中将来执行；
  + 例如：定时器回调 / Ajax回调 / Promise的resolved rejected 的回调；

```javascript
var timer = setTimeout(() => {
	console.log('setTimeout callback()')
})
console.log('after setTimeout');
//先下再上
```

### 3）错误

> [error mdn](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Error)

#### a. 错误类型

- EvalError

  创建一个error实例，表示错误的原因：与 eval()有关。

- InternalError

  创建一个代表Javascript引擎内部错误的异常抛出的实例。 如: "递归太多".

- RangeError

  创建一个error实例，表示错误的原因：数值变量或参数超出其有效范围吗，或者递归层数过多。

- ReferenceError

  创建一个error实例，表示错误的原因：无效引用。

- SyntaxError

  创建一个error实例，表示错误的原因：eval()在解析代码的过程中发生的语法错误。

- TypeError

  创建一个error实例，表示错误的原因：变量或参数不属于有效类型。

- URIError

  创建一个error实例，表示错误的原因：给 encodeURI()或 decodeURI()传递的参数无效。

-----

#### b. 错误处理

　　程序每次报错都有一个，Uncaught xxxError，该错误产生处后面的代码都无法继续执行，这是由于错误未被捕获。

+ 捕获错误：try ... catch：

```javascript
try {
	let obj;
	console.log(obj.xxx);
} catch (error) {
	console.log(error.stack); //TypeError: Cannot read property 'xxx' of undefined at test.html:11
	console.log(error.message); //Cannot read property 'xxx' of undefined
}
```

+ 抛出错误：throw error：

```javascript
function a () {
	if (Date.now() % 2 === 1) {
		console.log('normal');
	} else {
		throw new Error('abnormally'); //里面要放message
			a();
		} catch (error) {
			console.log(error)
		}
	}
}
try {
    a();
} catch (error) {
    console.log(error)
}
```

#### c. 错误对象

+ message属性：错误相关信息；
+ stack属性：函数调用栈记录信息(里面可定位到出错处)。

## 二、Promise的理解和使用

### 1）Promise是什么

+ 抽象理解：Promise是js中进行异步编程的新的解决方案，之前是纯回调函数；
+ 具体理解：
  + 语法上，Promise是一个构造函数；
  + 功能上，Promise对象用来封装一个异步操作并可以获取其结果。

### 2）Promise的状态改变

+ Promise有三个状态：
  1. pending，待定 初始状态；
  2. fulfilled，实现，操作成功；
  3. rejected，被否决，操作失败。

+ 状态改变只有两种，这两种情况只要发生，状态就凝固了，不会再变了。
  + pending -> fulfilled，得到的结果数据一般称为value；
  + pending -> rejected，得到的结果数据一般称为reason。

### 3）基本使用

```javascript
const p = new Promise((resolve, reject) => {
	const time = Date.now();
	setTimeout(() => {
		if (time % 2 === 1) {
			resolve('成功的调用，time = ' + time);
		} else {
			reject('失败的调用，time = ' + time);
		}
	}, 500);
}).then(
	value => {
		console.log('Successfully! ',value);
        //就是上面resolve传过来的参数
	},
	reason => {
		console.log('Failed! ',reason);
        //就是上面reject传过来的参数
	}
)
```

## 三、为什么要使用Promise

### 1）指定回调函数的方式更加灵活

+ 在之前的纯回调函数处理异步事件时，只能在启动异步事件前指定好回调函数，若在执行完毕之后再指定，则接收不到返回的数据；
+ 在Promise处理异步事件时：
  + 启动异步任务 => 返回Promise对象 => 给Promise对象绑定回调函数(甚至可以在异步事件完成之后)

### 2）支持链式调用，可以解决回调地狱问题

##### 回调地狱是什么？

+ 回调函数嵌套调用，外部回调函数异步执行的结果是嵌套的回调函数执行的条件；
+ 缺点：不便于阅读，不便于异常处理；

```javascript
doFirstThing(function(firstReturn) {
	doSecondThing(firstReturn, function(secondReturn) {
		doThirdThing(secondReturn, function(thirdReturn) {
			console.log('finalReturn: ', thirdReturn);
		}, failureCallback)
	}, failureCallback)
}, failureCallback)
```

+ 解决方案：Promise链式调用；
+ 终极解决方案：async/await；

##### 链式调用

```javascript
doFirstThing()
.then(function(firstResult) {
	doSecondThing(firstResult);
})
.then(function(secondResult) {
	doThirdThing(secondResult);
})
.then(function(thirdResult) {
	console.log('finalResult: ', thirdResult);
})
.catch(failureCallback);
```

##### async await

+ await后面接一个会return new promise的函数并执行它；
+ await只能放在async函数里；

```javascript
async function request() {
	try {
		const firstResult = await doFirstThing()
		const secondResult = await doSecondThing(firstResult);
		const thirdResult = await doThirdThing(secondResult);
		console.log('finalResult: ', thirdResult);
	} catch (error) {
		failureCallback(error);
	}
}
```

## 四、Promise的API

### 1）Promise构造函数：Promise(excutor) {}

+ excutor函数：同步执行  `(resolve，reject) => {}`
+ resolve函数：内部定义成功时调用的函数 `value => {}`
+ reject函数：内部定义失败时调用的函数 `reason => {}`
+ 说明：excutor会在Promise内部立即同步回调，异步操作在执行器中执行；

### 2）Promise.prototype.then方法：(onResolved, onRejected) => {}

+ onResolved函数：成功的回调函数 `(value) => {}`
+ onRejected函数：失败的回调函数 `(reason) => {}`
+ 说明：指定用于得到成功value的成功回调和用于得到失败reason的失败回调，返回一个新的Promise对象；

### 3）Promise.prototype.catch方法：(onRejected) => {}

+ onRejected函数：失败的回调函数 `(reason) => {}`
+ 说明：then()的语法糖，相当于 `then(undefied, onRejected)`

### 4）Promise.resolve方法：(value) => {}

+ value：成功的数据或Promise对象
+ 说明：返回一个成功/失败的Promise对象

### 5）Promise.reject方法：(reason) => {}

+ reason：失败的原因
+ 说明：返回一个失败的Promise对象

### 6）Promise.all方法：(promises) => {}

+ promises：包含n个promise的数组
+ 说明：返回一个新的promise，**只有所有的promise都成功才成功**，只要有一个失败了就直接失败，所有都成功的话返回一个数组，失败直接返回失败的reason

### 7）Promise.race方法：(promises) => {}

+ promises：包含n个promise的数组
+ 说明：返回一个新的promise，**第一个完成**的promise的结果状态就是最终的结果状态

### 运用

```javascript
new Promise((resolve, reject) => {
	setTimeout(() => {
		// resolve('Suceeded!');
		reject('failed!');
	}, 1000)
})
.then(value => {console.log(value)})
.catch(reason => {console.log(reason)})
const p1 = new Promise ((resolve, reject) => {
	resolve(1);
})
const p2 = Promise.resolve(2);
const p3 = Promise.reject(3);
p1.then(value => {console.log(value)})
p2.then(value => {console.log(value)})
p3.catch(reason => {console.log(reason)})
// const pAll = Promise.all([p1, p2, p3]);
const pAll = Promise.all([p1, p2]);
pAll.then(
    values => {
        console.log('all onResolved() ', values);
    },
    reason => {
        console.log('all onRejected() ', reason);
    }
)
/*
1
2
3
all onResolved()  (2) [1, 2]
failed!
*/
```

## 五、Promise的几个关键问题

### 1）如何改变Promise的状态

+ 之前也说过，Promise的状态改变只可能有两种过程，pending -> fulfilled和pending -> rejected；
  + resolve(value)：若当前是pending则变为fulfilled；
  + rejected(reason)：若当前是pending则变为rejected；
  + 抛出异常(throw xxx)：若当前是pending则变为rejected，xxx一般是error

### 2）一个Promise对象指定多个成功/失败的回调函数，都会调用吗？

+ **当Promise改变为对应状态时，每个回调函数都会被调用**；
+ 注意这里指定多个回调函数，不能直接在后面连续.then()，要分开写两次，不然会形成链式指定回调函数，并不是指定多个回调函数；

```javascript
p.then(
	value => {console.log('onResolved()1 ', value)},
	reason => {console.log('onRejected()1 ', reason)}
)
p.then(
	value => {console.log('onResolved()2 ', value)},
	reason => {console.log('onRejected()2 ', reason)}
)
```

### 3）Promise状态改变和执行回调函数的先后顺序

+ **谁先谁后都有可能，正常情况下是先指定回调再改变状态，反之也没问题**；
+ 如何先改变状态再执行回调？
  + 在执行器中直接调用resolve(), reject()，不使用异步操作；
  + 延迟执行调用then()，如用setTimeOut；

+ 上面时候才能得到数据？
  + 若先指定回调，则当状态发送改变时回调函数就会被调用，得到数据；
  + 若先改变状态，则当指定回调函数时函数立即被调用，得到数据；

### 4）Promise的回调函数是同步还是异步执行

+ 当执行器函数中无异步操作，回调函数也已经指定完毕时，回调函数会立马同步被调用吗？还是要放到事件循环队列中等待被调用？
  + 答案是，**无论如何Promise的回调函数都是异步调用的**，要等同步语句都执行完毕才会去队列中调用。
  + 验证方法：

```javascript
new Promise ((resolve, reject) => {
	resolve(1);
}).then(
	value => {console.log('fulfilled ', value)},
	reason => {console.log('rejected ', reason)}
)
console.log('after Promise')
//after Promise先输出
```

### 5）Promise.then()返回的新的Promise的结果状态由什么决定？(也就是链式指定回调函数每次的状态由什么决定)

+ 由then()指定的回调函数执行的结果决定：

  + 抛出异常：新Promise变为rejected，reason为抛出的异常；

  + 返回非Promise的任意值：新Promise变为fulfilled，value为返回的值；
  + 返回另一个新Promise：Promise的结果变为此Promise的结果(成功或失败由此Promise决定)
  + 注意：若只是调用了函数没有返回值，则为undefined。

```javascript
new Promise((resolve, reject) => {
	resolve(1)
}).then(
	value => {console.log('onResolved()1 ', value); throw 3},
	reason => {console.log('onRejected()1 ', reason)}
).then(
	value => {console.log('onResolved()2 ', value)},
	reason => {console.log('onRejected()2 ', reason)}
)
/*
onResolved()1  1
onRejected()2  3
*/
```

```javascript
new Promise((resolve, reject) => {
	reject(2)
}).then(
	value => {console.log('onResolved()1 ', value)},
	reason => {console.log('onRejected()1 ', reason); return 3;}
).then(
	value => {console.log('onResolved()2 ', value)},
	reason => {console.log('onRejected()2 ', reason)}
)
/*
onRejected()1  2
onResolved()2  3
*/
```

```javascript
new Promise((resolve, reject) => {
	reject(2)
}).then(
	value => {console.log('onResolved()1 ', value)},
	reason => {
		console.log('onRejected()1 ', reason);
		return new Promise((resolve, reject) => resolve(3));
	}
).then(
	value => {console.log('onResolved()2 ', value)},
	reason => {console.log('onRejected()2 ', reason)}
)
/*
onRejected()1  2
onResolved()2  3
*/
```

```javascript
new Promise((resolve, reject) => {
	resolve(1)
}).then(
	value => {console.log('onResolved()1 ', value)},
	reason => {console.log('onRejected()1 ', reason)}
).then(
	value => {console.log('onResolved()2 ', value)},
	reason => {console.log('onRejected()2 ', reason)}
)
/*
onResolved()1  1
onResolved()2  undefined
*/
```

### 6）链式调用中，若回调函数为异步操作，则要将异步部分封装进新的Promise对象并作为返回值

+ 之前也说过，当.then()函数返回的是另一个新Promise对象时，这个新Promise对象的状态就是下个.then中Promise的状态；
+ 所以若要进行异步操作，则需要封装进一个新的Promise对象，同时也有它自己新的resolve reject函数，而不是一直调用一开始的；

```javascript
new Promise ((resolve, reject) => {
	setTimeout(() => {
		console.log('执行任务1(异步)');
		resolve(1);
	}, 1000)
}).then(
	value => {
		console.log('任务1结果 ', value);
		console.log('执行任务2(同步)');
		return 2;
	}
).then(
	value => {
		console.log('任务2结果 ', value);
		return new Promise ((resolve, reject) => {
			setTimeout(() => {
				console.log('执行任务3(异步)');
				resolve(3);
			}, 1000)
	})
}).then(
		value => {
		console.log('任务3结果 ', value);
	})
/*
执行任务1(异步)
任务1结果  1
执行任务2(同步)
任务2结果  2
执行任务3(异步)
任务3结果  3
*/
```

+ 从输出结构可以发现，虽然.then中有异步操作，但整个过程依然是按照严格的串联式执行的，有绝对的顺序；

### 7）错误穿透

+ 刚刚处理的都是一路成功的情况，那如果在一开始或某一环节失败了会怎么样？

```javascript
new Promise ((resolve, reject) => {
	reject(1);
}).then(
	value => {
		console.log('onResolved()1 ', value);
		return 2;
	}
).then(
	value => {
		console.log('onResolved()2 ', value);
	}
).then(
	value => {
		console.log('onResolved()3 ', value);
	}
).catch(
	reason => {console.log('onRejected()1 ', reason)}
)
//最后输出 onRejected()1  1
```

+ 这里的catch并不是第一个Promise的回调函数，由于第一个Promise就失败了，而中间所有的回调函数都只指定了成功的，所以错误会一直向下穿透，直到找到一个失败回调函数；
+ 没有定义失败回调函数的.then()实际上内部相当于写上了 `reason => {throw reason}`或者`reason => Promise.reject(reason)`，将这个错误传下去；

### 8）中断Promise链

+ 当使用Promise的then链式调用时，想在中间中断，不再调用后面的回调函数；
+ 办法：**在回调函数中返回一个pending状态的Promise对象**，`return new Promise (() => {})`；
+ 返回的Promise对象的状态决定了下次回调函数是执行成功还是失败的，现在返回一个pending状态 也就是还没有结构的状态，自然下一个Promise也没有结果，就这样中断了。

## 六、async和await

### 1）async function name([param[, param[, ... param]]]) { statements }

+ 函数的返回值为Promise对象
+ Promise对象的结果由async函数执行的返回值决定
+ 即若，函数return的不是一个Promise对象，前面由async的话也会自动会封装成一个Promise对象然后返回；

```javascript
const func1 = async function () {
    return Promise.reject(3) //输出 onRejected()  3
    return 2 //输出 onResolved()  2
	throw 3 //输出 onRejected()  4
}
const result = func1()
result.then(
	value => {
		console.log('onResolved() ', value)
	},
	reason => {
		console.log('onRejected() ', reason)
	}
)

```

### 2）[return_value] = await expression;

+ await只能放到async函数里

+ expression的类型
  + await 表达式会暂停当前 async function的执行，等待 Promise 处理完成。若 Promise 正常处理(fulfilled)，其回调的resolve函数参数作为 await 表达式的值，继续执行 async function。
  + 若 Promise 处理异常(rejected)，await 表达式会把 Promise 的异常原因抛出。
  + 另外，如果 await 操作符后的表达式的值不是一个 Promise，则返回该值本身。

```javascript
function func2() {
	return new Promise((resolve, reject) => {
		setTimeout(() => {
			resolve(3)
		}, 1000)
	})
}
async function func1 () {
    try {
        const value = await func2()
        console.log('onResolved() ',value)
    } catch (error) {
        console.log('onRejected() ', error)
    }
}
func1()
//1s后输出 onRejected()  3
```

+ 实际上 async 函数的返回值都是Promise对象，但用await函数接收到的值，是Promise成功之后的value值(失败则进入异常处理)

## 七、宏任务与微任务

+ JS 中用来存储待执行回调函数的队列包含2 个不同特定的列队

+ 宏列队: 用来保存待执行的宏任务(回调), 比如: **定时器回调** / **DOM 事件回调** / **ajax 回调**

+ 微列队: 用来保存待执行的微任务( 回调), 比如: **promise 的回调** / **MutationObserver 的回调**

+ JS 执行时会区别这2 个队列
  + JS 引擎首先必须先执行所有的初始化同步任务代码
  + **每次准备取出第一个宏任务执行前, 都要将所有的微任务一个一个取出来执行**，即在执行宏任务过程中，只要微队列不为空，立马跑去微队列中执行

```javascript
setTimeout(() => {
	console.log('timeout callback1()')
	Promise.resolve(3).then(
		value => {
			console.log('Promise onResolved3()', value);
		}
	)
}, 0)
setTimeout(() => {
	console.log('timeout callback2()')
}, 0)

Promise.resolve(1).then(
	value => {
		console.log('Promise onResolved1()', value);
	}
)
Promise.resolve(2).then(
	value => {
		console.log('Promise onResolved2()', value);
	}
)
/*
Promise onResolved1() 1
Promise onResolved2() 2
timeout callback1()
Promise onResolved3() 3
timeout callback2()
*/
```

## 八、面试题

+ 一般方法都是：
  + 找出同步语句，按照出现顺序输出
  + 每输出一个同步语句，查看是否更新宏队列与微队列中的项
  + 依次输出微队列中的项，查看是否更新宏队列与微队列中的项
  + 若微队列为空，再依次查看宏队列中的项，查看是否更新宏队列与微队列中的项
+ 要注意的点是：
  + new Promise中的语句是同步语句，包括.then语句
  + 但.then中的回调函数是异步执行的，要放入微队列

### 1）

```javascript
const first = () => (new Promise((resolve, reject) => {
	console.log(3)
	let p = new Promise((resolve, reject) => {
		console.log(7) 
		setTimeout(() => {
			console.log(5)
			resolve(6)
		}, 0)
		resolve(1)
	})
	resolve(2)
	p.then((arg) => {
		console.log(arg)
	})
}))
first().then((arg) => {
	console.log(arg)
})
console.log(4)
```

### 2）

```javascript
setTimeout(() => {
	console.log('0')
}, 0)
new Promise((resolve, reject) => {
	console.log('1')
	resolve()
}).then(() => {
	console.log('2')
	new Promise((resolve, reject) => {
		console.log('3')
		resolve()
	}).then(() => {
		console.log('4')
	}).then(() => {
		console.log('5')
	}).then(() => {
		console.log('9')
	}).then(() => {
		console.log('10')
	})
}).then(
	() => {console.log('6')},
	() => {console.log('error')}
).then(() => {console.log(11)})
new Promise((resolve, reject) => {
	console.log('7')
	resolve()
}).then(() => {
	console.log('8')
})
```

### 答案

1）3 7 4 1 2

2）1 7 2 3 8 4 6 5 11 9 10 0

+ 其中第二题很可能容易错，一开始我也想错了，主要是.then的执行时间问题
  + .then执行是同步的，但.then内部的回调函数的执行要等到上面都有结果了 才能决定执行onResolved还是onRejected
  + 这里第一个Promise的第二个.then的执行时间，是第二个Promise里的resolve执行完毕的时候，因为这时第一个Promise的excutor已执行完，Promise实际上已经变为fulfilled的状态了，自然 6 也可以放入微队列了