const UserResponseListener = require('../domain/interfaces/UserResponseListener');
const EventEmitter = require('events');

class HttpUserResponseListener extends UserResponseListener {
  constructor() {
    super();
    this.emitter = new EventEmitter();
  }

  registerResponse(userId, answer) {
    this.emitter.emit(`response:${userId}`, answer);
  }

  async waitForResponse(userId, timeoutMs = 30000) {
    return new Promise((resolve) => {
      const listener = (response) => {
        resolve(response);
        clearTimeout(timer);
      };

      this.emitter.once(`response:${userId}`, listener);

      const timer = setTimeout(() => {
        this.emitter.removeListener(`response:${userId}`, listener);
        resolve('timeout');
      }, timeoutMs);
    });
  }
}

module.exports = HttpUserResponseListener;
