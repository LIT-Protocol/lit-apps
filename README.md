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

### Starting general worker (since this is most used atm.)

```
GITHUB_LIT_ASSETS_REAL_ONLY_API=XXX turbo run dev --filter lit-general-worker -- main.ts
```

Then, you should be able to see your network contract addresses from these apis:

- http://localhost:3031/manzano-contract-addresses
- http://localhost:3031/habanero-contract-addresses
- http://localhost:3031/serrano-contract-addresses
- http://localhost:3031/contract-addresses <-- cayenne

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

# Deploy Notes & Stack

- The whole repo is deployed to Heroku, but we use Procfile to separate the apps (see https://dev.to/tgmarinhodev/how-to-deploy-a-monorepo-with-turborepo-on-heroku-3ge4)

  - when an app is deployed as a worker (no port exposed), you need to prefix your Procfile with `worker:`, eg:

  ```
  worker: cd apps/event-listener-be && yarn start
  ```

  Otherwise,

  ```
  web: cd apps/event-listener-fe && yarn start
  ```

```
heroku buildpacks:add -a event-listener-fe heroku-community/multi-procfile
heroku buildpacks:add -a event-listener-fe heroku/nodejs

heroku buildpacks:add -a event-listener-be heroku-community/multi-procfile
heroku buildpacks:add -a event-listener-be heroku/nodejs
```

- pm2-runtime is used for worker app, it will be connected to the pm2 dashboard automatically when PM2_PUBLIC_KEY and PM2_SECRET_KEY env keys are provided

- hotjar is installed

# Creating a new app and setup for Heroku

## Quick Start

1. Create a `Procfile` file in your app

> A Procfile is a configuration file used by the Heroku platform to specify the command(s) required to start your application. It defines the process types and entry points for your app, allowing Heroku to understand how to run your application correctly.

```
web: cd apps/lit-general-worker && yarn start
```

2. Add buildpacks to your app

> Theses command adds a buildpack to your Heroku application, specifying that you are using the heroku/nodejs and heroku-community/multi-procfile buildpack. `heroku/nodejs` is the official Node.js buildpack provided by Heroku, and `multi-procfile` allows you to use multiple Procfiles in your application, which can be useful if you have multiple processes or applications in your repository that you want to deploy separately.

```
heroku buildpacks:add -a lit-general-worker heroku-community/multi-procfile
heroku buildpacks:add -a lit-general-worker heroku/nodejs
```

Note: if you see `›   Error: Couldn't find that app. ›   Error ID: not_found` that's because you have to create a Heroku app first

3. Set environment variables

You can either do this in the CLI, or on the Heroku dashboard

```
heroku config:set APP_ENV=lit-general-worker -a lit-general-worker
heroku config:set PROCFILE=apps/lit-general-worker/Procfile -a lit-general-worker

<!-- optionals -->
heroku config:set PINATA_API_KEY=XXXXX -a lit-general-worker
heroku config:set PINATA_SECRET_KEY=XXXXX -a lit-general-worker
heroku config:set PM2_PUBLIC_KEY=XXXXX -a lit-general-worker
heroku config:set PM2_SECRET_KEY=XXXXX -a lit-general-worker
```

# Vercel setting

![](https://i.ibb.co/Wg1bhmp/Xnapper-2023-09-07-17-18-16.png)