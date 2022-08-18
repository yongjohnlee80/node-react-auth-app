const express = require("express");

const router = express.Router();

const empController = require('../../controllers/employees.controller');

const ROLES_LIST = require('../../config/roles-list.options');
const verifyRoles = require('../../middleware/verifyRoles');
const verifyJWT = require("../../middleware/verifyJWT");

router
    .route("/")
    .get(empController.getAllEmployees)
    .post(verifyRoles(ROLES_LIST.Admin, ROLES_LIST.Editor), empController.createNewEmployee)
    .put(verifyRoles(ROLES_LIST.Admin, ROLES_LIST.Editor), empController.updateEmployee)
    .delete(verifyRoles(ROLES_LIST.Admin), empController.deleteEmployee);

router.route("/:id")
    .get(empController.getEmployee);

module.exports = router;
