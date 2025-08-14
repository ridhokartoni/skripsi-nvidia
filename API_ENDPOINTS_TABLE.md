# Backend API Endpoints Documentation

Base URL: `/api/v1`

## Authentication Endpoints (`/auth`)

| Method | Endpoint | Admin | Deskripsi |
|--------|----------|-------|-----------|
| POST | /auth/register | | Mendaftarkan user baru |
| POST | /auth/login | | Login untuk user reguler |
| POST | /auth/admin/login | | Login khusus untuk administrator |
| POST | /auth/refreshToken | | Memperbarui access token |
| POST | /auth/revokeRefreshTokens | | Mencabut refresh token user |

## User Management Endpoints (`/users`)

| Method | Endpoint | Admin | Deskripsi |
|--------|----------|-------|-----------|
| GET | /users/profile | | Mendapatkan profil user yang sedang login |
| GET | /users | ✓ | Mendapatkan daftar semua user |
| GET | /users/dropdown | ✓ | Mendapatkan data user untuk dropdown |
| PUT | /users/{id} | ✓ | Memperbarui data user berdasarkan ID |
| DELETE | /users/{id} | ✓ | Menghapus user berdasarkan ID |

## Docker Container Endpoints (`/docker`)

| Method | Endpoint | Admin | Deskripsi |
|--------|----------|-------|-----------|
| POST | /docker/createContainer | ✓ | Membuat container baru |
| GET | /docker/search/{imageName} | | Melakukan pencarian image yang tersedia |
| GET | /docker/mycontainer | | Mendapatkan daftar container pengguna |
| GET | /docker/allcontainer | ✓ | Mendapatkan daftar semua container |
| GET | /docker/containers/batch-stats | ✓ | Mendapatkan statistik batch semua container |
| GET | /docker/container/{containerName} | | Mendapatkan detail informasi container |
| GET | /docker/container/{containerName}/log | | Mendapatkan log dari container |
| GET | /docker/container/{containerName}/stats | | Mendapatkan sumber daya yang digunakan container |
| GET | /docker/container/{containerName}/jupyterlink | | Mendapatkan akses jupyter pada container |
| POST | /docker/container/{containerName}/reset | | Melakukan reset container |
| POST | /docker/container/{containerName}/restart | | Memulai ulang container |
| POST | /docker/container/{containerName}/stop | ✓ | Menghentikan container |
| POST | /docker/container/{containerName}/start | ✓ | Memulai container |
| POST | /docker/container/{containerName}/changePassword | | Mengganti password ssh container |
| DELETE | /docker/container/{containerName} | ✓ | Menghapus container peneliti |

## Ticket Management Endpoints (`/tiket`)

| Method | Endpoint | Admin | Deskripsi |
|--------|----------|-------|-----------|
| POST | /tiket/{containerName} | | Membuat tiket baru untuk container |
| PATCH | /tiket/{tiketId} | | Memperbarui status tiket |
| GET | /tiket | | Mendapatkan semua tiket user |
| GET | /tiket/all | ✓ | Mendapatkan semua tiket (semua user) |

## Package Management Endpoints (`/paket`)

| Method | Endpoint | Admin | Deskripsi |
|--------|----------|-------|-----------|
| POST | /paket | ✓ | Membuat paket baru pada payment |
| GET | /paket | | Mendapatkan daftar semua paket |
| GET | /paket/generate-harga/{paketId} | | Mendapatkan harga paket dengan pengacakan tiga digit terakhir |
| DELETE | /paket/{paketId} | ✓ | Menghapus paket dari payment |

## Payment Management Endpoints (`/payment`)

| Method | Endpoint | Admin | Deskripsi |
|--------|----------|-------|-----------|
| POST | /payment | | Membuat pembayaran baru |
| GET | /payment/mypayments | | Mendapatkan daftar pembayaran user |
| GET | /payment | ✓ | Mendapatkan semua pembayaran (semua user) |
| PATCH | /payment/{paymentId} | ✓ | Memperbarui status pembayaran (approve/reject) |
| DELETE | /payment/{paymentId} | ✓ | Menghapus data pembayaran |

## GPU Management Endpoints (`/gpu`)

| Method | Endpoint | Admin | Deskripsi |
|--------|----------|-------|-----------|
| POST | /gpu | ✓ | Menambahkan GPU baru ke database |
| GET | /gpu | ✓ | Mendapatkan daftar semua GPU |
| GET | /gpu/discover | ✓ | Menemukan GPU yang tersedia di host |
| GET | /gpu/mig/summary | ✓ | Mendapatkan ringkasan MIG GPU |
| GET | /gpu/mig/instances | ✓ | Mendapatkan instance MIG GPU |
| GET | /gpu/topology | ✓ | Mendapatkan matriks topologi GPU |
| PATCH | /gpu/{id} | ✓ | Memperbarui data GPU |
| DELETE | /gpu/{id} | ✓ | Menghapus GPU dari database |

## General Endpoints

| Method | Endpoint | Admin | Deskripsi |
|--------|----------|-------|-----------|
| GET | / | | Health check API (returns "API - Connect Succeed") |

## Notes:
- ✓ = Endpoint requires admin privileges
- All endpoints except `/auth/register`, `/auth/login`, `/auth/admin/login`, and `/` require authentication
- Authentication is done via JWT token in the Authorization header
- Base URL for all endpoints: `/api/v1`
