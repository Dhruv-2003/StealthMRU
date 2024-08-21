# Stealth Micro rollup

A Stealth Address -based privacy enabling micro rollup for all EVM blockchains.


## Project Structure 

```
│ 
├──  src
│   ├── state.ts
│   ├── machine.stackr.ts
│   ├── actions.ts
│   ├── transitions.ts
│   ├── index.ts
│   ├── stealth.ts
│
│── stackr.config.ts
│── deployment.json

```

## How to run ?

### Run using Node.js :rocket:

```bash
npm start
```

### Run using Docker :whale:

- Build the image using the following command:

```bash
# For Linux
docker build -t {{projectName}}:latest .

# For Mac with Apple Silicon chips
docker buildx build --platform linux/amd64,linux/arm64 -t {{projectName}}:latest .
```

- Run the Docker container using the following command:

```bash
# If using SQLite as the datastore
docker run -v ./db.sqlite:/app/db.sqlite -p <HOST_PORT>:<CONTAINER_PORT> --name={{projectName}} -it {{projectName}}:latest

# If using other URI based datastores
docker run -p <HOST_PORT>:<CONTAINER_PORT> --name={{projectName}} -it {{projectName}}:latest
```
