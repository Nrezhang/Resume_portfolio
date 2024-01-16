const sgMail = require('@sendgrid/mail')
sgMail.setApiKey('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')
const msg = {
  to: 'my email', // Change to your recipient
  from: 'email', // Change to your verified sender
  subject: 'Sending with SendGrid is Fun',
  text: 'and easy to do anywhere, even with Node.js',
  html: '<strong>and easy to do anywhere, even with Node.js</strong>',
}
sgMail
  .send(msg)
  .then(() => {
    console.log('Email sent')
  })
  .catch((error) => {
    console.error(error)
  })