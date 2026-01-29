const { v4: uuidv4 } = require ("uuid");


const db = require("../models");
const Pollution = db.pollutions;
const Utilisateur = db.utilisateurs;
const Op = db.Sequelize.Op;

exports.get = (req, res) => {

     Pollution.findAll({
      include: [{
        model: Utilisateur,
        as: 'auteur',
        attributes: ['id', 'name', 'email']
      }]
    })
    .then(data => {res.send(data);})
    .catch(err => {
      res.status(400).send({
        message: err.message
      });
    });

}; 

// Récupérer une pollution par id
exports.getOne = (req, res) => {
  const id = req.params.id;

  Pollution.findByPk(id, {
    include: [{
      model: Utilisateur,
      as: 'auteur',
      attributes: ['id', 'name', 'email']
    }]
  })
    .then(data => {
      if (!data) return res.status(404).send({ message: 'Pollution non trouvée.' });
      res.send(data);
    })
    .catch(err => res.status(500).send({ message: err.message }));
};

// Créer une pollution
exports.create = (req, res) => {
  const payload = {
    ...req.body,
    utilisateurId: req.userId // rattacher la pollution au créateur authentifié
  };

  Pollution.create(payload)
    .then(newItem =>
      Pollution.findByPk(newItem.id, {
        include: [{
          model: Utilisateur,
          as: 'auteur',
          attributes: ['id', 'name', 'email']
        }]
      })
    )
    .then(newItemWithAuthor => res.status(201).send(newItemWithAuthor))
    .catch(err => res.status(500).send({ message: err.message }));
};

// Mettre à jour une pollution
exports.update = (req, res) => {
  const id = req.params.id;
  const updated = req.body;

  Pollution.update(updated, { where: { id } })
    .then(([affected]) => {
      if (!affected) return res.status(404).send({ message: 'Pollution non trouvée.' });
      return Pollution.findByPk(id, {
        include: [{
          model: Utilisateur,
          as: 'auteur',
          attributes: ['id', 'name', 'email']
        }]
      });
    })
    .then(item => res.send(item))
    .catch(err => res.status(500).send({ message: err.message }));
};

// Supprimer une pollution
exports.delete = (req, res) => {
  const id = req.params.id;

  Pollution.destroy({ where: { id } })
    .then(affected => {
      if (!affected) return res.status(404).send({ message: 'Pollution non trouvée.' });
      res.send({ message: 'Pollution supprimée.' });
    })
    .catch(err => res.status(500).send({ message: err.message }));
};
