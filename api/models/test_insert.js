const { connectDB, batches,users } = require("../models/index");
const mongoose = require("mongoose");

const testDB = async () => {
  try {
    await connectDB();

    await connectDB();

    //NEW BATCH
    // const newBatch = await batches.create({
    //   batchid: "44232",
    //   batchname: "test-batch",
    //   tool: "asin-checker-v2",
    //   totalitems: 5,
    //   requestorname: "Niel T.",
    //   requestorid: "123123",
    //   status: true,
    //   progress: 0,
    //   createby: "admin",
    //   updatedby: "admin",
    // });
    // console.log("New batch created:", newBatch);


    // NEW BATCH
    const newUser = await users.create({
      internalid: "44232",
      username: "usernametest",
      firstname: "John",
      lastname: "Doe",
      middlename: "Cruz",
      email: "jdoe@gmail.com",
      password: '123456',
      image: '123.jpg',
      role: 'data analyst',
      accesslevel: 1,
      isactive: true,
      isonline: false,
      lastonline: '2024-04-24',
      department: 'demand-data',
      requestbatches: 10,
      createby: "admin",
      updatedby: "admin",
    });
    console.log("New newUser created:", newUser);


  } catch (error) {
    console.error("Error:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from the database");
  }
};

testDB();
