# Work(er) man(ager)

Node-workman is an attempt to make a decent worker system for Node.js -powered
applications, however there is no need to for the work generators or workers 
to be written in Node.js.

It provides a simple API for both HTTP and WebSocket -clients, and attempts to
do it's best to not overload any workers.

It also features a task scheduler, but there is no permanent storage available
for it yet.

The primary expectation is that you write your workers with Node.js using
[node-workman-worker](https://github.com/lietu/node-workman-worker), however
due to the simple nature of the communication protocol nothing really prevents 
you from using other languages that can implement the WebSocket -client.

Due to the workman server itself having little involvement in execution of the
tasks it should scale to pretty high amounts of tasks, and thus there is not
yet any support for larger setups, however that might change in the future.

For a simple deployment it is perfectly reasonable to run just a single server
with workman server and your workers both running on the same machine.

Most common use-case is offloading work from your website's API to a cluster of
workers to keep the primary API functions fast. Other example use-cases:

 - Processing file uploads
 - Updating search indexes
 - Sending webhooks out to 3rd party systems
 - Most other things you can imagine


## Description of the architecture

![Architecture diagram](/architecture.jpg?raw=true "Workman architecture")

You will need:

  1. Workman server (this) running somewhere
  2. Workers (using e.g. [node-workman-worker](https://github.com/lietu/node-workman-worker)) 
     on the same machine or other machines
  3. Work generators that send jobs to the Workman server
  
Tasks can return responses to the clients that triggered them, but there is no
need to use this feature.


## Usage

At the simplest you simply clone / download this repository and run:

```bash
npm run start
```


## Configuration

By default node-workman listens to `localhost:9999` for connections, but this
can of course be overridden. The most easy way to override these settings is
via the environment variables `HOST` and `PORT`:

```bash
env HOST=0.0.0.0 PORT=1234 npm run start
``` 


## Security and firewalling

You should make sure you *DO NOT* expose node-workman server APIs to the
Internet by using a well configured firewall, unless you really intend for 
anyone to be running any and all of your worker tasks. Currently there is *NO*
authentication of any kind, and it's assumed that the person hosting this knows
what they are doing, which is indeed a big leap of faith.

To add at least some basic security against accidents the server listens to 
traffic only from `localhost` by default, so you have to either add a proxy or 
change the configuration to expose the server to the network otherwise.

Feel free to contribute an optional authentication scheme in the project.


## HTTP API 

### GET /tasks

Get a [list of registered tasks](#task-list).


### POST /task/{name}

Run task `{name}`. Options for the worker should be passed in as a JSON object
in the POST body.

E.g. to run the task called `work` and give it `{"a": 1, "b": 2}` -options:

```
POST /task/work
{"a":1, "b": 2}
```

The object can be as complex as necessary. The response from your worker will
be returned in a JSON response.

### POST /schedule/{when}/{name}

Run task `{name}` at the time specified in UTC by `{when}` -parameter. The
time should be specified in the `YYYY-MM-DDTHH:MM:SSZ` -format (or 
`new Date().toISOString()`).

The POST body should be the same options JSON object as for running the task.

E.g. to run the task called `work` on *2nd of February 2020 at 20:20:20 UTC*
and give it `{"a": 1, "b": 2}` -options:

```
POST /schedule/2020-02-02T20:20:20Z/work
{"a":1, "b": 2}
```

The [response](#task-scheduled) will contain the ID of the scheduled task, that
you can then use to delete it later if necessary. 


### DELETE /scheduled/{id}

```
DELETE /scheduled/15d7b577015.87d
```

The [response](#task-unscheduled) will tell you if the given task was found.



## WebSocket API

Connecting to the `/websocket` -endpoint of the server allows you to use a more
efficient WebSocket -API to handle tasks.

With the default configuration the server listens to the address
`ws://localhost:9999/websocket`.

### Get tasks

Get a [list of registered tasks](#task-list).

```json
> {"action": "GetTasks"}
< ["task", "anotherTask"]
```

### Run task

To run the task called `work` and give it `{"a": 1, "b": 2}` -options:

```json
> {"action": "RunTask", "name": "work", "options": {"a": 1, "b": 2}}
< ...
```

The options object can be as complex as necessary. 


### Schedule task

Mostly the same as the `RunTask` action above, but additionally takes a `when`
UTC timestamp in `YYYY-MM-DDTHH:MM:SSZ` -format (or `new Date().toISOString()`).

```json
> {"when": "2020-02-02T20:20:20Z", "action": "ScheduleTask", "name": "work", "options": {"a": 1, "b": 2}}
< {"id": "<scheduled task id>"}
```

[Returns an ID](#task-scheduled) you can store somewhere to later unschedule the task if necessary.


### Unschedule task

Simply removes the task with the given ID from the schedule, if it exists.
[Return value](#task-unscheduled) indicates if the task was found or not.

```json
> {"id": "<scheduled task id>"}
< {"found": true}
```


### Nonces for WebSocket requests

If you want the response you will likely also want to provide a `nonce` so you
know which request you're getting the response for, in which case the response
format will be adapted to the following:

```json
> {"action": "RunTask", "name": "work", "nonce": "<nonce>", "options": {"a": 1, "b": 2}}
< {"nonce": "<nonce>", "result": ...}
``` 

If in doubt the following function generates decent nonces:

```javascript
function getNonce() {
    return (Date.now() + Math.random()).toString(16)
}
```

This applies to all requests via the WebSocket interface. 

## Response formats

### Task list

Simply a list of names of the tasks any of the currently connected workers can
process.

```json
["task", "anotherTask"]
```

### Task scheduled

Returns the ID for the scheduled task

```json
{
    "id": "15d7b577015.87d"
}
```

### Task unscheduled

Returns if the task was found

```json
{
    "found": true
}
```


## Contributing

Pull requests and issues are open for any good ideas, but please keep in mind
that this is supposed to stay fairly simple. If in doubt, open an issue to ask
if your proposed idea would be accepted.


### Development

To run the typescript compiler and the server just run:

```bash
yarn dev
```

To run the automated tests:

```bash
yarn test
```


## Licensing

MIT. Need a more open license? Just ask.


# Financial support

This project has been made possible thanks to [Cocreators](https://cocreators.ee) and [Lietu](https://lietu.net). You can help us continue our open source work by supporting us on [Buy me a coffee](https://www.buymeacoffee.com/cocreators).

[!["Buy Me A Coffee"](https://www.buymeacoffee.com/assets/img/custom_images/orange_img.png)](https://www.buymeacoffee.com/cocreators)
