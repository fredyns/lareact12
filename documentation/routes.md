# Application Routes Documentation

This document provides a comprehensive list of all routes in the application, organized by category.

---

## Table of Contents

- [Public Routes](#public-routes)
- [Authentication Routes](#authentication-routes)
- [Two-Factor Authentication Routes](#two-factor-authentication-routes)
- [Dashboard & Core Routes](#dashboard--core-routes)
- [User Management Routes](#user-management-routes)
- [RBAC (Role-Based Access Control) Routes](#rbac-role-based-access-control-routes)
- [Sample Items Routes](#sample-items-routes)
- [Upload Routes](#upload-routes)
- [Download Routes](#download-routes)
- [Settings Routes](#settings-routes)
- [API Routes](#api-routes)
- [Utility Routes](#utility-routes)

---

## Public Routes

### Landing Pages
Routes accessible without authentication.

| Method | URI | Name | Description | Action |
|--------|-----|------|-------------|--------|
| GET | `/` | `home` | Redirects to landing home page | [Closure](../routes/web.php#L16-L18) |
| GET | `/landing/home` | `landing.home` | Landing home page | [Closure](../routes/web.php#L22-L24) |
| GET | `/landing/services` | `landing.services` | Services information page | [Closure](../routes/web.php#L26-L28) |
| GET | `/landing/about` | `landing.about` | About us page | [Closure](../routes/web.php#L30-L32) |

---

## Authentication Routes

Routes for user authentication (guest only).

| Method | URI | Name | Description | Action |
|--------|-----|------|-------------|--------|
| GET | `/register` | `register` | Show registration form | [RegisteredUserController@create](../app/Http/Controllers/Auth/RegisteredUserController.php#L21-L24) |
| POST | `/register` | `register.store` | Process registration | [RegisteredUserController@store](../app/Http/Controllers/Auth/RegisteredUserController.php#L31-L50) |
| GET | `/login` | `login` | Show login form | [AuthenticatedSessionController@create](../app/Http/Controllers/Auth/AuthenticatedSessionController.php#L20-L26) |
| POST | `/login` | `login.store` | Process login | [AuthenticatedSessionController@store](../app/Http/Controllers/Auth/AuthenticatedSessionController.php#L31-L49) |
| POST | `/logout` | `logout` | Logout user | [AuthenticatedSessionController@destroy](../app/Http/Controllers/Auth/AuthenticatedSessionController.php#L54-L62) |

### Password Reset Routes

| Method | URI | Name | Description | Action |
|--------|-----|------|-------------|--------|
| GET | `/forgot-password` | `password.request` | Show forgot password form | [PasswordResetLinkController@create](../app/Http/Controllers/Auth/PasswordResetLinkController.php#L17-L22) |
| POST | `/forgot-password` | `password.email` | Send password reset link | [PasswordResetLinkController@store](../app/Http/Controllers/Auth/PasswordResetLinkController.php#L29-L40) |
| GET | `/reset-password/{token}` | `password.reset` | Show password reset form | [NewPasswordController@create](../app/Http/Controllers/Auth/NewPasswordController.php) |
| POST | `/reset-password` | `password.store` | Process password reset | [NewPasswordController@store](../app/Http/Controllers/Auth/NewPasswordController.php) |

### Email Verification Routes

| Method | URI | Name | Description | Action |
|--------|-----|------|-------------|--------|
| GET | `/verify-email` | `verification.notice` | Show email verification notice | [EmailVerificationPromptController](../app/Http/Controllers/Auth/EmailVerificationPromptController.php) |
| GET | `/verify-email/{id}/{hash}` | `verification.verify` | Verify email address | [VerifyEmailController](../app/Http/Controllers/Auth/VerifyEmailController.php) |
| POST | `/email/verification-notification` | `verification.send` | Resend verification email | [EmailVerificationNotificationController@store](../app/Http/Controllers/Auth/EmailVerificationNotificationController.php) |

---

## Two-Factor Authentication Routes

Laravel Fortify two-factor authentication routes.

| Method | URI | Name | Description | Code |
|--------|-----|------|-------------|------|
| GET | `/two-factor-challenge` | `two-factor.login` | Show 2FA challenge form | Fortify |
| POST | `/two-factor-challenge` | `two-factor.login.store` | Verify 2FA code | Fortify |
| POST | `/user/two-factor-authentication` | `two-factor.enable` | Enable 2FA | Fortify |
| DELETE | `/user/two-factor-authentication` | `two-factor.disable` | Disable 2FA | Fortify |
| GET | `/user/two-factor-qr-code` | `two-factor.qr-code` | Get 2FA QR code | Fortify |
| GET | `/user/two-factor-secret-key` | `two-factor.secret-key` | Get 2FA secret key | Fortify |
| GET | `/user/two-factor-recovery-codes` | `two-factor.recovery-codes` | Get recovery codes | Fortify |
| POST | `/user/two-factor-recovery-codes` | `two-factor.regenerate-recovery-codes` | Regenerate recovery codes | Fortify |
| POST | `/user/confirmed-two-factor-authentication` | `two-factor.confirm` | Confirm 2FA setup | Fortify |

### Password Confirmation Routes

| Method | URI | Name | Description | Code |
|--------|-----|------|-------------|------|
| GET | `/user/confirm-password` | `password.confirm` | Show password confirmation form | Fortify |
| POST | `/user/confirm-password` | `password.confirm.store` | Confirm password | Fortify |
| GET | `/user/confirmed-password-status` | `password.confirmation` | Check password confirmation status | Fortify |

---

## Dashboard & Core Routes

Routes requiring authentication and email verification.

| Method | URI | Name | Description | Action |
|--------|-----|------|-------------|--------|
| GET | `/dashboard` | `dashboard` | Main dashboard page | [Closure](../routes/web.php#L45-L47) |
| GET | `/enums/{enumClass}` | `enums.show` | Get enum values for dropdowns | [EnumController@show](../app/Http/Controllers/EnumController.php#L25) |

---

## User Management Routes

Full CRUD operations for user management.

| Method | URI | Name | Description | Action |
|--------|-----|------|-------------|--------|
| GET | `/users` | `users.index` | List all users | [UserController@index](../app/Http/Controllers/UserController.php#L18) |
| GET | `/users/create` | `users.create` | Show create user form | [UserController@create](../app/Http/Controllers/UserController.php#L55) |
| POST | `/users` | `users.store` | Store new user | [UserController@store](../app/Http/Controllers/UserController.php#L65) |
| GET | `/users/{user}` | `users.show` | Show user details | [UserController@show](../app/Http/Controllers/UserController.php#L96) |
| GET | `/users/{user}/edit` | `users.edit` | Show edit user form | [UserController@edit](../app/Http/Controllers/UserController.php#L124) |
| PUT/PATCH | `/users/{user}` | `users.update` | Update user | [UserController@update](../app/Http/Controllers/UserController.php#L136) |
| DELETE | `/users/{user}` | `users.destroy` | Delete user | [UserController@destroy](../app/Http/Controllers/UserController.php#L165) |

### User Role Assignment Routes

| Method | URI | Name | Description | Action |
|--------|-----|------|-------------|--------|
| POST | `/users/{user}/roles` | `users.roles.add` | Assign role to user | [UserController@addRole](../app/Http/Controllers/UserController.php#L178) |
| DELETE | `/users/{user}/roles/{role}` | `users.roles.remove` | Remove role from user | [UserController@removeRole](../app/Http/Controllers/UserController.php#L199) |

---

## RBAC (Role-Based Access Control) Routes

Routes for managing roles and permissions.

### Roles Management

| Method | URI | Name | Description | Action |
|--------|-----|------|-------------|--------|
| GET | `/rbac/roles` | `rbac.roles.index` | List all roles | [RoleController@index](../app/Http/Controllers/RBAC/RoleController.php#L16) |
| GET | `/rbac/roles/create` | `rbac.roles.create` | Show create role form | [RoleController@create](../app/Http/Controllers/RBAC/RoleController.php#L46) |
| POST | `/rbac/roles` | `rbac.roles.store` | Store new role | [RoleController@store](../app/Http/Controllers/RBAC/RoleController.php#L58) |
| GET | `/rbac/roles/{role}` | `rbac.roles.show` | Show role details | [RoleController@show](../app/Http/Controllers/RBAC/RoleController.php#L83) |
| GET | `/rbac/roles/{role}/edit` | `rbac.roles.edit` | Show edit role form | [RoleController@edit](../app/Http/Controllers/RBAC/RoleController.php#L95) |
| PUT/PATCH | `/rbac/roles/{role}` | `rbac.roles.update` | Update role | [RoleController@update](../app/Http/Controllers/RBAC/RoleController.php#L109) |
| DELETE | `/rbac/roles/{role}` | `rbac.roles.destroy` | Delete role | [RoleController@destroy](../app/Http/Controllers/RBAC/RoleController.php#L132) |

### Permissions Management

| Method | URI | Name | Description | Action |
|--------|-----|------|-------------|--------|
| GET | `/rbac/permissions` | `rbac.permissions.index` | List all permissions | [PermissionController@index](../app/Http/Controllers/RBAC/PermissionController.php#L16) |
| GET | `/rbac/permissions/create` | `rbac.permissions.create` | Show create permission form | [PermissionController@create](../app/Http/Controllers/RBAC/PermissionController.php#L46) |
| POST | `/rbac/permissions` | `rbac.permissions.store` | Store new permission | [PermissionController@store](../app/Http/Controllers/RBAC/PermissionController.php#L58) |
| GET | `/rbac/permissions/{permission}` | `rbac.permissions.show` | Show permission details | [PermissionController@show](../app/Http/Controllers/RBAC/PermissionController.php#L83) |
| GET | `/rbac/permissions/{permission}/edit` | `rbac.permissions.edit` | Show edit permission form | [PermissionController@edit](../app/Http/Controllers/RBAC/PermissionController.php#L95) |
| PUT/PATCH | `/rbac/permissions/{permission}` | `rbac.permissions.update` | Update permission | [PermissionController@update](../app/Http/Controllers/RBAC/PermissionController.php#L109) |
| DELETE | `/rbac/permissions/{permission}` | `rbac.permissions.destroy` | Delete permission | [PermissionController@destroy](../app/Http/Controllers/RBAC/PermissionController.php#L132) |

---

## Sample Items Routes

Demonstration routes for sample data management with full CRUD operations.

### Main Items

| Method | URI | Name | Description | Action |
|--------|-----|------|-------------|--------|
| GET | `/sample/items` | `sample.items.index` | List all items | [ItemController@index](../app/Http/Controllers/Sample/ItemController.php#L38) |
| GET | `/sample/items/create` | `sample.items.create` | Show create item form | [ItemController@create](../app/Http/Controllers/Sample/ItemController.php#L93) |
| POST | `/sample/items` | `sample.items.store` | Store new item | [ItemController@store](../app/Http/Controllers/Sample/ItemController.php#L108) |
| GET | `/sample/items/{item}` | `sample.items.show` | Show item details | [ItemController@show](../app/Http/Controllers/Sample/ItemController.php#L144) |
| GET | `/sample/items/{item}/edit` | `sample.items.edit` | Show edit item form | [ItemController@edit](../app/Http/Controllers/Sample/ItemController.php#L166) |
| PUT/PATCH | `/sample/items/{item}` | `sample.items.update` | Update item | [ItemController@update](../app/Http/Controllers/Sample/ItemController.php#L185) |
| DELETE | `/sample/items/{item}` | `sample.items.destroy` | Delete item | [ItemController@destroy](../app/Http/Controllers/Sample/ItemController.php#L235) |

### Embedded Sub-Items (within Item context)

Routes for managing sub-items within a specific item's context.

| Method | URI | Name | Description | Action |
|--------|-----|------|-------------|--------|
| GET | `/sample/items/{item}/sub-items` | `sample.items.sub-items.index` | List sub-items for an item | [Item\SubItemController@index](../app/Http/Controllers/Sample/Item/SubItemController.php#L28) |
| POST | `/sample/items/{item}/sub-items` | `sample.items.sub-items.store` | Create sub-item for an item | [Item\SubItemController@store](../app/Http/Controllers/Sample/Item/SubItemController.php#L69) |
| GET | `/sample/items/{item}/sub-items/{subItem}` | `sample.items.sub-items.show` | Show sub-item details | [Item\SubItemController@show](../app/Http/Controllers/Sample/Item/SubItemController.php#L94) |
| PUT | `/sample/items/{item}/sub-items/{subItem}` | `sample.items.sub-items.update` | Update sub-item | [Item\SubItemController@update](../app/Http/Controllers/Sample/Item/SubItemController.php#L113) |
| DELETE | `/sample/items/{item}/sub-items/{subItem}` | `sample.items.sub-items.destroy` | Delete sub-item | [Item\SubItemController@destroy](../app/Http/Controllers/Sample/Item/SubItemController.php#L135) |

### Standalone Sub-Items

Routes for managing sub-items independently.

| Method | URI | Name | Description | Action |
|--------|-----|------|-------------|--------|
| GET | `/sample/sub-items` | `sample.sub-items.index` | List all sub-items | [SubItemController@index](../app/Http/Controllers/Sample/SubItemController.php#L36) |
| GET | `/sample/sub-items/create` | `sample.sub-items.create` | Show create sub-item form | [SubItemController@create](../app/Http/Controllers/Sample/SubItemController.php#L99) |
| POST | `/sample/sub-items` | `sample.sub-items.store` | Store new sub-item | [SubItemController@store](../app/Http/Controllers/Sample/SubItemController.php#L119) |
| GET | `/sample/sub-items/{sub_item}` | `sample.sub-items.show` | Show sub-item details | [SubItemController@show](../app/Http/Controllers/Sample/SubItemController.php#L153) |
| GET | `/sample/sub-items/{sub_item}/edit` | `sample.sub-items.edit` | Show edit sub-item form | [SubItemController@edit](../app/Http/Controllers/Sample/SubItemController.php#L175) |
| PUT/PATCH | `/sample/sub-items/{sub_item}` | `sample.sub-items.update` | Update sub-item | [SubItemController@update](../app/Http/Controllers/Sample/SubItemController.php#L198) |
| DELETE | `/sample/sub-items/{sub_item}` | `sample.sub-items.destroy` | Delete sub-item | [SubItemController@destroy](../app/Http/Controllers/Sample/SubItemController.php#L248) |

---

## Upload Routes

Generic file upload routes for MinIO storage.

| Method | URI | Name | Description | Action |
|--------|-----|------|-------------|--------|
| POST | `/upload/file` | `upload.file` | Upload file to MinIO (PDF, DOCX, XLSX, etc.) | [UploadController@uploadFile](../app/Http/Controllers/UploadController.php#L24) |
| POST | `/upload/image` | `upload.image` | Upload image to MinIO (JPG, PNG, etc.) | [UploadController@uploadImage](../app/Http/Controllers/UploadController.php#L70) |

**Validation:**
- **Files:** Max 10MB, accepts PDF, DOCX, PPTX, XLSX, ZIP, RAR
- **Images:** Max 5MB, accepts JPG, JPEG, PNG, GIF, WEBP

---

## Download Routes

Routes for serving files from MinIO through the application domain.

| Method | URI | Name | Description | Action |
|--------|-----|------|-------------|--------|
| GET | `/downloads/{path}` | `downloads.serve` | Serve file inline (view in browser) | [DownloadController@serve](../app/Http/Controllers/DownloadController.php#L26) |
| GET | `/downloading/{path}` | `downloads.force` | Force download file | [DownloadController@download](../app/Http/Controllers/DownloadController.php#L67) |

**Note:** Path parameter accepts any path pattern (`.*`)

---

## Settings Routes

User settings and profile management routes.

### Profile Settings

| Method | URI | Name | Description | Action |
|--------|-----|------|-------------|--------|
| GET | `/settings` | - | Redirects to profile settings | [Redirect](../routes/settings.php#L10) |
| GET | `/settings/profile` | `profile.edit` | Show profile edit form | [ProfileController@edit](../app/Http/Controllers/Settings/ProfileController.php#L19) |
| PATCH | `/settings/profile` | `profile.update` | Update profile | [ProfileController@update](../app/Http/Controllers/Settings/ProfileController.php#L30) |
| DELETE | `/settings/profile` | `profile.destroy` | Delete account | [ProfileController@destroy](../app/Http/Controllers/Settings/ProfileController.php#L49) |

### Password Settings

| Method | URI | Name | Description | Action |
|--------|-----|------|-------------|--------|
| GET | `/settings/password` | `password.edit` | Show password change form | [PasswordController@edit](../app/Http/Controllers/Settings/PasswordController.php#L18) |
| PUT | `/settings/password` | `password.update` | Update password (rate limited) | [PasswordController@update](../app/Http/Controllers/Settings/PasswordController.php#L26) |

**Rate Limit:** 6 attempts per minute

### Appearance Settings

| Method | URI | Name | Description | Action |
|--------|-----|------|-------------|--------|
| GET | `/settings/appearance` | `appearance.edit` | Show appearance settings | [Closure](../routes/settings.php#L22-L24) |

### Two-Factor Authentication Settings

| Method | URI | Name | Description | Action |
|--------|-----|------|-------------|--------|
| GET | `/settings/two-factor` | `two-factor.show` | Show 2FA settings (requires password confirmation) | [TwoFactorAuthenticationController@show](../app/Http/Controllers/Settings/TwoFactorAuthenticationController.php) |

---

## API Routes

RESTful API routes using Sanctum authentication.

### User API

| Method | URI | Name | Description | Action |
|--------|-----|------|-------------|--------|
| GET | `/api/user` | - | Get authenticated user | [Closure](../routes/api.php#L18-L20) |

### Sample Items API

| Method | URI | Name | Description | Action |
|--------|-----|------|-------------|--------|
| GET | `/api/sample/items` | `sample.items.index` | List all items (API) | [ItemController@index](../app/Http/Controllers/Sample/ItemController.php#L38) |
| POST | `/api/sample/items` | `sample.items.store` | Create item (API) | [ItemController@store](../app/Http/Controllers/Sample/ItemController.php#L108) |
| GET | `/api/sample/items/{item}` | `sample.items.show` | Show item (API) | [ItemController@show](../app/Http/Controllers/Sample/ItemController.php#L144) |
| PUT/PATCH | `/api/sample/items/{item}` | `sample.items.update` | Update item (API) | [ItemController@update](../app/Http/Controllers/Sample/ItemController.php#L185) |
| DELETE | `/api/sample/items/{item}` | `sample.items.destroy` | Delete item (API) | [ItemController@destroy](../app/Http/Controllers/Sample/ItemController.php#L235) |

**Authentication:** Requires Sanctum token authentication

---

## Utility Routes

### Health Check

| Method | URI | Name | Description | Action |
|--------|-----|------|-------------|--------|
| GET | `/up` | - | Application health check endpoint | Laravel Default |

### Storage

| Method | URI | Name | Description | Action |
|--------|-----|------|-------------|--------|
| GET | `/storage/{path}` | `storage.local` | Serve files from local storage | Laravel Default |

---

## Middleware Summary

### Common Middleware Groups

- **web**: Session state, CSRF protection, cookie encryption
- **auth**: Requires authenticated user
- **verified**: Requires verified email address
- **guest**: Only accessible to non-authenticated users
- **auth:sanctum**: API token authentication
- **password.confirm**: Requires recent password confirmation
- **throttle**: Rate limiting (various limits)
- **signed**: Requires signed URL

### Route Protection

Most application routes require both `auth` and `verified` middleware, ensuring users are:
1. Logged in
2. Have verified their email address

API routes use `auth:sanctum` for token-based authentication.

---

## Route Naming Conventions

The application follows consistent route naming patterns:

- **Resource routes**: `{prefix}.{resource}.{action}` (e.g., `sample.items.index`)
- **Nested routes**: `{prefix}.{parent}.{child}.{action}` (e.g., `sample.items.sub-items.store`)
- **Settings routes**: `{setting-type}.{action}` (e.g., `profile.edit`)
- **Auth routes**: `{action}` or `{feature}.{action}` (e.g., `login`, `two-factor.enable`)

---

## File Structure

Route files are organized as follows:

```
routes/
├── web.php          # Main web routes (dashboard, users, RBAC, samples)
├── api.php          # API routes with Sanctum authentication
├── auth.php         # Authentication routes (login, register, password reset)
└── settings.php     # User settings routes (profile, password, appearance)
```

---

## Additional Resources

- **Controllers Directory**: `app/Http/Controllers/`
- **RBAC Controllers**: `app/Http/Controllers/RBAC/`
- **Sample Controllers**: `app/Http/Controllers/Sample/`
- **Settings Controllers**: `app/Http/Controllers/Settings/`
- **Auth Controllers**: `app/Http/Controllers/Auth/`

---

**Last Updated:** 2025-10-19  
**Laravel Version:** 12.30.1  
**Total Routes:** 100+
