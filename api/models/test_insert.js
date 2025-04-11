const { connectDB, batches, users, env } = require("../models/index");
const mongoose = require("mongoose");

const testDB = async () => {
  try {
    await connectDB();

    //NEW BATCH
    // const newBatch = await batches.create({
    //   batchid: "33429",
    //   batchname: "frye-test",
    //   tool: "listing-loader-v2",
    //   totalitems: 7,
    //   requestorname: "Hannah uwu",
    //   requestorid: "55233",
    //   status: true,
    //   progress: 39,
    //   createby: "admin",
    //   updatedby: "admin",
    // });
    // console.log("New batch created:", newBatch);


    // NEW BATCH
    // const newUser = await users.create({
    //   internalid: "44523",
    //   username: "jtolentin",
    //   firstname: "Niel",
    //   lastname: "Tolentin",
    //   middlename: "",
    //   email: "jtolentin@outdoorequipped.com",
    //   password: '123456',
    //   image: 'hello.jpg',
    //   role: 'Developer',
    //   accesslevel: 3,
    //   isactive: true,
    //   isonline: false,
    //   lastonline: '2024-06-25',
    //   department: 'IT Dev',
    //   requestbatches: 9,
    //   createby: "admin",
    //   updatedby: "admin",
    // });
    // console.log("New newUser created:", newUser);

    // NEW ENV
    // const newEnv = await env.create({
    //   type: "s3",
    //   data: {
    //     AWS_S3_REGION: "ap-southeast-2",
    //     AWS_S3_ACCESS_KEY_ID: "AKIAXGGJDX5ILO7VM6GV",
    //     AWS_S3_SECRET_ACCESS_KEY: "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",
    //   },
    // });
    // console.log("New env created:", newEnv);


  } catch (error) {
    console.error("Error:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from the database");
  }
};

testDB();
