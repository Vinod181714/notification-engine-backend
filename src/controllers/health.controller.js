const mongoose = require('mongoose');
const circuitBreaker = require('../services/circuitBreaker.service');

exports.health = async (req, res) => {
  const dbState = mongoose.connection.readyState;
  const statuses = ['disconnected','connected','connecting','disconnecting'];
  res.json({
    db: statuses[dbState] || dbState,
    aiCircuit: circuitBreaker.getStatus()
  });
};
