const Contact = require('../models/contactModel');

//submit a contact form
const submitContactForm = async (req, res) => {
    try {
        const {firstName, lastName, email, subject, message } = req.body;
        const contact = await Contact.create({ firstName, lastName, email, subject, message });
        res.status(201).json(contact);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}; 

module.exports = {
    submitContactForm
};



