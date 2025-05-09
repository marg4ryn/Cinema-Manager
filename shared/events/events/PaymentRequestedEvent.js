const BaseEvent = require('./BaseEvent');

class PaymentRequestedEvent extends BaseEvent {
  static eventName = 'PaymentRequested';
  constructor(userEmail, reservationId, selectedPlaces, sessionId) {
    super('PaymentRequested', { userEmail, reservationId, selectedPlaces, sessionId});
  }
}

module.exports = PaymentRequestedEvent;
