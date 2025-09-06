function validateEnv() {
  if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    console.warn('⚠️ WARNING: GOOGLE_APPLICATION_CREDENTIALS environment variable is not set');
    console.warn('   Set it to the path of your Firebase service account JSON file');
    return false;
  }
  return true;
}

module.exports = { validateEnv };
