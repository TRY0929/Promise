(function(window) {
  const PENDING = 'pending'
  const FULFILLED = 'fulfilled'
  const REJECTED = 'rejected'
  function Promise (excutor) {
    const _this = this
    _this.status = PENDING
    _this.data = undefined
    _this.callbacks = []

    function resolve(value) {
      if (_this.status !== PENDING) {
        return
      }
      _this.status = FULFILLED
      _this.data = value
      if (_this.callbacks) {
        setTimeout(() => {
          _this.callbacks.forEach((callbackObj, index) => {
            callbackObj.onResolved(value)
          })
        }, 0)
      }
    }

    function reject(reason) {
      if (_this.status !== PENDING) {
        return
      }
      _this.status = REJECTED
      _this.data = reason
      if (_this.callbacks) {
        setTimeout(() => {
          _this.callbacks.forEach((callbackObj, index) => {
            callbackObj.onRejected(value)
          })
        }, 0)
      }
    }

    try {
      excutor(resolve, reject)
    } catch (error) {
      reject(error)
    }
    
  }

  Promise.prototype.then = function (onResolved, onRejected) {
    const _this = this
    onResolved = typeof onResolved === 'function' ? onResolved : value => value
    onRejected = typeof onRejected === 'function' ? onRejected : reason => {throw reason}

    return new Promise((resolve, reject) => {
      function handle (callback) {
        try {
          const result = callback(_this.data)
          if (result instanceof Promise) {
            result.then(resolve, reject)
          } else {
            resolve(result)
          }
        } catch (error) {
          reject(error)
        }
        
      }
      if (_this.status === PENDING) {
        _this.callbacks.push({
          onResolved (value) {handle(onResolved)},
          onRejected (reason) {handle(onRejected)}
        })
      } else if (_this.status === FULFILLED) {
        setTimeout(() => {
          handle(onResolved)
        }, 0)
      } else {
        setTimeout(() => {
          handle(onRejected)
        }, 0)
      }
    })
  }

  Promise.prototype.catch = function (onRejected) {
    this.then(undefined, onRejected)
  }

  Promise.resolve = function (value) {
    return new Promise ((resolve, reject) => {
      if (value instanceof Promise) {
        value.then(resole, reject)
      } else {
        resolve(value)
      }
    })
  }

  Promise.reject = function (reason) {
    return new Promise ((resolve, reject) => {
      reject(reason)
    })
  }

  Promise.all = function (promises) {
    const values = new Array(promises.length)
    const cnt = 0
    return new Promise((resolve, reject) => {
      promises.forEach((p, index) => {
        if (p instanceof Promise) {
          p.then(
              value => {
                values[index] = value
                cnt++
                if (cnt === promises.length) {
                  resolve(values)
                }
              },
              reason => {reject(reason)}
            )
        }
      })
    })
  }

  Promise.race = function (promises) {
    return new Promise((resolve, reject) => {
      promises.forEach((p, index) => {
        p.then(resolve, reject)
      })
    })
  }

  window.Promise = Promise
})(window)