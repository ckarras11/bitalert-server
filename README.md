# BitAlert Server

## Overview
BitAlert Server is the serverside code for BitAlert client side located in this [repo.](https://github.com/ckarras11/bitalert-client) and the direct link for the app is [here!](https://bitalert.netlify.com/).

## Cron Job
There are 5 cron jobs that run constantly.  
1. Get the current market price from BitStamp and push it to the database (every minute)
2. Clear the price collection in the database at midnight
3. Flag alerts that are over 24 hours old to be marked for deletion (every minute)
4. Compares alerts with the current market price, alerts that are triggered are sent an sms message and are then marked for deletion (every minute)
5. Remove alerts that are flagged for deletion at midnight

Cron Jobs are run locally on a rasberry pi server to save costs on server space.

## Twilio
The sms api used in this application is Twilio.

## Routes
There are 4 routes that are stored in seperate router files.
1. `router.get(/api/alerts)` Gets alerts from the db by phonenumber
2. `router.post(/api/alerts)` Adds an alert from the db
3. `router.delete(/api/alerts)` Removes an alert from the db by id
4. `router.get(/api/price)` Gets the market price from the db
