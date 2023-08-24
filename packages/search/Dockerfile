FROM node:current-buster

ARG VERSION=latest

WORKDIR /usr/src/app

ENV PORT=3000
ENV SEARCH_DB=wt_search.sqlite

# Create package.json
RUN echo "{" \
  "\"name\": \"workertown-search-local\"," \
  "\"type\": \"module\"," \
  "\"private\": true," \
  "\"dependencies\": {" \
  "\"@workertown/search\": \"${VERSION}\"," \
  "\"@workertown/node\": \"${VERSION}\"," \
  "\"better-sqlite3\": \"latest\"" \
  "}" \
  "}" > package.json

# Install dependencies
RUN npm install

# Create server script
RUN echo "import { serve } from \"@workertown/node\"\n" \
  "import { exitOnSignals, parseOptionsFromEnv } from \"@workertown/node/utils\";\n" \
  "import { search } from \"@workertown/search\"\n" \
  "import { runtime } from \"@workertown/search/node\"\n" \
  "exitOnSignals();" \
  "serve(search({ ...parseOptionsFromEnv(), runtime }));\n" \
  "console.log(\`Server running at http://localhost:\${process.env.PORT ?? \"3000\"}\`);" > index.js

CMD ["node", "./index.js"]
