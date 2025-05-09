🎬 System Rezerwacji Miejsc w Kinie — Architektura Mikroserwisowa
Projekt przedstawia kompletny system do rezerwacji miejsc w kinie, oparty na architekturze mikroserwisowej. Składa się z 5 niezależnych mikroserwisów, zbudowanych zgodnie z najlepszymi praktykami projektowymi.

⚙️ Kluczowe założenia architektoniczne
CQRS (Command Query Responsibility Segregation) – Każdy mikroserwis oddziela logikę zapisu (komendy) od logiki odczytu (zapytania), co zwiększa skalowalność i przejrzystość kodu.

Clean Architecture – Struktura każdego mikroserwisu została zaprojektowana zgodnie z zasadami czystej architektury, co umożliwia łatwą modyfikację i testowanie kodu.

Event-Driven Architecture (EDA) – Komunikacja między mikroserwisami odbywa się asynchronicznie za pośrednictwem brokera wiadomości (np. Kafka, RabbitMQ), co zapewnia luźne powiązanie i odporność na błędy.

Database per Service – Każdy mikroserwis posiada własną, niezależną bazę danych, co minimalizuje zależności między usługami.

Observability & Logging – System loguje wszystkie istotne operacje i wywoływane metody przy użyciu wspólnego loggera, co wspiera monitorowanie i debugowanie.

Docker – Dla każdego mikroserwisu został przygotowany osobny obraz Dockera, co ułatwia konteneryzację i wdrażanie.

Terraform + AWS – Deployment mikroserwisów do chmury AWS jest w pełni zautomatyzowany z użyciem narzędzia Terraform.

🧩 Mikroserwisy
🎟️ Reservation Service – Zarządza rezerwacjami miejsc.

📽️ Movie Service – Przechowuje dane o seansach filmowych.

💳 Payment Service – Obsługuje płatności za bilety.

🎫 Ticket Service – Generuje bilety po zakończonej płatności.

📩 Notification Service – Wysyła powiadomienia do użytkowników (e-mail/SMS).