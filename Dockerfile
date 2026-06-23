FROM node:22-alpine AS development

WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

COPY . .

CMD ["yarn", "dev"]

FROM development AS build

ARG DATABASE_URL=postgresql://build:build@localhost:5432/build
ENV DATABASE_URL=$DATABASE_URL

RUN yarn prisma generate
RUN yarn build

FROM node:22-alpine AS production

WORKDIR /app
ENV NODE_ENV=production

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile --production --ignore-scripts

COPY --from=build /app/dist ./dist

EXPOSE 4000

CMD ["node", "dist/index.js"]
