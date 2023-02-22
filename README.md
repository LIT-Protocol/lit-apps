# Prerequisite

```
yarn global add turbo
```

# Quick start

## install

```
yarn
```

## Running apps

### Starting a specific app

```
// turbo dev --filter ["name" in package.json]
turbo dev --filter playground-nextjs
```

### Starting all apps

```
yarn dev
```

### playground-nodejs

specify file name eg `node-test.mjs`, `main.mjs` in the `src` folder

```
// passing params using '--' 
turbo dev --filter playground-nodejs -- node-test.mjs
```

# Setting up test on your monorepo

https://jestjs.io/docs/getting-started#using-babel

# Monorepo Workflow TODO

[] Upon building, add root .env to projects that are depended on

# Deploy Notes

- The whole repo is deployed to Heroku, but we use Procfile to separate the apps (see https://dev.to/tgmarinhodev/how-to-deploy-a-monorepo-with-turborepo-on-heroku-3ge4)

    - when an app is deployed as a worker (no port exposed), you need to prefix your Procfile with `worker:`, eg:

    ```
    worker: cd apps/event-listener-be && yarn start
    ```

    Otherwise,

    ```
    web: cd apps/event-listener-fe && yarn start
    ```


- pm2-runtime is used for worker app, it will be connected to the pm2 dashboard automatically when PM2_PUBLIC_KEY and PM2_SECRET_KEY env keys are provided

- hotjar is installed