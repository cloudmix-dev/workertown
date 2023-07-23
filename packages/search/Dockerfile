FROM node:current-buster

ARG VERSION=0.0.1-alpha.9

WORKDIR /usr/src/app

ENV PORT=3000

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
RUN echo "import { search } from \"@workertown/search\"\n" \
  "import { SqliteStorageAdapter } from \"@workertown/search/storage/sqlite\"\n" \
  "import { serve } from \"@workertown/node\"\n" \
  "import { exitOnSignals, parseOptionsFromEnv } from \"@workertown/node/utils\";\n" \
  "exitOnSignals();" \
  "serve(search({ ...parseOptionsFromEnv(), storage: new SqliteStorageAdapter() }));\n" \
  "console.log(\`Server running at http://localhost:\${process.env.PORT}\`);" > index.js

CMD ["node", "./index.js"]
