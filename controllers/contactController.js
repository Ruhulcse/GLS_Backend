const asyncHandler = require("express-async-handler");
const Contact = require("../models/contactModel");

//submit a contact form
const submitContactForm = asyncHandler(async (req, res) => {
  try {
    const { firstName, lastName, email, subject, message } = req.body;
    const newMessage = new Contact({
      firstName,
      lastName,
      email,
      subject,
      message,
    });

    const saveMessage = await newMessage.save();
    res.status(201).json({
      message: "Message sent successfully",
      data: saveMessage,
    });
  } catch (error) {
    res
      .status(400)
      .json({ message: "Failed to send message", error: error.message });
  }
});
//get all Contact message
const getAllContact = asyncHandler(async (req, res) => {
  try {
    const contacts = await Contact.find({});
    res.status(200).json(contacts);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error retrieving message", error: error.message });
  }
});

//Get single contact by ID
const getContactById = asyncHandler(async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);
    if (!contact) {
      res.status(404).json({ message: "Message not found" });
    } else {
      res.json(contact);
    }
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error finding contact", error: error.message });
  }
});

const updateStatus = asyncHandler(async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);
    if (!contact) {
      res.status(404).json({ message: "Message not found" });
      return;
    }
    contact.status = req.body.status || contact.status;

    const update = await contact.save();
    res.json({
      message: "Status updated successfully",
      data: update,
    });
  } catch (error) {
    res
      .status(400)
      .json({ message: "Failed to update blog", error: error.message });
  }
});

const deleteMessage = asyncHandler(async (req, res) => {
  try {
    const contact = await Contact.findByIdAndDelete(req.params.id);
    if (!contact) {
      res.status(404).json({ message: "Message not found" });
      return;
    }
    res.status(200).json({
        message:"Contact deleted successfully."
    })
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to delete message", error: error.message });
  }
});

module.exports = {
  submitContactForm,
  getAllContact,
  getContactById,
  deleteMessage,
  updateStatus,
};
