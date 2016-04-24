FROM mhart/alpine-node:latest

# Copy code
RUN mkdir /app
WORKDIR /app
ADD /src .

# Native Dependencies
RUN apk add --update make gcc g++

# Install modules
RUN npm install
RUN npm install -g nodemon

EXPOSE 3000

CMD ["npm", "start"]
