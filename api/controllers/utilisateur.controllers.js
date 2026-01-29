const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require("../models");
const Utilisateurs = db.utilisateurs;
const Op = db.Sequelize.Op;

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Enregistrement
exports.register = (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).send({ message: "Name, email et password sont requis." });
  }

  // Valider l'email
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(email)) {
    return res.status(400).send({ message: "Email invalide." });
  }

  // Valider la longueur du mot de passe
  if (password.length < 6) {
    return res.status(400).send({ message: "Le mot de passe doit contenir au moins 6 caractères." });
  }

  // Vérifier si l'utilisateur existe déjà
  Utilisateurs.findOne({ where: { email } })
    .then(user => {
      if (user) {
        return res.status(400).send({ message: "Cet email est déjà utilisé." });
      }

      // Hacher le mot de passe
      const salt = bcrypt.genSaltSync(10);
      const hashedPassword = bcrypt.hashSync(password, salt);

      // Créer l'utilisateur
      Utilisateurs.create({
        name,
        email,
        password: hashedPassword
      })
        .then(newUser => {
          const token = jwt.sign({ id: newUser.id, email: newUser.email }, JWT_SECRET, { expiresIn: '24h' });
          res.status(201).send({
            id: newUser.id,
            name: newUser.name,
            email: newUser.email,
            token
          });
        })
        .catch(err => res.status(500).send({ message: err.message }));
    })
    .catch(err => res.status(500).send({ message: err.message }));
};

// Connexion
exports.login = (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).send({ message: "Email et password sont requis." });
  }

  Utilisateurs.findOne({ where: { email } })
    .then(user => {
      if (!user) {
        return res.status(404).send({ message: "Email ou mot de passe incorrect." });
      }

      // Vérifier le mot de passe
      const isPasswordValid = bcrypt.compareSync(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).send({ message: "Email ou mot de passe incorrect." });
      }

      // Générer le JWT
      const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '24h' });

      res.send({
        id: user.id,
        name: user.name,
        email: user.email,
        token
      });
    })
    .catch(err => res.status(500).send({ message: err.message }));
};

// Déconnexion (côté client, il suffit de supprimer le token)
exports.logout = (req, res) => {
  res.send({ message: "Déconnecté avec succès." });
};

// Obtenir l'utilisateur actuel
exports.getCurrentUser = (req, res) => {
  Utilisateurs.findByPk(req.userId)
    .then(user => {
      if (!user) {
        return res.status(404).send({ message: "Utilisateur non trouvé." });
      }
      res.send({
        id: user.id,
        name: user.name,
        email: user.email
      });
    })
    .catch(err => res.status(500).send({ message: err.message }));
};

// Obtenir un utilisateur par id (sans le mot de passe)
exports.getOne = (req, res) => {
  const id = req.params.id;
  Utilisateurs.findByPk(id, {
    attributes: ['id', 'name', 'email']
  })
    .then(user => {
      if (!user) return res.status(404).send({ message: "Utilisateur non trouvé." });
      res.send(user);
    })
    .catch(err => res.status(500).send({ message: err.message }));
};

exports.get = (req, res) => {
  Utilisateurs.findAll()
    .then(data => res.send(data))
    .catch(err => res.status(500).send({ message: err.message }));
};

exports.create = (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).send({ message: "Name, email et password sont requis." });
  }

  Utilisateurs.create({
    name,
    email,
    password
  })
    .then(user => res.status(201).send(user))
    .catch(err => res.status(500).send({ message: err.message }));
};

// Supprimer un utilisateur par id
exports.delete = (req, res) => {
  const id = req.params.id;

  Utilisateurs.destroy({ where: { id } })
    .then(affected => {
      if (!affected) return res.status(404).send({ message: 'Utilisateur non trouvé.' });
      res.send({ message: 'Utilisateur supprimé.' });
    })
    .catch(err => res.status(500).send({ message: err.message }));
};

// Mettre à jour un utilisateur
exports.update = (req, res) => {
  const id = req.params.id;
  const { name, email, password } = req.body;

  const updated = {};
  if (name) updated.name = name;
  if (email) updated.email = email;
  if (password) updated.password = password; // note: if password provided, should hash in production

  Utilisateurs.update(updated, { where: { id } })
    .then(([affected]) => {
      if (!affected) return res.status(404).send({ message: 'Utilisateur non trouvé.' });
      return Utilisateurs.findByPk(id);
    })
    .then(user => res.send(user))
    .catch(err => res.status(500).send({ message: err.message }));
};

