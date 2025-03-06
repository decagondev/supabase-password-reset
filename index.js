const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcrypt');
const formData = require('form-data');
const Mailgun = require('mailgun.js');

/**
 * SupabasePasswordReset - A utility for resetting passwords in Supabase
 * and sending reset notifications via Mailgun
 */
class SupabasePasswordReset {
  /**
   * Initialize the SupabasePasswordReset instance
   * @param {Object} config Configuration object
   * @param {string} config.supabaseUrl Your Supabase URL
   * @param {string} config.supabaseKey Your Supabase service role key (admin access)
   * @param {string} config.mailgunApiKey Your Mailgun API key
   * @param {string} config.mailgunDomain Your Mailgun domain
   * @param {Object} [config.options] Optional configuration
   * @param {number} [config.options.saltRounds=10] Number of bcrypt salt rounds
   * @param {number} [config.options.passwordLength=10] Length of generated password
   * @param {string} [config.options.fromEmail="noreply@yourdomain.com"] From email address
   * @param {string} [config.options.fromName="Password Reset"] From name
   * @param {string} [config.options.subject="Your Password Has Been Reset"] Email subject
   * @param {Function} [config.options.emailTemplateFunction] Custom email template function
   */
  constructor(config) {
    if (!config.supabaseUrl || !config.supabaseKey || !config.mailgunApiKey || !config.mailgunDomain) {
      throw new Error('Missing required configuration parameters');
    }

    this.supabase = createClient(config.supabaseUrl, config.supabaseKey);
    
    // Initialize the new Mailgun client
    const mailgunClient = new Mailgun(formData);
    this.mailgun = mailgunClient.client({
      username: 'api',
      key: config.mailgunApiKey
    });
    
    this.mailgunDomain = config.mailgunDomain;

    this.options = {
      saltRounds: 10,
      passwordLength: 10,
      fromEmail: 'noreply@yourdomain.com',
      fromName: 'Password Reset',
      subject: 'Your Password Has Been Reset',
      emailTemplateFunction: this._defaultEmailTemplate,
      ...config.options
    };
  }

  /**
   * Reset a user's password by email
   * @param {string} email User's email address
   * @returns {Promise<Object>} Result of password reset operation
   */
  async resetPasswordByEmail(email) {
    try {
      const { data: user, error: userError } = await this.supabase
        .from('auth.users')
        .select('id, email')
        .eq('email', email)
        .single();

      if (userError || !user) {
        return {
          success: false,
          message: 'User not found'
        };
      }

      const newPassword = this._generateRandomPassword();

      const hashedPassword = await bcrypt.hash(newPassword, this.options.saltRounds);

      const { error: updateError } = await this.supabase
        .from('auth.users')
        .update({ encrypted_password: hashedPassword })
        .eq('id', user.id);
      
      if (updateError) {
        console.error('Error updating password:', updateError);
        return {
          success: false,
          message: 'Failed to update password'
        };
      }

      const emailData = {
        from: `${this.options.fromName} <${this.options.fromEmail}>`,
        to: email,
        subject: this.options.subject,
        text: this.options.emailTemplateFunction(email, newPassword)
      };

      await this.mailgun.messages.create(this.mailgunDomain, emailData);

      return {
        success: true,
        message: 'Password reset successful. An email has been sent with the new password.'
      };
    } catch (error) {
      console.error('Error in resetPasswordByEmail:', error);
      return {
        success: false,
        message: 'An unexpected error occurred',
        error: error.message
      };
    }
  }

  /**
   * Generate a random password
   * @private
   * @returns {string} Random password
   */
  _generateRandomPassword() {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()';
    let password = '';
    for (let i = 0; i < this.options.passwordLength; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  }

  /**
   * Default email template
   * @private
   * @param {string} email User's email
   * @param {string} password New password
   * @returns {string} Email body
   */
  _defaultEmailTemplate(email, password) {
    return `Hello,

Your password has been reset. Your new temporary password is: ${password}

Please login with this password and change it immediately for security reasons.

This is an automated message, please do not reply.`;
  }
}

module.exports = SupabasePasswordReset;