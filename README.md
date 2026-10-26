# ReSell Hub

ReSell Hub is a full-stack second-hand marketplace platform where users can buy and sell pre-owned products.

## Project Purpose

The purpose of ReSell Hub is to provide a user-friendly marketplace for buying and selling second-hand products.

## Key Features

- Buyer, Seller, and Admin dashboards
- User authentication and Google login
- Product listing, searching, and filtering
- Seller product management
- Admin product approval
- Buyer wishlist
- Shopping cart and Stripe test checkout
- Order management and payment history
- Seller sales analytics
- Responsive user interface

## Technologies Used

- React
- Vite
- JavaScript
- CSS
- Node.js
- Express.js
- MongoDB
- Stripe

## Run Locally

Install dependencies:

```bash
npm install
```

Start the frontend development server:

```bash
npm run dev
```

## Environment Variables

Create a `.env` file using `.env.example` as a reference.

## Live Website

https://resell-hub-client-tan.vercel.app/

## Backend Repository

https://github.com/nelomelma/Resell-Hub-Server


## Frontend Deployment on Vercel

1. Push the client repository to GitHub.
2. Import the repository into Vercel.
3. Select Vite as the framework preset.
4. Set the build command to `npm run build`.
5. Set the output directory to `dist`.
6. Configure `VITE_API_URL` with the deployed backend API URL, ending in `/api`.
7. Deploy the application.

### Client-Side Routing

The `vercel.json` file configures SPA rewrites so that React Router pages can be opened or refreshed directly.

### Pre-Deployment Checks

Run the following commands before deployment:

```bash
npm run verify
npm run check:deploy
```

### Production Environment

Example:

```env
VITE_API_URL=https://your-backend-domain.com/api
```

Do not place private API keys or server secrets in frontend environment variables.

**Note:** The environment validation script checks `.env.example`, not the deployed environment variables. Configure `VITE_API_URL` separately in Vercel.


## Environment Validation

The frontend includes an environment validation script to check the example API configuration.

Run:

```bash
npm run check:env
```

This checks whether `.env.example` contains a valid `VITE_API_URL`.

For complete pre-deployment verification, run:

```bash
npm run verify
```

This command checks the Vite configuration, example environment URL, Vercel configuration, and production build.

**Note:** The environment validation script checks `.env.example`, not the deployed environment variables. Configure `VITE_API_URL` separately in Vercel.


## Production Build Validation

After generating a production build, verify that the required output files exist.

Run:

```bash
npm run build
npm run check:build
```

The build validation checks:

- `dist/index.html` exists.
- `dist/assets` exists and is a directory.

A successful check displays:

```text
PASS: Frontend production build output is ready
```

For complete pre-deployment verification, run:

```bash
npm run verify
```

This runs configuration checks, environment example validation, Vercel configuration validation, production build, and build output validation.


## Submission Checklist

Before submitting ReSell Hub:

- Verify the production frontend build using `npm run verify`.
- Confirm that the deployed backend health endpoint responds successfully.
- Test product browsing, login, and dashboard navigation.
- Check that frontend and backend GitHub repositories are accessible.
- Add the live website and backend repository links to this README.

