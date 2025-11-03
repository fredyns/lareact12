# Comprehensive Test Plan: LaReact12 Sample Items Module

**Application:** LaReact12 (Laravel + React)  
**Test Date:** October 31, 2025  
**Test Environment:** Docker (localhost)  
**Framework:** Vitest + @testing-library/react  
**Tester:** Cascade AI  
**Version:** 1.2.0

## Test Objectives

### Primary Objectives
1. **CRUD Operations**: Verify all Create, Read, Update, Delete operations for Sample Items
2. **Data Integrity**: Ensure proper data validation and storage across all field types
3. **Performance**: Measure response times and identify performance bottlenecks
4. **Integration Testing**: Validate MinIO file storage, WebSocket notifications, and API endpoints
5. **Security**: Test authentication, authorization (RBAC), and input sanitization

### Secondary Objectives
6. **User Experience**: Test rich text editors (Markdown, TinyMCE), morphing cards UI, view switching
7. **Cross-browser Compatibility**: Verify functionality across major browsers
8. **Accessibility**: Ensure WCAG 2.1 AA compliance
9. **Mobile Responsiveness**: Test on various screen sizes and touch interfaces
10. **Error Handling**: Validate graceful error handling and user feedback

---

## Test Scope

### 1. Sample Items CRUD Operations
- **Create:** Multi-step form with 15+ field types including file uploads
- **Read:** List view (table/cards), detail view, pagination, search/filtering
- **Update:** In-place editing with validation and file management
- **Delete:** Soft delete with confirmation and cascade handling

### 2. Field-Specific Testing
- **Text Fields:** string (required), email validation, color picker, IP address
- **Rich Text:** markdown editor with live preview, TinyMCE WYSIWYG editor
- **Numeric:** integer with slider, decimal validation, NPWP pattern
- **Date/Time:** date picker, time picker, datetime combination
- **File Management:** PDF/DOCX uploads, image uploads with MinIO integration
- **Selection:** dropdown enumerate, async user selection with search
- **Boolean:** checkbox with proper state management
- **Location:** latitude/longitude with interactive map (Leaflet)

### 3. UI Component Testing
- **View Switching:** Table view ↔ Cards view with state preservation
- **Morphing Cards:** Hover effects, preview modals, action menus
- **Forms:** Multi-section layout, validation feedback, file upload progress
- **Navigation:** Breadcrumbs, sidebar navigation, responsive menu

### 4. Integration Testing
- **MinIO Storage:** File upload, organized folder structure, temporary cleanup
- **WebSocket Notifications:** Real-time updates, notification bell, toast messages
- **API Endpoints:** RESTful API validation, authentication headers
- **Database:** Transaction integrity, migration compatibility

### 5. Security & Performance
- **Authentication:** Login/logout, session management, password policies
- **Authorization:** RBAC permissions, role-based access control
- **Input Validation:** XSS prevention, SQL injection protection
- **Performance:** Response times < 2s, memory usage, concurrent operations

---

## Test Prerequisites

### Test Data Requirements

#### User Accounts
- **Admin User:**
  - Email: admin@admin.com
  - Password: admin
  - Roles: Super Admin (all permissions)
- **Test User:**
  - Email: test@test.com  
  - Password: test123
  - Roles: Basic User (limited permissions)

#### Sample Test Data
- **Text Data:**
  - Valid strings: "Test Item Alpha", "Product XYZ"
  - Special characters: "Test!@#$%^&*()_+{}|:<>?"
  - Unicode: "测试项目", "🚀 Rocket Item"
  - Long text: 1000+ character descriptions
  - Markdown: Headers, **bold**, *italic*, ~~strikethrough~~, mermaid diagrams

- **File Test Data:**
  - PDF files (< 10MB): test-document.pdf
  - Images (< 5MB): test-image.jpg, test-photo.png
  - Invalid files: oversized files, wrong formats
  - Special filename characters: "file name with spaces.pdf"

- **Edge Case Data:**
  - Empty required fields
  - Maximum length strings
  - Invalid email formats
  - Future/past date boundaries
  - Negative numbers
  - SQL injection attempts: "'; DROP TABLE items; --"
  - XSS attempts: "<script>alert('test')</script>"

### Environment Setup

#### Docker Environment
1. **Application Stack:**
   - PHP 8.3 Application (port 8000)
   - PostgreSQL 15 Database (port 5432)
   - Redis 7 Cache/Queue (port 6379)
   - MinIO Object Storage (ports 9000, 9001)
   - Soketi WebSocket Server (port 6001)

2. **Frontend Build:**
   - Node.js 20+ with npm
   - Vite development server
   - React 19 with TypeScript
   - Vitest testing framework

#### Database Setup
```bash
php artisan migrate:fresh --seed
php artisan db:seed --class=TestDataSeeder
```

#### MinIO Configuration
- Bucket: `localhost`
- Test folders: `sample_items/2025/10/31/`
- Access credentials: minioadmin/minioadmin123

#### Test User Setup
```bash
php artisan tinker
User::factory()->create(['email' => 'admin@admin.com', 'password' => bcrypt('admin')]);
User::factory()->create(['email' => 'test@test.com', 'password' => bcrypt('test123')]);
```

---

## Test Cases

### 1. Sample Items - CREATE

| Test ID | Test Case | Steps | Expected Result | Status | Notes |
|---------|-----------|-------|-----------------|--------|-------|
| SI-C-01 | Create new item with valid data | 1. Navigate to /sample/items<br>2. Click "Create" button<br>3. Fill all required fields<br>4. Submit form | Item created successfully, redirected to item list or detail page | ⏳ Pending | |
| SI-C-02 | Create item with minimal data | 1. Navigate to create page<br>2. Fill only required fields<br>3. Submit | Item created with minimal data | ⏳ Pending | |
| SI-C-03 | Validation - empty required fields | 1. Navigate to create page<br>2. Leave required fields empty<br>3. Submit | Validation errors displayed | ⏳ Pending | |
| SI-C-04 | Performance - creation time | Measure time from submit to success | Response < 2 seconds | ⏳ Pending | |
| SI-C-05 | File upload integration | 1. Upload PDF (< 10MB)<br>2. Upload image (< 5MB)<br>3. Verify MinIO folder structure<br>4. Submit form | Files uploaded to date-organized folders | ⏳ Pending | High |
| SI-C-06 | Markdown editor functionality | 1. Use markdown with **bold**, *italic*<br>2. Add mermaid diagram<br>3. Preview live updates<br>4. Submit | Markdown renders correctly with diagrams | ⏳ Pending | High |
| SI-C-07 | Form validation edge cases | 1. Empty required fields<br>2. Invalid email format<br>3. Oversized files<br>4. XSS/SQL injection attempts | Proper validation and security | ⏳ Pending | High |
| SI-C-08 | Complex field interactions | 1. Use integer slider<br>2. Set lat/lng with map<br>3. Select from async user dropdown<br>4. Test NPWP pattern | All specialized fields work correctly | ⏳ Pending | Medium |

### 2. Sample Items - READ

| Test ID | Test Case | Steps | Expected Result | Status | Notes |
|---------|-----------|-------|-----------------|--------|-------|
| SI-R-01 | View items list | Navigate to /sample/items | All items displayed in list/table | ⏳ Pending | |
| SI-R-02 | View item details | Click on an item from list | Item details page displayed | ⏳ Pending | |
| SI-R-03 | Pagination (if applicable) | Navigate through pages | Pagination works correctly | ⏳ Pending | |
| SI-R-04 | Search/Filter (if applicable) | Use search/filter features | Results filtered correctly | ⏳ Pending | |
| SI-R-05 | Performance - list load time | Measure page load time | Response < 2 seconds | ⏳ Pending | |
| SI-R-06 | Cards view with morphing | 1. Switch to cards view<br>2. Hover over cards<br>3. Click 3-dot menu<br>4. Test preview modal | Morphing effects and preview work | ⏳ Pending | High |
| SI-R-07 | View switching preservation | 1. Select columns in table<br>2. Switch to cards<br>3. Switch back to table<br>4. Verify state | Column selection preserved | ⏳ Pending | High |
| SI-R-08 | Rich content display | 1. View items with markdown<br>2. Check mermaid diagrams<br>3. Test file downloads<br>4. Verify image display | All rich content renders properly | ⏳ Pending | High |
| SI-R-09 | Search and filtering | 1. Use search functionality<br>2. Apply column filters<br>3. Sort by different fields<br>4. Test pagination | Search/filter/sort work accurately | ⏳ Pending | Medium |

### 3. Sample Items - UPDATE

| Test ID | Test Case | Steps | Expected Result | Status | Notes |
|---------|-----------|-------|-----------------|--------|-------|
| SI-U-01 | Edit existing item | 1. Navigate to item detail<br>2. Click "Edit"<br>3. Modify fields<br>4. Save | Item updated successfully | ⏳ Pending | |
| SI-U-02 | Update validation | 1. Edit item<br>2. Enter invalid data<br>3. Submit | Validation errors shown | ⏳ Pending | |
| SI-U-03 | Cancel edit | 1. Start editing<br>2. Click cancel | Changes discarded, returned to previous page | ⏳ Pending | |
| SI-U-04 | Performance - update time | Measure update operation time | Response < 2 seconds | ⏳ Pending | |
| SI-U-05 | File replacement | 1. Edit item with files<br>2. Upload new files<br>3. Remove old files<br>4. Save changes | New files uploaded, old cleaned up | ⏳ Pending | High |
| SI-U-06 | Rich text editor updates | 1. Modify markdown content<br>2. Update TinyMCE WYSIWYG<br>3. Change mermaid diagrams<br>4. Save | Rich text changes preserved | ⏳ Pending | High |
| SI-U-07 | Concurrent edit handling | 1. Open in two browsers<br>2. Edit simultaneously<br>3. Test conflict resolution | Proper conflict handling | ⏳ Pending | Medium |

### 4. Sample Items - DELETE

| Test ID | Test Case | Steps | Expected Result | Status | Notes |
|---------|-----------|-------|-----------------|--------|-------|
| SI-D-01 | Delete item | 1. Navigate to item<br>2. Click delete<br>3. Confirm | Item deleted, removed from list | ⏳ Pending | |
| SI-D-02 | Delete confirmation | Click delete button | Confirmation dialog appears | ⏳ Pending | |
| SI-D-03 | Cancel delete | 1. Click delete<br>2. Cancel confirmation | Item not deleted | ⏳ Pending | |
| SI-D-04 | Cascade delete sub-items | Delete item with sub-items | Sub-items also deleted or handled properly | ⏳ Pending | |
| SI-D-05 | File cleanup on delete | 1. Delete item with files<br>2. Check MinIO cleanup<br>3. Verify folder structure | Files removed from MinIO storage | ⏳ Pending | High |
| SI-D-06 | Authorization checks | 1. Login as limited user<br>2. Attempt delete<br>3. Verify permissions | Only authorized users can delete | ⏳ Pending | High |

### 5. Sub-Items - CREATE (Embedded)

| Test ID | Test Case | Steps | Expected Result | Status | Notes |
|---------|-----------|-------|-----------------|--------|-------|
| SUB-C-01 | Create sub-item from parent item | 1. View item details<br>2. Add sub-item<br>3. Fill form<br>4. Submit | Sub-item created and displayed | ⏳ Pending | |
| SUB-C-02 | Create multiple sub-items | Add 3+ sub-items to one parent | All sub-items created | ⏳ Pending | |
| SUB-C-03 | Validation - sub-item fields | Submit with invalid data | Validation errors shown | ⏳ Pending | |

### 6. Sub-Items - READ

| Test ID | Test Case | Steps | Expected Result | Status | Notes |
|---------|-----------|-------|-----------------|--------|-------|
| SUB-R-01 | View sub-items in parent item | Navigate to item details | Sub-items list displayed | ⏳ Pending | |
| SUB-R-02 | View standalone sub-items list | Navigate to /sample/sub-items | All sub-items displayed | ⏳ Pending | |
| SUB-R-03 | View sub-item details | Click on sub-item | Sub-item details shown | ⏳ Pending | |

### 7. Sub-Items - UPDATE

| Test ID | Test Case | Steps | Expected Result | Status | Notes |
|---------|-----------|-------|-----------------|--------|-------|
| SUB-U-01 | Edit sub-item (embedded) | 1. From parent item<br>2. Edit sub-item<br>3. Save | Sub-item updated | ⏳ Pending | |
| SUB-U-02 | Edit sub-item (standalone) | 1. From sub-items list<br>2. Edit<br>3. Save | Sub-item updated | ⏳ Pending | |

### 8. Sub-Items - DELETE

| Test ID | Test Case | Steps | Expected Result | Status | Notes |
|---------|-----------|-------|-----------------|--------|-------|
| SUB-D-01 | Delete sub-item (embedded) | 1. From parent item<br>2. Delete sub-item<br>3. Confirm | Sub-item deleted | ⏳ Pending | |
| SUB-D-02 | Delete sub-item (standalone) | 1. From sub-items list<br>2. Delete<br>3. Confirm | Sub-item deleted | ⏳ Pending | |

### 9. Integration Testing

| Test ID | Test Case | Steps | Expected Result | Status | Priority |
|---------|-----------|-------|-----------------|--------|----------|
| INT-01 | MinIO file storage | 1. Upload files via form<br>2. Check organized folder structure<br>3. Download files via URLs<br>4. Verify cleanup on delete | Files properly organized and accessible | ⏳ Pending | High |
| INT-02 | WebSocket notifications | 1. Create/update/delete items<br>2. Check real-time notifications<br>3. Test notification bell<br>4. Verify toast messages | Real-time updates work correctly | ⏳ Pending | High |
| INT-03 | API endpoint validation | 1. Test all CRUD endpoints<br>2. Verify authentication headers<br>3. Check response formats<br>4. Test error handling | APIs respond correctly with proper auth | ⏳ Pending | High |

### 10. Security Testing

| Test ID | Test Case | Steps | Expected Result | Status | Priority |
|---------|-----------|-------|-----------------|--------|----------|
| SEC-01 | Authentication flow | 1. Login with valid credentials<br>2. Test session management<br>3. Logout functionality<br>4. Access protected routes | Proper authentication enforcement | ⏳ Pending | High |
| SEC-02 | RBAC authorization | 1. Login as different user roles<br>2. Test permission boundaries<br>3. Verify restricted actions<br>4. Check admin-only features | Role-based access properly enforced | ⏳ Pending | High |
| SEC-03 | Input sanitization | 1. Submit XSS payloads<br>2. Test SQL injection<br>3. Upload malicious files<br>4. Check output encoding | All inputs properly sanitized | ⏳ Pending | High |

### 11. UI/UX Testing

| Test ID | Test Case | Steps | Expected Result | Status | Priority |
|---------|-----------|-------|-----------------|--------|----------|
| UI-01 | Responsive design | 1. Test on mobile devices<br>2. Tablet view (768px)<br>3. Desktop view (1024px+)<br>4. Ultra-wide screens | Layout adapts properly to all screen sizes | ⏳ Pending | Medium |
| UI-02 | Accessibility compliance | 1. Screen reader compatibility<br>2. Keyboard navigation<br>3. Color contrast ratios<br>4. ARIA labels and roles | WCAG 2.1 AA compliance achieved | ⏳ Pending | Medium |
| UI-03 | Cross-browser compatibility | 1. Chrome (latest)<br>2. Firefox (latest)<br>3. Safari (latest)<br>4. Edge (latest) | Consistent functionality across browsers | ⏳ Pending | Medium |

---

## Performance Benchmarks

| Operation | Target | Actual | Status | Notes |
|-----------|--------|--------|--------|-------|
| Item List Load (Table View) | < 2s | - | ⏳ | Initial page load |
| Item List Load (Cards View) | < 2s | - | ⏳ | With morphing effects |
| View Switching (Table ↔ Cards) | < 500ms | - | ⏳ | State preservation |
| Item Create (with files) | < 3s | - | ⏳ | Including file uploads |
| Item Create (text only) | < 2s | - | ⏳ | No file uploads |
| Item Update (with file changes) | < 3s | - | ⏳ | File replacement |
| Item Update (text only) | < 2s | - | ⏳ | No file changes |
| Item Delete | < 1s | - | ⏳ | Including file cleanup |
| File Upload (MinIO) | < 5s | - | ⏳ | 10MB file limit |
| Search/Filter Operations | < 1s | - | ⏳ | Large datasets |
| Markdown Live Preview | < 200ms | - | ⏳ | Real-time rendering |
| Mermaid Diagram Rendering | < 1s | - | ⏳ | Complex diagrams |
| WebSocket Notification | < 100ms | - | ⏳ | Real-time updates |
| Memory Usage (Initial Load) | < 100MB | - | ⏳ | Browser memory |
| Memory Usage (After Operations) | < 200MB | - | ⏳ | No significant leaks |

---

## Test Environment Details

### Infrastructure
- **Application URL:** http://localhost:8000
- **Database:** PostgreSQL 15 (Docker container, port 5432)
- **Cache:** Redis 7 (Docker container, port 6379)
- **Storage:** MinIO (Docker container, ports 9000, 9001)
- **Queue:** Redis (Docker container)
- **WebSocket:** Soketi (Docker container, port 6001)

### Frontend Stack
- **Framework:** React 19 with TypeScript
- **Build Tool:** Vite 5
- **UI Library:** shadcn/ui + Tailwind CSS
- **Rich Text:** TinyMCE 7.0, react-markdown + mermaid
- **Testing:** Vitest + @testing-library/react

### Backend Stack
- **Framework:** Laravel 11 with PHP 8.3
- **Authentication:** Laravel Sanctum
- **Authorization:** Spatie Laravel Permission (RBAC)
- **File Storage:** MinIO S3-compatible storage
- **Real-time:** Laravel Broadcasting with Soketi

### Browser Testing Matrix
| Browser | Version | Priority |
|---------|---------|----------|
| Chrome | Latest | High |
| Firefox | Latest | High |
| Safari | Latest | Medium |
| Edge | Latest | Medium |
| Mobile Safari (iOS) | Latest | Medium |
| Chrome Mobile (Android) | Latest | Medium |

### Device Testing Matrix
| Device Type | Screen Size | Priority |
|-------------|-------------|----------|
| Desktop | 1920x1080+ | High |
| Laptop | 1366x768 | High |
| Tablet | 768x1024 | Medium |
| Mobile | 375x667 | Medium |
| Large Mobile | 414x896 | Medium |

---

## Test Execution Log

### Session Start
- **Date/Time:** 2025-10-31 09:54 UTC+7
- **Browser:** Chrome/Edge (via browser preview)
- **User:** Test user (to be determined)

### Test Results
_Results will be documented here during test execution_

---

## Issues Found
_Any bugs or issues will be documented here_

---

## Recommendations
_Recommendations for improvements will be listed here_

---

## Automated Testing Integration

This test plan aligns with the project's automated testing framework:
- Unit tests located in `tests/Unit/`
- Feature tests located in `tests/Feature/`
- Run all tests with: `php artisan test`
- Run specific test suite: `php artisan test --testsuite=Feature`

---

## Sign-off

- **Tested By:** Cascade AI
- **Status:** In Progress
- **Completion Date:** TBD
