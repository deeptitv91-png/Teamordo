# Teamordo

Project management platform for teams of all sizes.

## Stack
- React 18 + Vite
- Firebase (Auth + Firestore + Storage)
- Vercel (deployment)
- jsPDF (PDF report export)

## Setup

### 1. Create a new Firebase project
Go to console.firebase.google.com → New project → name it `teamordo`

Enable:
- Authentication → Email/Password
- Firestore Database
- Storage

### 2. Environment variables
```
cp .env.example .env
```
Fill in your Firebase config values from Firebase Console → Project Settings → Your apps.

### 3. Deploy Firestore rules
```
firebase deploy --only firestore:rules
```

### 4. Install and run
```
npm install
npm run dev
```

### 5. Deploy to Vercel
```
vercel --prod
```
Add all VITE_ environment variables in Vercel dashboard.

## ID System

| ID Format     | Role          | Dashboard        |
|---------------|---------------|------------------|
| CORP-XXXX-XXX | Admin         | /admin           |
| DEPT-XXX-000  | Dept head     | /dept            |
| MEM-XX-0000   | Team member   | /member          |

## Task Approval Flow

1. Member marks task done → status: `l1_pending`
2. Any Manager/Lead gives L1 approval → status: `l2_pending`
3. Task creator gives final L2 approval → status: `done`

## Work Upload Flow

1. Member uploads file → status: `review`
2. Reviewer approves → status: `approved`
   OR requests correction → status: `correction` (member resubmits)
   OR requests rework → status: `rework` (member redoes)

## Firestore Structure

```
companies/{companyId}
  departments/{deptId}
  users/{userId}          ← all roles (admin, dept_head, member)
  tasks/{taskId}
  uploads/{uploadId}
```
