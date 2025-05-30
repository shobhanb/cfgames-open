export const apiErrorMap: { [key: string]: string } = {
  LOGIN_BAD_CREDENTIALS: 'Invalid username or password',
  REGISTER_USER_ALREADY_EXISTS: 'Account already exists',
  VERIFY_USER_BAD_TOKEN: 'Invalid verification link',
  RESET_PASSWORD_BAD_TOKEN: 'Invalid reset password link',
};
