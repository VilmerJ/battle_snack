import express from "express";
import cluster from "cluster";
import os from "os";

export default function runServer(handlers) {
  if (cluster.isPrimary) {
    // Fork workers based on the number of CPU cores
    const numCPUs = os.cpus().length;
    console.log(`Master process running with ${numCPUs} workers`);

    for (let i = 0; i < numCPUs; i++) {
      cluster.fork();
    }

    cluster.on("exit", (worker, code, signal) => {
      console.log(
        `Worker ${worker.process.pid} died with code ${code} and signal ${signal}`
      );
      console.log("Starting a new worker");
      cluster.fork();
    });
  } else {
    // Worker processes
    const app = express();
    app.use(express.json());

    app.get("/", (req, res) => {
      res.send(handlers.info());
    });

    app.post("/start", (req, res) => {
      handlers.start(req.body);
      res.send("ok");
    });

    app.post("/move", (req, res) => {
      res.send(handlers.move(req.body));
    });

    app.post("/end", (req, res) => {
      handlers.end(req.body);
      res.send("ok");
    });

    app.use(function (req, res, next) {
      res.set("Server", "battlesnake/github/starter-snake-javascript");
      next();
    });

    const host = "0.0.0.0";
    const port = process.env.PORT || 8000;

    app.listen(port, host, () => {
      console.log(`Worker ${process.pid} running at http://${host}:${port}`);
    });
  }
}
