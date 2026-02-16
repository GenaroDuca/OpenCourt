# 1. Traer Node
FROM node:20-alpine

# 2. Parar en una carpeta interna
WORKDIR /app

# 3. Instalar dependencias
COPY package*.json ./
RUN npm install

# 4. Copiar código
COPY . .

# 5. Arrancar
CMD ["npm", "run", "dev", "--", "--host"]