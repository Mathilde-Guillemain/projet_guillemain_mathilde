module.exports = app => {
  const utilisateur = require("../controllers/utilisateur.controllers.js");
  const authMiddleware = require("../middleware/auth.middleware.js");
  var router = require("express").Router();

  router.post("/register", utilisateur.register);           // enregistrement
  router.post("/login", utilisateur.login);                  // connexion
  router.post("/logout", authMiddleware, utilisateur.logout); // déconnexion
  router.get("/me", authMiddleware, utilisateur.getCurrentUser); // utilisateur actuel
  router.get("/:id", utilisateur.getOne);                      // utilisateur par id (public)
  router.get("/", utilisateur.get);                           // liste tous
  router.post("/", utilisateur.create);                       // création
  router.put("/:id", utilisateur.update);                     // mise à jour
  router.delete("/:id", utilisateur.delete);                  // suppression

  app.use('/api/utilisateur', router);
};
