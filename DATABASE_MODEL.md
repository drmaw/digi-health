# DiGi Health Firestore Database Model

## Collection: `users`
- `id`: string (doc ID)
- `healthId`: string (unique indexed)
- `name`: string
- `phone`: string
- `gender`: string (Male|Female|Other)
- `age`: number
- `photoUrl`: string
- `activeRoles`: array<string>
- `appliedRoles`: array<object>
- `redFlag`: object { isPresent: boolean, comment: string }
- `vitals`: subcollection
  - `timestamp`: date
  - `bp`: string
  - `rbs`: number
  - `pulse`: number

## Collection: `organizations`
- `id`: string
- `ownerId`: string
- `name`: string
- `location`: string
- `staff`: array<object> { userId: string, role: string, status: string }
- `pricing`: array<object> { id: string, name: string, price: number }
- `beds`: subcollection
  - `id`: string
  - `type`: string (Ward|Cabin)
  - `isOccupied`: boolean
  - `patientId`: string (nullable)

## Collection: `investigations`
- `id`: string
- `patientId`: string
- `orgId`: string
- `findings`: string
- `status`: string (Requested|Completed)