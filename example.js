
require('dotenv').config();

const SupabasePasswordReset = require('supabase-password-reset');

const passwordReset = new SupabasePasswordReset({
  supabaseUrl: process.env.SUPABASE_URL,
  supabaseKey: process.env.SUPABASE_SERVICE_KEY,
  mailgunApiKey: process.env.MAILGUN_API_KEY,
  mailgunDomain: process.env.MAILGUN_DOMAIN
});

async function resetUserPassword(email) {
  try {
    console.log(`Attempting to reset password for ${email}...`);
    
    const result = await passwordReset.resetPasswordByEmail(email);
    
    if (result.success) {
      console.log('✅ Success:', result.message);
    } else {
      console.log('❌ Failed:', result.message);
    }
    
    return result;
  } catch (error) {
    console.error('Error resetting password:', error);
    return {
      success: false,
      message: 'An unexpected error occurred',
      error: error.message
    };
  }
}


if (require.main === module) {

  const userEmail = process.argv[2] || 'user@example.com';
  
  resetUserPassword(userEmail)
    .then(() => console.log('Process completed'))
    .catch(err => console.error('Process failed:', err));
}

module.exports = resetUserPassword;