FROM node:current-buster

ARG VERSION=latest

WORKDIR /usr/src/app

ENV PORT=3000

# Create package.json
RUN echo "{" \
  "\"name\": \"workertown-pub-sub-local\"," \
  "\"type\": \"module\"," \
  "\"private\": true," \
  "\"dependencies\": {" \
  "\"@workertown/pub-sub\": \"${VERSION}\"," \
  "\"@workertown/node\": \"${VERSION}\"," \
  "\"better-sqlite3\": \"latest\"" \
  "}" \
  "}" > package.json

# Install dependencies
RUN npm install

# Create server script
RUN echo "import { serve } from \"@workertown/node\"\n" \
  "import { exitOnSignals, parseOptionsFromEnv } from \"@workertown/node/utils\";\n" \
  "import { pubSub } from \"@workertown/pub-sub\"\n" \
  "import { runtime } from \"@workertown/pub-sub/node\"\n" \
  "exitOnSignals();" \
  "serve(pubSub({ ...parseOptionsFromEnv(), runtime }));\n" \
  "console.log(\`Server running at http://localhost:\${process.env.PORT ?? \"3000\"}\`);" > index.js

CMD ["node", "./index.js"]
