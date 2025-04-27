class CreateReservationCommand {
    constructor(userId, movieId, seats) {
      this.userId = userId;
      this.movieId = movieId;
      this.seats = seats;
    }
  }
  
  module.exports = CreateReservationCommand;
  