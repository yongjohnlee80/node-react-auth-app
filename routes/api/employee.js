const express = require("express");

const router = express.Router();

const empController = require('../../controllers/employees.controller');

router
    .route("/")
    .get(empController.getAllEmployees)
    .post(empController.createNewEmployee)
    .put(empController.updateEmployee)
    .delete(empController.deleteEmployee);

router.route("/:id")
    .get(empController.getEmployee);

module.exports = router;
