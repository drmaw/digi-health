# DiGi Health Firebase Security Rules

```javascript
service cloud.firestore {
  match /databases/{database}/documents {
    
    function isSignedIn() {
      return request.auth != null;
    }

    match /users/{userId} {
      allow list: if isSignedIn();
      allow read: if isSignedIn();
      allow write: if request.auth.uid == userId;
      allow update: if isSignedIn(); // Allow doctors to update redFlags
    }

    match /organizations/{orgId} {
      allow read, list: if isSignedIn();
      allow write: if isSignedIn();
    }

    match /auditLogs/{logId} {
      allow list, read, create: if isSignedIn();
    }

    match /records/{recordId} {
      allow list, read, write: if isSignedIn();
    }

    match /investigations/{invId} {
      allow list, read, write: if isSignedIn();
    }

    match /appointments/{aptId} {
      allow list, read, write: if isSignedIn();
    }

    match /schedules/{schId} {
      allow list, read, write: if isSignedIn();
    }
  }
}
```