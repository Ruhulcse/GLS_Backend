const { faker } = require("@faker-js/faker");
const User = require("../models/userModel");
const connectDB = require("../config/db");
const dotenv = require("dotenv");
dotenv.config();
connectDB();

async function seedUsers() {
  try {
    for (let i = 0; i < 10; i++) {
      const user = new User({
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        email: faker.internet.email(),
        phoneNumber: faker.phone.number(),
        password: "password123",
        dateOfBirth: faker.date.birthdate(),
        address: faker.location.streetAddress(),
        postalCode: faker.location.zipCode(),
        nid: faker.string.uuid(),
        passport: faker.string.uuid(),
        userRole: faker.helpers.arrayElement([
          "supperadmin",
          "admin",
          "user",
          "guest",
        ]),
      });

      await user.save();
    }
    mongoose.connection.close();
  } catch (error) {
    mongoose.connection.close();
  }
}
seedUsers();
