# Pendulum Simulator

## Exexccuting project

You'll need dockerr and docker compose to run the project. But everything should be self contained.

``` bash
> docker compose up --build
```

Once the project is running on your local system, open a browser and go to [http://localhost:3000/]

## Things that don't work correctly

## breaking down tasks

- rest intface for setup of pendulums
  - angular offset
  - mass
  - string length
  - radius (optional)
  - color (optional)

- 5 pendulums
- each pendulum has it's own process
- each pendulum is told who it's neighbors are

- one UI
- displaying 5 pendulums
- drag and drop pendulum start position
- config transfered in JSON

- UI has start, pause, stop
- polls the 5 different pendulum instances
- refresh rate of a few frames per second
- each pendulum needs to watch the position of neighbors (via REST)
- When colision is immenient, send STOP to all instances
- STOP sent over MQTT
- After a STOP, wait 5 seconds and RESTART
- RESTART brings all pendulums back to starting configurations

## notes

- 5 pendulums, each with a node process
- each process knows how to contact neighbors with config and
- checks for immenent collisions with neigbors
- each process connects via mqtt
- Why not use mqtt for check on collisions?
- lots to do, probably not going to have enough time to make it nice, just functional

- drag and drop pendulum is odd behavior, how do I determine the anchor once the pendulum moves? angular offset might be fine

- going to assume that the pendulums do not slow down because of a drag coeffient (I feel like that more like how continous robot platform would work)
- selecting a pendulum and dragging it automatically stops the simulation
- since the objects are contained within a array, we need to create custom handlers for each field to make sure the correct pendulum was updated
- updating the string length should update the starting x,y coordinates of the pendulum
- updating the angular offset, needs to update the x,y coordinates
- do the anchor points move? yes, but they need to be entered
- updating the x,y coordinates should update the string length
- updating the radius should update the string length (no need, we will be calculating that the center of the mass is where the string is connected)
- updating the anchorx should update the x coordinate of the pendulum (i.e. it follows, else we need to update the string length and angular offset)

## Docker

``` bash
docker compose up --build
```
