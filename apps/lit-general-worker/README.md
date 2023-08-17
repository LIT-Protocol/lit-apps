# Lit General Worker

**URL:** [https://lit-general-worker.herokuapp.com/](https://lit-general-worker.herokuapp.com/)

The Lit General Worker is both an API and a background worker designed to handle various tasks.

# Features

- **JS-SDK Transaction Handler**: Handles transactions for the JavaScript SDK.
- **Analytics Service**: Collects and aggregates analytics data.

# Endpoints

### JS-SDK Transaction Handler

| Endpoint         | Method | URL                 | Description                                                                                                     |
| ---------------- | ------ | ------------------- | --------------------------------------------------------------------------------------------------------------- |
| Process          | POST   | `/process`          | Takes a "name" parameter (e.g., "test name") and adds it to the memory queue, increasing the queue length to 1. |
| Wait Until Empty | GET    | `/wait-until-empty` | Waits until the queue length is 0.                                                                              |
| Resolve          | POST   | `/resolve`          | Shifts the queue length back to 0.                                                                              |

### Analytics Service

| Endpoint      | Method | URL         | Description                          |
| ------------- | ------ | ----------- | ------------------------------------ |
| Collect Data  | POST   | `/collect`  | Collects analytics data.             |
| Retrieve Data | GET    | `/retrieve` | Retrieves aggregated analytics data. |

# Usage

### JS-SDK Transaction Handler

1. Make a synchronous call to the `/process` endpoint to start the queue.
2. Await the `/wait-until-empty` request until the queue length becomes 0. This ensures that any previous calls have been processed.
3. Perform a custom action, such as sending a transaction.
4. Await the `/resolve` request to shift the queue length back to 0.

### Analytics Service

1. Make a POST request to the `/collect` endpoint to send analytics data to the server. The request payload should be a JSON object with the following format:

```json
{
  "date": "2023-08-17",
  "functionName": "myFunction",
  "executionTime": 100
}
```

### Example in JS

```js
// Collect data
async function collectData(date, functionName, executionTime) {
  const response = await fetch("http://localhost:3031/collect", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ date, functionName, executionTime }),
  });

  const data = await response.json();
  console.log(data);
}

// Retrieve data
async function retrieveData() {
  const response = await fetch("http://localhost:3031/retrieve");
  const data = await response.json();
  console.log(data);
}

// Example usage
collectData("2023-08-17", "myFunction", 100);
retrieveData();
```

### Example in CURL

/collect

```bash
curl -X POST http://localhost:3031/collect \
-H "Content-Type: application/json" \
-d '{"date":"2023-08-17","functionName":"myFunction","executionTime":100}'
```

/retrive

```bash
curl http://localhost:3031/retrieve
```

### DB Schema

```
CREATE TABLE analytics (
  id SERIAL PRIMARY KEY,
  date DATE NOT NULL,
  function_name TEXT NOT NULL,
  execution_time INTEGER
);
```
