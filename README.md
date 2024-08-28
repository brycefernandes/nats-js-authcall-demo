# nats-js-authcall-demo
Demo project showcasing the authcall features of nats js
The frontend is pretty much the exact same as the original demo with the exception of SSO login.
[Original demo with with GO on github](https://github.com/synadia-io/rethink_connectivity/tree/main/19-auth-callout)
<br />
In this demo we are generating random users using an api and authenticating that.
No google client ID required either. Just install and run.
You can extend this for your custom workflow.
<br />
## Install
This is your typical install
npm install in both the folders where package.json is there
<br />
`npm install`
<br />
`pnpm install`
<br />
`yarn install`
<br />
## Server Configuration
The server configuration is in the nats.conf file.
You can start a server using that. Use debug and trace for detailed tracking.
<br />
`nats-server -c nats.conf --debug --trace`
<br />
For docker see this
https://docs.nats.io/running-a-nats-service/nats_docker
<br />
This project is based off of this video
https://www.youtube.com/watch?v=VvGxrT-jv64
