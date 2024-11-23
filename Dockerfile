# use the official Bun image
# see all versions at https://hub.docker.com/r/oven/bun/tags
FROM oven/bun:1 AS base
WORKDIR /usr/src/app

# Development stage - new addition
FROM base AS development
COPY package.json bun.lockb ./
RUN bun install
COPY ./src ./src
COPY ./package.json .
COPY ./tsconfig.json .
COPY ./drizzle.config.ts .
CMD ["bun", "--hot", "run", "src/index.ts"]

# install dependencies into temp directory
# this will cache them and speed up future builds
FROM base AS install
RUN mkdir -p /temp/dev
COPY package.json bun.lockb /temp/dev/
WORKDIR /temp/dev
RUN bun install --frozen-lockfile

# install with --production flag to avoid installing dev dependencies
RUN mkdir -p /temp/prod
COPY package.json bun.lockb /temp/prod/
WORKDIR /temp/prod
RUN bun install --frozen-lockfile --production

# copy node_modules from temp directory
# then copy all (non-ignored) project files into the image
FROM base AS prerelease
COPY --from=install /temp/dev/node_modules node_modules
COPY ./src ./src
COPY ./package.json .
COPY ./tsconfig.json .
COPY ./drizzle.config.ts .

# copy production dependencies and source code into final image
FROM base AS release
COPY --from=install /temp/prod/node_modules node_modules
COPY --from=prerelease /usr/src/app/src ./src
COPY --from=prerelease /usr/src/app/package.json .
COPY --from=prerelease /usr/src/app/tsconfig.json .
COPY --from=prerelease /usr/src/app/drizzle.config.ts .

RUN chown -R bun:bun /usr/src/app

# run the app
USER bun
EXPOSE 8998/tcp

# Create a shell script to run migrations and start the app
COPY --chmod=755 <<EOF /usr/src/app/start.sh
#!/bin/sh
echo "Running database migrations..."
bun run db:migrate
echo "Starting the application..."
exec bun run src/index.ts
EOF

ENTRYPOINT [ "/usr/src/app/start.sh" ]

