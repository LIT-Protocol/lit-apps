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