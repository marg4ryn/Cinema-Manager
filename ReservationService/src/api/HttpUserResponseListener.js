const UserResponseListener = require('../domain/interfaces/UserResponseListener');
const EventEmitter = require('events');

class HttpUserResponseListener extends UserResponseListener {
  constructor() {
    super();
    this.emitter = new EventEmitter();
  }

  async resetListeners() {
    this.emitter.removeAllListeners();
  }

  registerResponse(type, answer) {
    this.emitter.emit(`response:${type}`, answer);
  }

  async waitForSession() {
    await this.resetListeners();
    return new Promise((resolve) => {
      this.emitter.once('response:session', resolve);
    });
  }

  async waitForReservations() {
    await this.resetListeners();
    return new Promise((resolve) => {
      this.emitter.once('response:seat', resolve);
    });
  }
}

module.exports = HttpUserResponseListener;
