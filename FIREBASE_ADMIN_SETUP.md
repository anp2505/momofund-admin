# Firebase Admin Setup Guide

Hướng dẫn nhanh để tạo admin user trong Firebase để có thể đăng nhập vào dashboard.

## 1. Tạo user trong Firebase Authentication

1. Mở [Firebase Console](https://console.firebase.google.com/)
2. Chọn project `momofund-97bc5`
3. Vào **Authentication** → **Users**
4. Click nút **Add user**
5. Nhập email và password (ghi nhớ để đăng nhập sau)
6. Click **Add user**

## 2. Tải Firebase Admin SDK Key

1. Vào **Project Settings** (cấu hình project - biểu tượng ⚙️)
2. Chọn tab **Service Accounts**
3. Click **Generate New Private Key**
4. File JSON sẽ tự download
5. **Quan trọng**: Đặt file này là `serviceAccountKey.json` trong thư mục repo root (ngang với `package.json`)
6. **KHÔNG** commit file này (đã thêm vào `.gitignore`)

## 3. Gán quyền admin cho user

Chạy lệnh:
```bash
npm install
npm run set-admin <UID_OF_USER>
```

Thay `<UID_OF_USER>` bằng UID trong Firebase Console (Authentication → Users, cột **User UID**).

**Ví dụ:**
```bash
npm run set-admin VVws5IFJMOZrHxZbllQw2cc45py2
```

Nếu thành công sẽ thấy: ✅ Admin claim set successfully!

## 4. Đăng nhập vào app

1. Chạy dev server:
   ```bash
   npm run dev
   ```
2. Mở http://localhost:5174/login
3. Đăng nhập bằng email/password đã tạo
4. Dashboard sẽ hiển thị dữ liệu từ Firestore

## Troubleshooting

- **"Missing or insufficient permissions"**: Bạn chưa đăng nhập hoặc user chưa được set admin claim
- **"Cannot find serviceAccountKey.json"**: Tải file từ Firebase Console và đặt vào thư mục repo root
- **Token chưa cập nhật**: Đăng xuất rồi đăng nhập lại, hoặc refresh trang

## Firestore Security Rules

Nếu muốn kiểm tra admin claim ở Firestore rules:
```
allow read: if request.auth != null && request.auth.token.admin == true;
```

Hoặc check role trong document:
```
allow read: if request.auth != null && 
  get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'ADMIN';
```
