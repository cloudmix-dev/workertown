FROM node:current-buster

ARG VERSION=0.0.1-alpha.11

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
  "import { runtime } from \"@workertown/search/node\"\n" \
  "import { serve } from \"@workertown/node\"\n" \
  "import { exitOnSignals, parseOptionsFromEnv } from \"@workertown/node/utils\";\n" \
  "exitOnSignals();" \
  "serve(search({ ...parseOptionsFromEnv(), runtime }));\n" \
  "console.log(\`Server running at http://localhost:\${process.env.PORT ?? \"3000\"}\`);" > index.js

CMD ["node", "./index.js"]
