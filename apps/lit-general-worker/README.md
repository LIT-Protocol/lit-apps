# Lit General Worker

**URL:** [https://lit-general-worker.herokuapp.com/](https://lit-general-worker.herokuapp.com/)

The Lit General Worker is both an API and a background worker designed to handle various tasks.

## Features

- **JS-SDK Transaction Handler**: Handles transactions for the JavaScript SDK.

## Endpoints

### JS-SDK Transaction Handler

| Endpoint         | Method | URL                 | Description                                                                                                     |
| ---------------- | ------ | ------------------- | --------------------------------------------------------------------------------------------------------------- |
| Process          | POST   | `/process`          | Takes a "name" parameter (e.g., "test name") and adds it to the memory queue, increasing the queue length to 1. |
| Wait Until Empty | GET    | `/wait-until-empty` | Waits until the queue length is 0.                                                                              |
| Resolve          | POST   | `/resolve`          | Shifts the queue length back to 0.                                                                              |

## Usage

1. Make a synchronous call to the `/process` endpoint to start the queue.
2. Await the `/wait-until-empty` request until the queue length becomes 0. This ensures that any previous calls have been processed.
3. Perform a custom action, such as sending a transaction.
4. Await the `/resolve` request to shift the queue length back to 0.

## Example

- [tx-handler.ts](https://github.com/LIT-Protocol/js-sdk/blob/bbb2814525eb09df30e74533ab21cf900ec1c409/tx-handler.ts)
