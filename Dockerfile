# ============================================================
# Build
FROM node:12-alpine AS build

COPY . .

RUN npm ci && \
    npm run build

# ============================================================
# Server

FROM node:12-alpine
COPY --from=build dist/ .

ENTRYPOINT ["/usr/local/bin/node", "./dist/cli.js"]

CMD [        \
    "start"  \
]

EXPOSE 3000
