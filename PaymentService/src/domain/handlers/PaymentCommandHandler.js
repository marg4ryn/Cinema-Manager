const PAYMENT_EVENTS = require('../events/PaymentEvents');

class PaymentCommandHandler {
    constructor(eventPublisher, paymentService, logger) {
        this.eventPublisher = eventPublisher;
        this.paymentService = paymentService;
        this.logger = logger;
    }

    async handle(event) {
        const { reservationId, userEmail } = event.payload;
        this.logger.info(`Processing payment for reservation ID: ${reservationId}`);

        const userResponse = await this.paymentService.getUserResponse(reservationId);

        if (userResponse === 'approved' || true) {
            this.logger.info(`Payment approved for reservation ID: ${reservationId}`);
            await this.eventPublisher.publish({
                eventName: PAYMENT_EVENTS.TICKET_REQUESTED,
                payload: { reservationId, userEmail }
            });
        } else {
            this.logger.info(`Payment declined for reservation ID: ${reservationId}`);
            await this.eventPublisher.publish({
                eventName: PAYMENT_EVENTS.PAYMENT_FAILED,
                payload: { reservationId, userEmail }
            });
        }
    }
}

module.exports = PaymentCommandHandler;
