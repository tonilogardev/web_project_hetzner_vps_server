# Etapa de Build (opcional pero bueno para multi-stage)
# FROM node:20-alpine as builder
# WORKDIR /app
# COPY package*.json ./
# RUN npm ci # Usar 'ci' para instalaciones limpias basadas en lockfile
# COPY . .

# Etapa Final
FROM node:20-alpine

WORKDIR /app

# Argumento para determinar qué dependencias instalar
ARG NODE_ENV=production

# Copiar package.json y package-lock.json
COPY package*.json ./

# Instalar dependencias condicionalmente
RUN if [ "$NODE_ENV" = "development" ] ; then npm ci ; else npm ci --only=production ; fi

# Copiar el resto del código de la aplicación (respetando .dockerignore)
COPY . .

# Exponer el puerto en el que escucha la aplicación
EXPOSE 3000

# Establecer variables de entorno
ENV NODE_ENV=$NODE_ENV
#ENV PORT=3000 redundante


# Comando por defecto (se sobrescribe con docker-compose command)
# En desarrollo: npm run dev (nodemon)
# En producción: npm run start (node)
CMD [ "npm", "start" ]



