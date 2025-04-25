import firebase_admin

firebase_credentials = firebase_admin.credentials.Certificate("firebase_service_account.json")
default_app = firebase_admin.initialize_app(firebase_credentials)
