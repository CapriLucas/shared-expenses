# Shared Expenses App

A React-based shared expenses management system that allows users to track and manage shared expenses with others.

## Features

- User authentication via Google OAuth
- Create and manage shared expenses
- Support for recurring expenses (monthly, weekly, yearly)
- Payment verification with receipt upload
- Real-time expense tracking and notifications

## Tech Stack

### Frontend

- React.js (TypeScript)
- Custom CSS (no UI libraries)
- React Router for navigation
- React Query for data fetching

### Backend

- Node.js with Express
- PostgreSQL database
- TypeORM for database management
- AuthJs 2.0 for authentication
- File storage for receipts

## Project Structure

Instructions:
I want to create a project with reactJS. Without any css library or components library as chakra-ui. This project will be a simple shared expenses system. Where we can create users (only using google oauth) and then each user will create shared expenses with another users (these can be recurrent per month, year, weeks). So then the other user can create a pay confirmed request uploading a file with the transfer receipt.
As Database I want to use any cheap sql (mysql, postgresql) with typeorm as ORM
