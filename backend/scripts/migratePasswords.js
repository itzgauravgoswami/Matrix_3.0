const mongoose = require('mongoose'); 
require('dotenv').config(); 
const User = require('./models/user'); 
const { encryptPassword } = require('./utils/encryptionUtils'); 

const migratePasswords = async () => {
  try {
    console.log('🔄 Starting password encryption migration...'); 
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/selfranker'); 
    console.log('✅ Connected to MongoDB'); 

    // Find all users without encryptedPassword
    const usersToMigrate = await User.find({ encryptedPassword: { $exists: false } }); 
    console.log(`📊 Found ${usersToMigrate.length} users to migrate`); 

    let successCount = 0; 
    let errorCount = 0; 

    for (const user of usersToMigrate) {
      try {
        // Note: We can't decrypt the hashed password, so we'll set it to null
        // New users will have encryptedPassword set when they create password
        user.encryptedPassword = null; 
        await user.save(); 
        successCount++; 
        console.log(`✓ Updated user: ${user.email}`); 
      } catch (error) {
        errorCount++; 
        console.error(`✗ Failed to update user ${user.email}: ${error.message}`); 
      }
    }

    console.log(`\n✅ Migration complete!`); 
    console.log(`   ✓ Successfully updated: ${successCount} users`); 
    console.log(`   ✗ Errors: ${errorCount} users`); 
    console.log(`\n📝 Note: Old users will show "Not available" for password.`); 
    console.log(`   New registrations will have encrypted passwords stored.`); 

    await mongoose.connection.close(); 
    process.exit(0); 
  } catch (error) {
    console.error('❌ Migration failed:', error); 
    process.exit(1); 
  }
}; 

migratePasswords(); 

