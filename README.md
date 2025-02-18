# Stats Service API

This is a **serverless API** built using **AWS SAM**, **AWS Lambda**, **Amazon API Gateway**, and **Amazon RDS (PostgreSQL)**. The API allows users to store and retrieve session statistics for different courses.

## Features

- **Store and retrieve session statistics** for different courses and users.
- **AWS SAM** for local development and deployment to AWS.
- **PostgreSQL** as the backend database.
- **Result pattern** for error handling.
- **Docker support** for local PostgreSQL database.

---

## Prerequisites

Before running this project, ensure you have the following installed:

- [AWS CLI](https://aws.amazon.com/cli/)
- [AWS SAM CLI](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/install-sam-cli.html)
- [Docker](https://www.docker.com/)
- [Node.js](https://nodejs.org/)
- [PostgreSQL](https://www.postgresql.org/)

---

# Development / Deployment

## Local Development Setup

- Run `npm install` at the root directory
- Ensure Docker is running
- Run the .bat file `compile-and-run-locally.bat`
- This will boot up AWS API Gateway & Postgres locally on your machine
- The docker compose will automatically run the `init.sql` file to initialiase the SQL databases & add sample Courses & UserIDs
- You may interact with the API via the localhostURL

## AWS Deployment Setup

- Run `npm install` at the root directory
- Have docker running
- In the file `online-template.yaml`, update the `MasterUsername`, `MasterUserPassword`, `DATABASE_USER` and `DATABASE_PASSWORD` parameters to something of your choosing
- Run the .bat file `compile-and-run-online.bat`
- Run through the sam deploy guided steps
- This will deploy the infrastructure
- Now, run the command:
- `psql --host rds-hostname --port 5432 --username zak --dbname stats --file init.sql`
- Replace `rds-hostname` with the RDS hostname found in the RDS resource on the AWS console from the web browser.
- Replace `username` with the one chosen when editing the yaml file
- Now the database is setup, you may interact with the API endpoint found on your API Gateway endpoint that has been deployed

# Example Network Requests

When sending a network request, the Database will have some sample userIDs and courseIDs for you to use (see `init.sql`):

- UserIDs:
  - `e8df5aae-870e-46d7-a62b-57b8c6a129a2`
  - `d3b07384-d9a1-4e21-bd7f-662b933ad1af`
  - `123e4567-e89b-12d3-a456-426614174000`
- CourseIDs:
  - `c0a80102-0000-0000-0000-000000000001`
  - `c0a80102-0000-0000-0000-000000000002`
  - `7baaeaa2-07c3-49b6-a57e-59b07d86e137`

## Save a Session

Send a POST request to store a session.

Request:

```
curl -X POST your-endpoint/courses/7baaeaa2-07c3-49b6-a57e-59b07d86e137 \
 -H "Content-Type: application/json" \
 -H "userid: e8df5aae-870e-46d7-a62b-57b8c6a129a2" \
 -H "courseid: 7baaeaa2-07c3-49b6-a57e-59b07d86e137" \
 -d "{\"sessionID\":\"f8fb91fc-136f-443e-9741-2e81e7224964\",\"totalModulesStudied\":5,\"averageScore\":90,\"timeStudied\":120}"
```

Response:

```
{
"message": "Successfully saved session",
}
```

---

## Fetch a Session

Retrieve session details using a GET request.

Request:

```
curl -X GET your-endpoint/courses/7baaeaa2-07c3-49b6-a57e-59b07d86e137/sessions/f8fb91fc-136f-443e-9741-2e81e7224964 \
 -H "userid: e8df5aae-870e-46d7-a62b-57b8c6a129a2" \
 -H "courseid: 7baaeaa2-07c3-49b6-a57e-59b07d86e137" \
 -H "sessionid: f8fb91fc-136f-443e-9741-2e81e7224964"
```

Response:

```
{
"userID": e8df5aae-870e-46d7-a62b-57b8c6a129a2,
"totalModulesStudied": 10,
"averageScore": 55,
"timeStudied": 120,
"courseID": 7baaeaa2-07c3-49b6-a57e-59b07d86e137,
"message": "Successfully found session.",
"found": true
}
```

---

## Fetch Course Lifetime Stats

Retrieve aggregated statistics for a course.

Request:

```
curl -X GET your-endpoint/courses/7baaeaa2-07c3-49b6-a57e-59b07d86e137 \
 -H "userid: e8df5aae-870e-46d7-a62b-57b8c6a129a2" \
 -H "courseid: 7baaeaa2-07c3-49b6-a57e-59b07d86e137"
```

Response:

```
{
"totalModulesStudied": 20,
"averageScore": 85.5,
"timeStudied": 600,
"found": true,
"message": "Successfully retrieved course lifetime stats"
}
```

# File Structure & Code Explanation

## src/core/...

This directory belongs to the domain layer.<br>
It defines the `Session` entity, holding structure and business validation.<br>
It operates independently of external dependencies<br>

## src/application/...

This directory belongs to the application layer that sits between the core business logic (`Session.ts`) and external components (`repositories`).<br>
This service manages and orchestrates interactions between the domain and external components.<br>
Uses the Result Pattern to return results in a structured manner & decouples business logic from database concerns.<br>
It allows different implementations of SessionRepository, e.g switching from PostgreSQL to DynamoDB easily.<br>

## src/infrastructure/repositories/SessionRepository.ts

This directory defines an interface for session-related database operations.<br>
Represents the Port in hexagonal architecture, allowing dependency injection.<br>

## src/infrastructure/repositories/PostgresSessionRepository.ts

Adapter database implementation. Implements SessionRepository using PostgreSQL.<br>
Converts raw DB responses into structured `Result<T>` types.<br>
This keeps DB logic isolated from business logic and enables easy migration to another database system without modifying core logic.<br>

## src/lambdas/..

Each lambda function serves as an adapter to expose the API via AWS API Gateway.
