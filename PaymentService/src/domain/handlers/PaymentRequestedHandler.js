const CommandHandler = require('@shared/cqrs/CommandHandler');
const PaymentSucceededEvent = require('@shared/events/events/PaymentSucceededEvent');
const PaymentFailedEvent = require('@shared/events/events/PaymentFailedEvent');
const TicketRequestedEvent = require('@shared/events/events/TicketRequestedEvent');
const logger = require('@shared/logger/logger');

class PaymentRequestedHandler extends CommandHandler {

    async handle(command, publisher, userResponseListener) {

        const userEmail  = command.userEmail;
        const reservationId = command.reservationId;

        logger.info(`Processing payment for user: ${userEmail}`);

        const response = await userResponseListener.waitForResponse(userEmail, 30000);
        logger.info(`Received user response: ${response}`);
        if (response === 'yes') {
            const ticketRequestedEvent = new TicketRequestedEvent(userEmail);
            publisher.publish(ticketRequestedEvent)
            logger.info(`Ticket requested for user ${userEmail}.`);

            const paymentSucceededEvent = new PaymentSucceededEvent(userEmail, reservationId);
            publisher.publish(paymentSucceededEvent)
            logger.info(`Payment for user ${userEmail} has been approved.`);
        } else if (response === 'timeout') {
            const paymentFailedEvent = new PaymentFailedEvent(userEmail, reservationId);
            publisher.publish(paymentFailedEvent)
            logger.info(`Payment for user ${userEmail} failed - timeout.`);
        } else {
            const paymentFailedEvent = new PaymentFailedEvent(userEmail, reservationId);
            publisher.publish(paymentFailedEvent)
            logger.info(`Payment for user ${userEmail} failed.`);
        }
      }
}

module.exports = PaymentRequestedHandler;
