# Lancement du projet

Compilation du projet

```sh
npx tsc --watch
```

Execution de la migration

```sh
node dist/scripts/migrator.js
```

Execution du script

- Récupérer les données depuis le dashboard (BBB)

```sh
node dist/dashboard.js
```

- Récupérer les données depuis inside

```sh
node dist/inside.js
```

- Récupérer les données depuis slippers

```sh
node dist/slippers.js
```
