FROM node:20.10-alpine

ENV NODE_ENV=development

WORKDIR /app

# add package.json and package-lock.json to the container
ADD package.json package-lock.json ./
# Install dependencies
RUN npm install

# add the rest of the files
ADD .eslintrc.cjs /app/eslintrc.cjs
ADD .prettierrc.json /app/prettierrc.json
ADD index.html /app/index.html
ADD vite.config.js /app/vite.config.js
ADD vitest.config.js /app/vitest.config.js
ADD bin ./bin

# Add execute permissions for entrypoint
RUN chmod +x ./bin/validate-env-vars.sh

# Run the app
ENTRYPOINT ["./bin/validate-env-vars.sh"]
