const ALLOWED_DOMAINS = [
  'gmail.com',
  'yahoo.com',
  'yahoo.in',
  'outlook.com',
  'hotmail.com',
  'icloud.com',
  'protonmail.com',
  'rediffmail.com',
  // Add your college/organization domain below:
  // 'yourhostel.edu.in',
];

const isAllowedEmail = (email) => {
  if (!email || !email.includes('@')) return false;
  const domain = email.split('@')[1]?.toLowerCase();
  return ALLOWED_DOMAINS.includes(domain);
};

const getBlockedMessage = (email) => {
  const domain = email.split('@')[1];
  return `"${domain}" is not an authorized email provider. Please use Gmail, Yahoo, Outlook, or your organization email.`;
};

module.exports = { isAllowedEmail, getBlockedMessage, ALLOWED_DOMAINS };