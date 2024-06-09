## README

# Token Bucket Rate Limiter with Express

This project demonstrates a simple Token Bucket Rate Limiter implemented using Node.js, Express, and the `cron` package. The Token Bucket algorithm is used to control the rate of requests to your application by allowing a certain number of tokens to be used per unit of time.

## Prerequisites

Ensure you have the following installed on your machine:
- Node.js (version 14.x or higher)
- npm (Node package manager)

## Installation

1. **Clone the repository:**
    ```sh
    git clone https://github.com/vishalpathakcodes/TokenBucketRateLimiter.git
    cd TokenBucket
    ```

2. **Install the dependencies:**
    ```sh
    npm install
    ```

## Project Structure

- `app.js` (or `index.js`): The main file containing the server and rate limiter logic.
- `package.json`: Contains metadata about the project and its dependencies.

## Code Explanation

### Import Required Modules

```javascript
const { CronJob } = require('cron');
const express = require('express');
```

- `cron`: Used to schedule the refill of tokens at regular intervals.
- `express`: A minimal and flexible Node.js web application framework.

### Initialize Express App and Constants

```javascript
const app = express();
const PORT = process.env.PORT || 3000;
app.use(express.json());
const LIMIT_SIZE = 10;
const TOKENS = [];
```

- `app`: Instance of Express.
- `PORT`: The port number on which the server will run. Defaults to 3000 if not set in environment variables.
- `LIMIT_SIZE`: Maximum number of tokens in the bucket.
- `TOKENS`: Array to store the tokens.

### Token Refill Function

```javascript
const refillBucket = () => {
    if (TOKENS.length < LIMIT_SIZE) {
        TOKENS.push(Date.now());
    }
};
```

- `refillBucket`: Adds a token to the bucket if it's not already full.

### Route to Check Bucket Status

```javascript
app.get('/bucket', (req, res) => {
    res.json({
        bucketLimit: LIMIT_SIZE,
        currentBucketSize: TOKENS.length,
        bucket: TOKENS
    });
});
```

- `GET /bucket`: Returns the current status of the token bucket.

### Rate Limiting Middleware

```javascript
const limitingMiddleware = (req, res, next) => {
    if (TOKENS.length > 0) {
        const token = TOKENS.shift();
        console.log(`Token ${token} is used`);
        res.set('X-Ratelimit-Remaining', TOKENS.length);
        next();
    } else {
        res.status(429).set('X-RateLimit-Remaining', 0).set('Retry-After', 2).json({
            success: false,
            message: 'Too many requests'
        });
    }
};

app.use(limitingMiddleware);
```

- `limitingMiddleware`: Checks if there are tokens available. If yes, it allows the request to proceed. If no, it responds with a 429 status code indicating too many requests.

### Test Route

```javascript
app.get('/test', (req, res) => {
    const ROCK_PAPER_SCISSORS = ['rock 🪨', 'paper 📃', 'scissors ✂️'];
    const randomIndex = Math.floor(Math.random() * 3);
    const randomChoice = ROCK_PAPER_SCISSORS[randomIndex];
  
    res.json({
        success: true,
        message: `You got ${randomChoice}`
    });
});
```

- `GET /test`: Returns a random choice of "rock", "paper", or "scissors".

### Cron Job to Refill Tokens

```javascript
const job = new CronJob('*/2 * * * * *', () => {
    refillBucket();
});
```

- `job`: Cron job that runs the `refillBucket` function every 2 seconds to add tokens to the bucket.

### Start Server and Cron Job

```javascript
app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
    job.start();
});
```

- Starts the Express server and begins the cron job to refill tokens.

## Running the Application

1. **Start the server:**
    ```sh
    node app.js
    ```

2. **Testing the Endpoints:**
    - `GET /bucket`: Check the current status of the token bucket.
    - `GET /test`: Test the rate limiter by trying to access this endpoint multiple times.

## Notes

- The `limitingMiddleware` is applied globally to all routes by using `app.use(limitingMiddleware)`. If you want to limit only specific routes, apply the middleware to those routes individually.
- The `Retry-After` header indicates the client should wait for 2 seconds before retrying, which corresponds to the token refill interval.

By following this guide, you will have a working Token Bucket Rate Limiter in your Express application.
