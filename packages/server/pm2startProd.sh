#!/bin/bash

# npm install -g pm2
# pm2 install typescript
# npm install -g ts-node

pm2 stop process.json --env production

pm2 start process.json --env production

echo "Please check the MongoDB is running!"
