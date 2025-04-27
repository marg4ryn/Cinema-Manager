// src/domain/reservation.js
class Reservation {
    constructor(userId, movieId, seats) {
      this.userId = userId;
      this.movieId = movieId;
      this.seats = seats;
      this.createdAt = new Date();
    }
  }
  
  module.exports = { Reservation };
  