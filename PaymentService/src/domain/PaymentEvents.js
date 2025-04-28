// src/domain/events/events.js

const PAYMENT_EVENT = {
    PROCESS_PAYMENT: 'ProcessPayment',
    PAYMENT_SUCCEEDED: 'PaymentSucceeded',
    PAYMENT_FAILED: 'PaymentFailed'
};

const RESERVATION_EVENT = {
    RESERVATION_REQUESTED: 'ReservationRequested'
};

const TICKET_EVENT = {
    GENERATE_TICKET_REQUESTED: 'GenerateTicketRequested'
};

module.exports = {
    PAYMENT_EVENT,
    RESERVATION_EVENT,
    TICKET_EVENT
};
