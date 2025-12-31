# DiGi Health 🏥

Digital healthcare automation for grassroots communities.

## 🚀 Quick Setup & Deployment

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Build for Production**:
   ```bash
   npm run build
   ```

3. **Deploy to Firebase**:
   Ensure you have the Firebase CLI installed (`npm install -g firebase-tools`) and logged in (`firebase login`).
   ```bash
   firebase init  # Select Hosting and Firestore
   firebase deploy
   ```

## 🛠 Project Structure
- `pages/`: Role-specific screens (Patient, Doctor, Staff, Org, Admin).
- `components/`: UI widgets.
- `AppContext.tsx`: State & Firebase logic.
- `firebase.ts`: Configuration.

## 🛡 Security
Roles are enforced via `firestore.rules`. Always verify registration numbers for professional roles.