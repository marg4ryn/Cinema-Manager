# Wybieramy bazowy obraz Node.js
FROM node:16

# Tworzymy katalog roboczy w kontenerze
WORKDIR /app

# Kopiujemy pliki package.json i package-lock.json
COPY PaymentService/package*.json ./

# Instalujemy zależności
RUN npm install

# Kopiujemy resztę plików źródłowych
COPY PaymentService/ ./

COPY shared ./shared

# Ustawiamy zmienną środowiskową dla portu
ENV PORT=3003

# Uruchamiamy aplikację
CMD ["node", "src/app.js"]
