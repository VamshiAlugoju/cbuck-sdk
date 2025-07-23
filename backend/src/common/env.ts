export const env = {
  firebase: {
    project_id: getEnvVar('FIREBASE_PROJECT_ID'),
    client_email: getEnvVar('FIREBASE_CLIENT_EMAIL'),
    private_key: getEnvVar('FIREBASE_PRIVATE_KEY')?.replace(/\\n/g, '\n'),
  },
  mongodb_uri: getEnvVar('MONGODB_URI'),
};

function getEnvVar(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(
      `Environment variable "${key}" is required but was not found.`,
    );
  }
  return value;
}
