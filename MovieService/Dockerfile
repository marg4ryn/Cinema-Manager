# Wybieramy bazowy obraz Node.js
FROM node:16

# Tworzymy katalog roboczy w kontenerze
WORKDIR /app

# Kopiujemy pliki package.json i package-lock.json
COPY MovieService/package*.json ./

# Instalujemy zależności
RUN npm install

# Kopiujemy resztę plików źródłowych
COPY MovieService/ ./

COPY shared ./shared

# Ustawiamy zmienną środowiskową dla portu
ENV PORT=3002

# Uruchamiamy aplikację
CMD ["node", "src/app.js"]
