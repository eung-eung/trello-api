export const OBJECT_ID_RULE = /^[0-9a-fA-F]{24}$/
export const OBJECT_ID_RULE_MESSAGE = 'Your string fails to match the Object Id pattern!'

export const EMAIL_RULE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
export const EMAIL_RULE_MESSAGE = 'Please enter a valid email address'
export const PASSWORD_RULE = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,30}$/
export const PASSWORD_RULE_MESSAGE = 'Password must be at least 8 characters long and contain at least one letter and one number'
export const PASSWORD_CONFIRM_RULE_MESSAGE = 'Passwords do not match'