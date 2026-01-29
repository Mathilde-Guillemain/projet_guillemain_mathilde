const { Sequelize } = require ("sequelize");
const { BDD }  = require ('../config');
const sequelize = new Sequelize(`postgres://${BDD.user}:${BDD.password}@${BDD.host}/${BDD.bdname}`
,{
    dialect: 'postgres',
    protocol: 'postgres',
    dialectOptions: {
      ssl: true,
      native:true
    },
    define:  {
    	timestamps:false
    }
  });

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.pollutions = require("./pollutions.model.js")(sequelize, Sequelize);
db.utilisateurs = require("./utilisateurs.model.js")(sequelize, Sequelize);

// Relations
db.utilisateurs.hasMany(db.pollutions, { foreignKey: 'utilisateurId', as: 'pollutions' });
db.pollutions.belongsTo(db.utilisateurs, { foreignKey: 'utilisateurId', as: 'auteur' });


module.exports = db;
