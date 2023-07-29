FROM node:current-buster

ARG VERSION=latest

WORKDIR /usr/src/app

ENV PORT=3000

# Create package.json
RUN echo "{" \
  "\"name\": \"workertown-feature-flags-local\"," \
  "\"type\": \"module\"," \
  "\"private\": true," \
  "\"dependencies\": {" \
  "\"@workertown/feature-flags\": \"${VERSION}\"," \
  "\"@workertown/node\": \"${VERSION}\"," \
  "\"better-sqlite3\": \"latest\"" \
  "}" \
  "}" > package.json

# Install dependencies
RUN npm install

# Create server script
RUN echo "import { serve } from \"@workertown/node\"\n" \
  "import { exitOnSignals, parseOptionsFromEnv } from \"@workertown/node/utils\";\n" \
  "import { featureFlags } from \"@workertown/feature-flags\"\n" \
  "import { runtime } from \"@workertown/feature-flags/node\"\n" \
  "exitOnSignals();" \
  "serve(featureFlags({ ...parseOptionsFromEnv(), runtime }));\n" \
  "console.log(\`Server running at http://localhost:\${process.env.PORT ?? \"3000\"}\`);" > index.js

CMD ["node", "./index.js"]
