import { BrevoClient } from '@getbrevo/brevo'
import { env } from '~/config/environment'

const apiInstance = new BrevoClient({
  apiKey: env.BREVO_API_KEY
})

const sendEmail = async ({
  to,
  subject,
  html,
  name

}) => {
  const email = {}
  email.subject = subject
  email.htmlContent = html

  email.sender = {
    name: 'Admin',
    email: env.EMAIL_SENDER
  }
  email.to = [{ email: to, name }]

  const result = await apiInstance.transactionalEmails.sendTransacEmail(email)
  return result
}

export const BrevoProvider = {
  sendEmail
}