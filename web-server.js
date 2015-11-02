var express = require('express'),
    compression = require('compression'),
    cors = require('cors'),
    path = require('path'),
    serveIndex = require('serve-index'),
    app = express(),
    port = process.argv[2],
    directory = process.argv[3],
    hourMs = 1000 * 60 * 60;


  app.use(compression());
  app.use(cors());

  app.use(express.static(path.normalize(directory)));
  app.use(serveIndex(path.normalize(directory)));


app.listen(port).on('error', function () {})
