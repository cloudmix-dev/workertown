FROM node:current-buster

ARG VERSION=0.0.1-alpha.1

ENV PORT=3000

ENV API_KEY=search
ENV USERNAME=search
ENV PASSWORD=search
ENV JWKS_URL=
ENV JWT_SECRET=search

ENV BASE_PATH = "/"

ENV ADMIN_PREFIX="/v1/admin"
ENV ITEMS_PREFIX="/v1/items"
ENV PUBLIC_PREFIX="/"
ENV SEARCH_PREFIX="/v1/search"
ENV SUGGEST_PREFIX="/v1/suggest"
ENV TAGS_PREFIX="/v1/tags"

ENV SCAN_RANGE=1000
ENV STOP_WORDS=

WORKDIR /usr/src/app

# Create package.json
RUN echo "{" \
  "\"name\": \"workertown-search-local\"," \
  "\"private\": true," \
  "\"scripts\": {" \
  "\"start\": \"SEARCH_API_KEY=${API_KEY} SEARCH_USERNAME=${USERNAME} SEARCH_PASSWORD=${PASSWORD} SEARCH_JWKS_URL=${JWKS_URL} SEARCH_JWT_SECRET=${JWT_SECRET} node ./index.js\"" \
  "}," \
  "\"dependencies\": {" \
  "\"@workertown/search\": \"${VERSION}\"," \
  "\"@workertown/utils\": \"${VERSION}\"" \
  "}" \
  "}" > package.json

# Install dependencies
RUN npm install 

# Create server script
RUN echo "const { search } = require(\"@workertown/search\");\n" \
  "const { SqliteStorageAdapter } = require(\"@workertown/search/storage/sqlite-storage-adapter\");\n" \
  "const { serve } = require(\"@workertown/utils\");\n" \
  "const { PORT, BASE_PATH, ADMIN_PREFIX, ITEMS_PREFIX, PUBLIC_PREFIX, SEARCH_PREFIX, SUGGEST_PREFIX, TAGS_PREFIX, STOP_WORDS, SCAN_RANGE } = process.env;\n" \
  "function exitOnSignal(signal) { process.on(signal, () => process.exit(1)) }\n" \
  "exitOnSignal(\"SIGINT\");\n" \
  "exitOnSignal(\"SIGTERM\");\n" \
  "serve(search({ storage: new SqliteStorageAdapter(), basePath: BASE_PATH, prefixes: { admin: ADMIN_PREFIX, items: ITEMS_PREFIX, public: PUBLIC_PREFIX, search: SEARCH_PREFIX, suggest: SUGGEST_PREFIX, tags: TAGS_PREFIX }, scaneRange: parseInt(SCAN_RANGE, 10), stopWords: STOP_WORDS ? new Set(STOP_WORDS.split(/,\s?/)) : undefined }), { port: parseInt(PORT, 10) });\n" \
  "console.log(\`Server running at http://localhost:${PORT}\`);" > index.js

CMD ["npm", "start"]
