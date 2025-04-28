# Cinema-Manager
Cloud programming project.

node src/infrastructure/messaging/EventSubscriber.js

node src/server.js

POST http://localhost:3000/api/reservations
Body:
{
  "userId": "123",
  "movieId": "456",
  "seats": ["A1", "A2"]
}
