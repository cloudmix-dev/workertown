FROM node:current-alpine

ARG VERSION=0.0.0

ENV API_KEY=search
ENV USERNAME=search
ENV PASSWORD=search
ENV JWKS_URL=
ENV JWT_SECRET=search

WORKDIR /usr/src/app

RUN npm i -g wrangler

# Create package.json
RUN echo "{" \
  "\"name\": \"workertown-search-local\"," \
  "\"private\": true," \
  "\"dependencies\": {" \
  "\"@workertown/search\": \"${VERSION}}\"" \
  "}" \
  "}" > package.json
# Create wrangler.toml
RUN echo "name = \"search\"" \
  "main = \"src/worker.js\"" \
  "compatibility_date = \"2023-05-30\"" \
  "[[d1_databases]]" \
  "binding = \"SEARCH_DB\"" \
  "database_name = \"search\"" \
  "database_id = \"local\"" \
  "database_preview_id = \"local\"" > wrangler.toml
# Create worker script
RUN echo "import search from \"./search\";" \
  "export default search();" > src/worker.js

CMD ["wrangler", "dev", "--var", "SEARCH_API_KEY:${API_KEY}", "SEARCH_USERNAME:${USERNAME}", "SEARCH_PASSWORD:${PASSWORD}", "SEARCH_JWKS_URL:${JWKS_URL}", "SEARCH_JWT_SECRET:${JWT_SECRET}"],
