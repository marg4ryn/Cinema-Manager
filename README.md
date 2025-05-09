## 🎬 Cinema Seat Reservation System
The project presents a complete system for booking seats in a cinema, based on a microservice architecture. It consists of 5 independent microservices, built in accordance with the best design practices.

### ⚙️ Key architectural assumptions
- CQRS (Command Query Responsibility Segregation) - Each microservice separates the write logic (commands) from the read logic (queries), which increases the scalability and clarity of the code.

- Clean Architecture - The structure of each microservice has been designed in accordance with the principles of clean architecture, which allows for easy modification and testing of the code.

- Event-Driven Architecture (EDA) - Communication between microservices takes place asynchronously via a message broker (e.g. Kafka, RabbitMQ), which ensures loose coupling and fault tolerance.

- Database per Service – Each microservice has its own, independent database, which minimizes dependencies between services.

- Observability & Logging – The system logs all important operations and invoked methods using a common logger, which supports monitoring and debugging.

- Docker – A separate Docker image has been prepared for each microservice, which facilitates containerization and deployment.

- Terraform + AWS – Deployment of microservices to the AWS cloud is fully automated using the Terraform tool.

### 🧩 Microservices
- 🎟️ Reservation Service – Manages seat reservations.

- 📽️ Movie Service – Stores data on movie screenings.

- 💳 Payment Service – Handles ticket payments.

- 🎫 Ticket Service – Generates tickets after payment is completed.

- 📩 Notification Service – Sends notifications to users (e-mail/SMS).
