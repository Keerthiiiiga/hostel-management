const ALLOWED_DOMAINS = [
  'gmail.com', 'yahoo.com', 'yahoo.in',
  'outlook.com', 'hotmail.com',
  'icloud.com', 'protonmail.com', 'rediffmail.com',
];

export const isAllowedEmail = (email) => {
  if (!email || !email.includes('@')) return false;
  const domain = email.split('@')[1]?.toLowerCase();
  return ALLOWED_DOMAINS.includes(domain);
};

export const getDomainError = (email) => {
  const domain = email.split('@')[1];
  return `"${domain}" is not allowed. Use Gmail, Yahoo, Outlook, etc.`;
};
