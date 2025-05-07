FROM node:16

WORKDIR /app

# Kopiujemy package.json z NotificationService (TYLKO ten, nie shared!)
COPY NotificationService/package*.json ./

# Instalujemy zależności
RUN npm install

# Kopiujemy kod NotificationService
COPY NotificationService/ ./

# Kopiujemy katalog shared (WAŻNE: z odpowiednią ścieżką!)
COPY shared ./shared

# Rejestracja aliasów (upewnij się, że module-alias jest zainstalowany)
RUN npm install module-alias

ENV PORT=3005

CMD ["node", "src/app.js"]
