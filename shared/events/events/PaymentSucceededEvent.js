const BaseEvent = require('./BaseEvent');

class PaymentSucceededEvent extends BaseEvent {
  static eventName = 'PaymentSucceeded';
  constructor(userEmail, reservationId, selectedPlaces, sessionId) {
    super('PaymentSucceeded', { userEmail, reservationId, selectedPlaces, sessionId });
  }
}

module.exports = PaymentSucceededEvent;
