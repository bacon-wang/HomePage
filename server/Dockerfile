FROM docker.1ms.run/library/node:22-bookworm-slim

WORKDIR /app
ENV NODE_ENV=production

COPY server ./server
COPY index.html styles.css app.js chat-config.js ./
COPY assets ./assets
RUN chmod -R a=rX /app

USER node
EXPOSE 3000
CMD ["node", "server/src/index.js"]
