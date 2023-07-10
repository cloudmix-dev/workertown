FROM node:current-alpine

ARG VERSION=0.0.0

ENV API_KEY=search
ENV USERNAME=search
ENV PASSWORD=search
ENV JWKS_URL=
ENV JWT_SECRET=search

WORKDIR /usr/src/app

# Create package.json
RUN echo "{" \
  "\"name\": \"workertown-search-local\"," \
  "\"private\": true," \
  "\"dependencies\": {" \
  "\"@workertown/search\": \"${VERSION}}\"" \
  "\"@workertown/utils\": \"${VERSION}}\"" \
  "}" \
  "}" > package.json
# Create server script
RUN echo "const { search } = require(\"./search\");" \
  "const { SqliteStorageAdapter } = require(\"@workertown/search/storage/sqlite-storage-adapter\");" \
  "const { serve } = require(\"@workertown/utils\");" \
  "server(search({ storage: new FeatureFlagsStorageAdapter() }));" > index.js

CMD ["SEARCH_API_KEY=${API_KEY}", "SEARCH_USERNAME=${USERNAME}", "SEARCH_PASSWORD=${PASSWORD}", "SEARCH_JWKS_URL=${JWKS_URL}", "SEARCH_JWT_SECRET=${JWT_SECRET}", "node", "./index.js"],
