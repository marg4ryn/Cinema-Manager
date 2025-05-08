const BaseEvent = require('./BaseEvent');

class PaymentSucceededEvent extends BaseEvent {
  static eventName = 'PaymentSucceeded';
  constructor(userEmail, reservationId) {
    super('PaymentSucceeded', { userEmail, reservationId });
  }
}

module.exports = PaymentSucceededEvent;
