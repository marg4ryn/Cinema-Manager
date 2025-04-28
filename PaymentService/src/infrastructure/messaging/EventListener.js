const logger = require('../logging/logger');
const {     PROCESS_PAYMENT, CANCEL_RESERVATION, GENERATE_TICKET } = require('../../domain/PaymentEvents');
const PaymentCommandHandler = require('../../application/PaymentCommandHandler');

class EventListener {
    constructor(channel, publisher) {
        this.channel = channel;
        this.publisher = publisher;
        this.paymentCommandHandler = new PaymentCommandHandler();
    }

    async listen() {
        const queue = PROCESS_PAYMENT;
        await this.channel.assertQueue(queue, { durable: true });
        logger.info(`Listening for events on queue: ${queue}`);

        this.channel.consume(queue, async (msg) => {
            if (msg !== null) {
                const event = JSON.parse(msg.content.toString());
                await this.handleProcessPayment(event);
                this.channel.ack(msg);
            }
        });
    }

    async handleProcessPayment(event) {
        logger.info(`Received event: ${event.eventName}`);
        this.paymentCommandHandler.generate();

        const userResponse = await this.waitForUserResponse(30000);

        if (userResponse) {
            logger.info('User responded positively.');
            await this.publisher.publish({
                eventName: GENERATE_TICKET
            });
        } else {
            logger.info('No response or negative response from user.');
            await this.publisher.publish({
                eventName: CANCEL_RESERVATION
            });
        }
    }

    async waitForUserResponse(timeout) {
        return new Promise((resolve) => {
            const timeoutId = setTimeout(() => resolve(false), timeout);

            this.channel.consume('USER_RESPONSE_QUEUE', (msg) => {
                if (msg !== null) {
                    const response = JSON.parse(msg.content.toString());
                    clearTimeout(timeoutId);
                    resolve(response.answer === 'yes');
                    this.channel.ack(msg);
                }
            });
        });
    }
}

module.exports = EventListener;
