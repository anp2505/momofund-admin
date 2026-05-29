# Firebase Configuration - Setup Guide

## ✅ Các thay đổi đã hoàn thành:

### 1. **Mockdata đã được xoá**
   - Tất cả mock data trong [src/lib/mock-data.ts](src/lib/mock-data.ts) đã bị xoá
   - Giữ lại: Interfaces (User, Fund, Report, ActivityLog) và utility functions (formatVND, formatDate, formatDateTime)
   - Placeholder arrays hiện tại trống rỗng: `users: []`, `funds: []`, `reports: []`, `activityLogs: []`

### 2. **File Firebase Configuration được tạo**
   - [src/lib/firebase-config.ts](src/lib/firebase-config.ts) - **PASTE FIREBASE CONFIG TẠI ĐÂY**
   - [src/lib/firebase.ts](src/lib/firebase.ts) - Firebase initialization (đã setup sẵn)

---

## 🔧 BƯỚC 1: Paste Firebase Config

Mở file [src/lib/firebase-config.ts](src/lib/firebase-config.ts) và thay thế các giá trị:

```typescript
export const firebaseConfig = {
  apiKey: "YOUR_API_KEY",                    // ← Thay thế
  authDomain: "YOUR_AUTH_DOMAIN",            // ← Thay thế
  projectId: "YOUR_PROJECT_ID",              // ← Thay thế
  storageBucket: "YOUR_STORAGE_BUCKET",      // ← Thay thế
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID", // ← Thay thế
  appId: "YOUR_APP_ID",                      // ← Thay thế
};
```

### Lấy config từ Firebase:
1. Truy cập [Firebase Console](https://console.firebase.google.com/)
2. Chọn dự án của bạn
3. Vào **⚙️ Project Settings** (góc trái dưới)
4. Kéo xuống mục **Your apps**
5. Chọn ứng dụng web của bạn (hoặc tạo mới nếu chưa có)
6. Sao chép config object

---

## 📦 BƯỚC 2: Cài đặt Firebase packages

Chạy lệnh trong terminal:

```bash
npm install firebase
```

---

## 🔄 BƯỚC 3: Kết nối dữ liệu Firebase

Các file cần cập nhật (replace mock data với Firebase queries):

| File | Mô tả |
|------|-------|
| [src/lib/mock-data.ts](src/lib/mock-data.ts) | Implement Firebase queries cho `users`, `funds`, `reports`, `activityLogs` |
| [src/routes/_admin/dashboard.tsx](src/routes/_admin/dashboard.tsx) | Fetch data từ Firestore |
| [src/routes/_admin/users.tsx](src/routes/_admin/users.tsx) | Fetch user list |
| [src/routes/_admin/funds.tsx](src/routes/_admin/funds.tsx) | Fetch fund list |
| [src/routes/_admin/reports.tsx](src/routes/_admin/reports.tsx) | Fetch reports |
| [src/routes/_admin/activity.tsx](src/routes/_admin/activity.tsx) | Fetch activity logs |

---

## 💡 Ví dụ: Fetch Users từ Firebase

Cập nhật [src/lib/mock-data.ts](src/lib/mock-data.ts):

```typescript
import { db } from "./firebase";
import { collection, getDocs } from "firebase/firestore";

// Thay vì array trống, fetch từ Firestore
export async function fetchUsers(): Promise<User[]> {
  const querySnapshot = await getDocs(collection(db, "users"));
  return querySnapshot.docs.map((doc) => ({
    user_id: doc.id,
    ...doc.data(),
  } as User));
}
```

Sau đó update các components để sử dụng:

```typescript
import { fetchUsers } from "@/lib/mock-data";

// Trong component hoặc route handler
const users = await fetchUsers();
```

---

## 📝 Firestore Collections Schema (Khuyến nghị)

```
users/
  ├── user_id: string (document ID)
  ├── email: string
  ├── full_name: string
  ├── ...

funds/
  ├── fund_id: string (document ID)
  ├── fund_name: string
  ├── ...

reports/
  ├── report_id: string (document ID)
  ├── ...

activity_logs/
  ├── log_id: string (document ID)
  ├── ...
```

---

## ✨ Kết quả:

- ✅ Mockdata đã xoá sạch
- ✅ Firebase config file tạo sẵn
- ✅ Firebase SDK đã import
- ⏳ Cần: Paste config + cài Firebase + implement Firestore queries

