# nats-js-authcall-demo
Demo project showcasing the authcall features of nats js
The frontend is pretty much the exact same as the original demo
[Original demo with with GO](https://github.com/synadia-io/rethink_connectivity/tree/main/19-auth-callout)

## Install
This is your typical install
npm install in both the folders where package.json is there
`npm install`
`pnpm install`
`yarn install`

## Server Configuration
The server configuration is in the nats.conf file.
You can start a server using that. Use debug and trace for detailed tracking.
`nats-server -c nats.conf --debug --trace`

For docker see this
https://docs.nats.io/running-a-nats-service/nats_docker

This project is based off of this video
https://www.youtube.com/watch?v=VvGxrT-jv64
