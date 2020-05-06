const bodyParser = require("body-parser");
const express = require("express");
const { OpenApiValidator } = require("express-openapi-validator");
const jetpack = require("fs-jetpack");
const swagger = require("swagger-ui-express");
const yaml = require("yaml");

const apiSpec = yaml.parse(jetpack.read("./openapi.yaml"));

const server = express();

server.use(bodyParser.json());

new OpenApiValidator({
  apiSpec,
  validateResponses: { removeAdditional: "failing" },
})
  .install(server)
  .then(() => {
    server.use("/spec", (req, res) => res.send(apiSpec));
    server.use("/docs", swagger.serve, swagger.setup(apiSpec));
    server.get("/deep_object", (req, res) => {
      console.log(req.query);
      res.sendStatus(200);
    });

    server.use((err, req, res, next) =>
      res.status(err.status || 500).json({
        message: err.message,
        errors: err.errors,
      })
    );

    server.listen(1234, (err) => {
      if (err) throw err;
      console.log("Runninig on Port 1234");
    });
  });
