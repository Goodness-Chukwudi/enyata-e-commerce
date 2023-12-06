# ENYATA BE ENGINEER TEST

## Introduction

This project was built using Node.js, Express, Typescript, Postgres db and containerized with docker. It is a mini e-commerce system that enables the following actions: user sign-up and authentication, product creation and management and order creation and management.

## Prerequisites

The following items are required in your environment to run this application:

- Node.js
- NPM
- Postgres DB
- Environment variables

Below is a list of the variables needed in your .env file
    ENVIRONMENT
    PORT
    ALLOWED_ORIGINS
    API_VERSION
    JWT_PRIVATE_KEY
    JWT_EXPIRY
    SENDGRID_SENDER_EMAIL
    SENDGRID_API_KEY

    SUPER_ADMIN_FIRST_NAME
    SUPER_ADMIN_MIDDLE_NAME
    SUPER_ADMIN_LAST_NAME
    SUPER_ADMIN_EMAIL
    SUPER_ADMIN_PHONE
    SUPER_ADMIN_GENDER

    DB_HOST
    DB_USER
    DB_PASSWORD
    DB_NAME
    DB_PORT

## Set up

To run this application, run npm install to install the specified dependencies. Use "npm run dev" to start the app on dev environment and "npm run start:docker" to start tha app with docker. The npm scripts to run the application for different environments has been specified in the package.json

## Usage

Please refer to the postman documentation via the link below for a list of available endpoints and their usage.
https://www.postman.com/winter-robot-266289/workspace/enyata/collection/26100881-a672211e-7da2-4ed0-ad28-adc68e805a74?action=share&creator=26100881

Kindly reach out if you need further information
