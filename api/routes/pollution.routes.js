module.exports = app => {
    const pollution = require("../controllers/pollution.controllers.js");
    const authMiddleware = require("../middleware/auth.middleware.js");
  
    var router = require("express").Router();
  
  // Routes publiques
  router.get("/", pollution.get);
  router.get("/:id", pollution.getOne);
  
  // Routes protégées - nécessitent authentification
  router.post("/", authMiddleware, pollution.create);
  router.put("/:id", authMiddleware, pollution.update);
  router.delete("/:id", authMiddleware, pollution.delete);

  app.use('/api/pollution', router);
  };
