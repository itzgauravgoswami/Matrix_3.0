const mongoose = require('mongoose'); 
require('dotenv').config(); 

// Import models
const Quiz = require('../models/Quiz'); 
const QATest = require('../models/QATest'); 

const clearRecords = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }); 
    console.log('✓ MongoDB connected successfully'); 

    // Delete all Quiz records
    const quizResult = await Quiz.deleteMany({}); 
    console.log(`✓ Deleted ${quizResult.deletedCount} quiz records`); 

    // Delete all QATest records
    const qaTestResult = await QATest.deleteMany({}); 
    console.log(`✓ Deleted ${qaTestResult.deletedCount} QA test records`); 

    console.log('\n✓ All quiz and QA test records cleared successfully!'); 

    // Close connection
    await mongoose.connection.close(); 
    console.log('✓ Database connection closed'); 
    process.exit(0); 
  } catch (error) {
    console.error('✗ Error clearing records:', error.message); 
    process.exit(1); 
  }
}; 

// Run the script
clearRecords(); 
