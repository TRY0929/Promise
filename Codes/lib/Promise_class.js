(function(window) {
  const PENDING = 'pending'
  const FULFILLED = 'fulfilled'
  const REJECTED = 'rejected'

  class Promise {
    //Promise构造函数
    //excutor 执行器函数
    constructor (excutor) {
      //保存Promise的this 在后面函数里使用
      const _this = this
      //Promise的status属性，初始为pengding
      this.status = PENDING
      //给Promise对象指定一个用于存储结构数据的属性
      this.data = undefined
      //每个元素的结构 {onResolved() {}, onRejected() {}}
      this.callbacks = []

      function resolve(value) {
        //若当前状态不是pending，直接结束
        if (_this.status !== PENDING) {
          return 
        }
        //将状态改为fulfilled
        _this.status = FULFILLED
        //保存value数据
        _this.data = value
        //若有待执行的callback函数，立即异步执行回调函数callback
        if (_this.callbacks) {
          setTimeout(() => {
            _this.callbacks.forEach(callbacksObj => {
              callbacksObj.onResolved(value)
            })
          }, 0)
        }
      }

      function reject(reason) {
        if (_this.status !== PENDING) {
          return 
        }
        //将状态改为rejected
        _this.status = REJECTED
        //保存reason数据
        _this.data = reason
        //若有待执行的callback函数，立即异步执行回调函数callback
        if (_this.callbacks) {
          setTimeout(() => {
            _this.callbacks.forEach(callbacksObj => {
              callbacksObj.onRejected(reason)
            }, 0)
          })
        }
      }

      //立即同步执行excutor
      try {
        excutor(resolve, reject)
      } catch (error) { //若执行器抛出异常，Promise对象变为rejected
        reject(error)
      }
    }
    
    //Promise原型对象的then()
    //指定成功和失败的回调函数
    //函数的返回值为一个新的Promise对象
    then (onResolved, onRejected) {
      const _this = this
      //指定默认的成功定回调，直接向下传递成功的value
      onResolved = typeof onResolved === 'function' ? onResolved : value => value

      //指定默认的失败的回调 实现异常传透的关键步骤
      onRejected = typeof onRejected === 'function' ? onRejected : reason => {throw reason}
      //当前Promise还是pending状态，将回调函数保存起来
      return new Promise ((resolve, reject) => {
        //指定回调函数处理，根据执行结果，改变return的Promise的状态
        function handle (callback) {
          //若抛出异常，则状态变为rejected
          try {
            const result = callback(_this.data)
            if (result instanceof Promise) {
              // result.then(
              //     value => resolve(value), //当result成功时，让return的Promise也成功
              //     reason => reject(reason) //当result失败时，让return的Promise也失败
              //   )
              result.then(resolve, reject)
            } else { //若返回的为非Promise对象，则成功
              resolve(result)
            }
          } catch (error) {
            reject(error)
          }
        }
        if (_this.status === PENDING) {
          _this.callbacks.push({
              onResolved: function (value) {
                handle(onResolved)
              },
              onRejected: function (reason) {
                handle(onRejected)
              }
            })
        } else if (_this.status === FULFILLED) { //当前是fulfilled状态，异步执行onResolved并改变return的Promise的状态
          setTimeout(() => {
            handle(onResolved)
          }, 0)
        } else { //当前是rejected状态，异步执行onRejected并改变return的Promise的状态
          setTimeout(() => {
            //若抛出异常，则状态变为rejected
            handle(onRejected)
          }, 0)
        }
      })
    }

    //Promise原型对象的catch()
    //指定失败的回调函数
    //函数的返回值为一个新的Promise对象
    catch (onRejected) {
      return this.then(undefined, onRejected)
    }

    //Promise函数对象的resolve方法
    //返回一个指定value的成功Promise对象
    static resolve (value) {
      return new Promise ((resolve, reject) => {
        if (value instanceof Promise) {
          value.then(resolve, reject)
        } else {
          resolve(value)
        }
      })
    }

    //Promise函数对象的reject方法
    //返回一个指定reason的失败Promise对象
    static reject (reason) {
      return new Promise ((resolve, reject) => {
        reject(reason)
      })
    }

    //Promise函数对象的all方法
    //返回一个Promise，只有当所有Promises都成功时才成功
    static all (promises) {
      return new Promise ((resolve, reject) => {
        const values = []
        let cnt = 0
        promises.forEach((pros, index) => {
          Promise.resolve(pros).then(
              value => {
                cnt ++
                values[index] = value
                if (cnt === promises.length) {
                  resolve(values)
                }
              },
              reason => {reject(reason)}
            )
        })
      })
    }

    //Promise函数对象的all方法
    //返回一个Promises，其结果由第一个完成的Promise来决定
    static race (promises) {
      return new Promise((resolve, reject) => {
        promises.forEach((pros, index) => {
          Promise.resolve(pros).then(
              value => {
                resolve(values)
              },
              reason => {reject(reason)}
            )
        })
      })
    }

    static resolveDelay(value, time) {
      return new Promise ((resolve, reject) => {
        setTimeout(() => {
          if (value instanceof Promise) {
            value.then(resolve, reject)
          } else {
            resolve(value)
          }
        }, time)
      })
    }

    static rejectDelay(reason, time) {
      return new Promise ((resolve, reject) => {
        setTimeout(() => {
          reject(reason)
        }, time)
      })
    }
  }

  window.Promise = Promise
})(window)