const logger = require('../logging/logger');
const PaymentCommandHandler = require('../../application/PaymentCommandHandler');
const { PROCESS_PAYMENT } = require('../../domain/PaymentEvents');

class EventListener {
    constructor(publisher) {
        this.publisher = publisher;
        this.paymentCommandHandler = new PaymentCommandHandler();
    }

    async listen() {
        await this.publisher.subscribe(PROCESS_PAYMENT, this.handleProcessPaymentEvent.bind(this));
    }

    async handleProcessPaymentEvent(event) {
        logger.info(`Received event: ${event.eventName}`);
        await this.paymentCommandHandler.handleProcessPayment(event, this.publisher);
    }
}

module.exports = EventListener;
