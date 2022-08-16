const data = {
    employees: require('../models/employees.json'),
    setEmployees: function (data) {this.employees = data}
};

const getAllEmployees = (req, res) => {
    res.json(data.employees);
}

const createNewEmployee = (req, res) => {
    console.log(req.body.firstname, req.body.lastname);

    if(!req.body.firstname || !req.body.lastname) {
        res.status(400).json({'message': 'first name and last name required'});
        return
    }

    const newEmployee = {
        id: Object.keys(data.employees).length + 1,
        firstname: req.body.firstname,
        lastname: req.body.lastname
    }

    data.setEmployees([...data.employees, newEmployee]);
    res.status(201).json(data.employees);
}

const updateEmployee = (req, res) => {
    const id = parseInt(req.body.id);
    const employee = data.employees.find((e) => e.id === id);
    if(!employee) {
        res.status(400).json({"message": `Employee ID ${id} not found!`});
    }
    employee.firstname = req.body.firstname;
    employee.lastname = req.body.lastname;
    const filteredList = data.employees.filter(e => e.id !== id);
    const newList = [...filteredList, employee];
    data.setEmployees(newList.sort((a, b) => Number(a.id) - Number(b.id)));
    res.json(data.employees);
}

const deleteEmployee = (req, res) => {
    const id = parseInt(req.body.id);
    const filteredList = data.employees.filter(e => e.id !== id);
    data.setEmployees(filteredList);
    res.json(data.employees);
}

const getEmployee = (req, res) => {
    const id = parseInt(req.params.id);
    const employee = data.employees.find(e => e.id === id);
    if(!employee) {
        res.status(400).json({"message": `Employee ID ${id} not found!`});
    }
    res.json(employee);
}

module.exports = {
    getAllEmployees,
    createNewEmployee,
    updateEmployee,
    deleteEmployee,
    getEmployee
}