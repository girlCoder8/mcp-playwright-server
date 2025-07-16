# Pseudocode: User Login and Profile Update - E2E Workflow

Given a valid test user
When the user launches the iOS app
  And logs in using correct credentials
Then they should be redirected to the dashboard

When they tap "Profile"
  And change their display name
Then the updated name should be synced via API
  And verified on the backend
