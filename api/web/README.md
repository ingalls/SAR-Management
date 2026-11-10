# SAR Management

## Project setup
```
npm install
```

### Mapbox token
Maps need a public Mapbox token at build time. For development, create `.env.local` (gitignored):
```
VITE_MAPBOX_TOKEN=pk.xxxx
```
Production builds read `VITE_MAPBOX_TOKEN` from `deploy.d/.env`.

### Compiles and hot-reloads for development
```
npm run serve
```

### Compiles and minifies for production
```
npm run build
```

### Lints and fixes files
```
npm run lint
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).
