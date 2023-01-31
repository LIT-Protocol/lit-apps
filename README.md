# Quick start

## Running apps

### Starting a specific app

```
turbo dev --filter [app-folder-name in ./apps dir]
```


### Start the event listener apps

```
yarn dev:el
```

### playground-nodejs

specify file name eg `node-test.mjs`, `main.mjs` in the `src` folder

```
turbo dev --filter playground-nodejs -- node-test.mjs
```
