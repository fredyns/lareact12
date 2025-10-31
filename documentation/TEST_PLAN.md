# Test Plan: Sample Items & Sub-Items CRUD Operations

**Application:** LaReact12  
**Test Date:** October 31, 2025  
**Test Environment:** Docker (localhost)  
**Tester:** Cascade AI

## Test Objectives
1. Verify all CRUD operations for Sample Items
2. Verify all CRUD operations for Sub-Items (both embedded and standalone)
3. Measure performance and response times
4. Identify any bugs or issues
5. Validate integration with MinIO file storage
6. Verify real-time notification functionality
7. Test RBAC permissions for different user roles
8. Validate form validation and error handling
9. Test responsive design and mobile compatibility
10. Verify accessibility compliance

---

## Test Scope

### Sample Items CRUD
- **Create:** Add new sample items with various data types (text, numbers, dates, files, etc.)
- **Read:** View item list and individual item details with proper pagination
- **Update:** Edit existing items with validation
- **Delete:** Remove items from the system with confirmation

### Sub-Items CRUD
- **Create:** Add sub-items to parent items (embedded interface)
- **Read:** View sub-items list (embedded and standalone)
- **Update:** Edit existing sub-items
- **Delete:** Remove sub-items with proper cascading

### Integration Testing
- File uploads to MinIO storage
- Real-time notifications via WebSocket
- RBAC permissions enforcement
- API endpoint validation

---

## Test Prerequisites

### Test Data Requirements
- Test user as Sys-Admin:
  - email: admin@admin.com
  - password: admin
- Sample data for all field types:
    - Text fields (short, long, markdown)
    - Numeric fields (integer, decimal)
    - Date/time fields
    - File upload fields (PDF, DOCX, images)
    - Select fields with options
    - Boolean fields

### Environment Setup
1. Docker containers must be running:
    - PHP Application (port 8000)
    - PostgreSQL database
    - Redis cache/queue
    - MinIO object storage
    - Reverb WebSocket server
2. Database must be migrated and seeded
3. Test user accounts must be created
4. MinIO buckets must be configured

---

## Test Cases

### 1. Sample Items - CREATE

| Test ID | Test Case | Steps | Expected Result | Status | Notes |
|---------|-----------|-------|-----------------|--------|-------|
| SI-C-01 | Create new item with valid data | 1. Navigate to /sample/items<br>2. Click "Create" button<br>3. Fill all required fields<br>4. Submit form | Item created successfully, redirected to item list or detail page | ⏳ Pending | |
| SI-C-02 | Create item with minimal data | 1. Navigate to create page<br>2. Fill only required fields<br>3. Submit | Item created with minimal data | ⏳ Pending | |
| SI-C-03 | Validation - empty required fields | 1. Navigate to create page<br>2. Leave required fields empty<br>3. Submit | Validation errors displayed | ⏳ Pending | |
| SI-C-04 | Performance - creation time | Measure time from submit to success | Response < 2 seconds | ⏳ Pending | |

### 2. Sample Items - READ

| Test ID | Test Case | Steps | Expected Result | Status | Notes |
|---------|-----------|-------|-----------------|--------|-------|
| SI-R-01 | View items list | Navigate to /sample/items | All items displayed in list/table | ⏳ Pending | |
| SI-R-02 | View item details | Click on an item from list | Item details page displayed | ⏳ Pending | |
| SI-R-03 | Pagination (if applicable) | Navigate through pages | Pagination works correctly | ⏳ Pending | |
| SI-R-04 | Search/Filter (if applicable) | Use search/filter features | Results filtered correctly | ⏳ Pending | |
| SI-R-05 | Performance - list load time | Measure page load time | Response < 2 seconds | ⏳ Pending | |

### 3. Sample Items - UPDATE

| Test ID | Test Case | Steps | Expected Result | Status | Notes |
|---------|-----------|-------|-----------------|--------|-------|
| SI-U-01 | Edit existing item | 1. Navigate to item detail<br>2. Click "Edit"<br>3. Modify fields<br>4. Save | Item updated successfully | ⏳ Pending | |
| SI-U-02 | Update validation | 1. Edit item<br>2. Enter invalid data<br>3. Submit | Validation errors shown | ⏳ Pending | |
| SI-U-03 | Cancel edit | 1. Start editing<br>2. Click cancel | Changes discarded, returned to previous page | ⏳ Pending | |
| SI-U-04 | Performance - update time | Measure update operation time | Response < 2 seconds | ⏳ Pending | |

### 4. Sample Items - DELETE

| Test ID | Test Case | Steps | Expected Result | Status | Notes |
|---------|-----------|-------|-----------------|--------|-------|
| SI-D-01 | Delete item | 1. Navigate to item<br>2. Click delete<br>3. Confirm | Item deleted, removed from list | ⏳ Pending | |
| SI-D-02 | Delete confirmation | Click delete button | Confirmation dialog appears | ⏳ Pending | |
| SI-D-03 | Cancel delete | 1. Click delete<br>2. Cancel confirmation | Item not deleted | ⏳ Pending | |
| SI-D-04 | Cascade delete sub-items | Delete item with sub-items | Sub-items also deleted or handled properly | ⏳ Pending | |

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

---

## Performance Benchmarks

| Operation | Target | Actual | Status |
|-----------|--------|--------|--------|
| Item List Load | < 2s | - | ⏳ |
| Item Create | < 2s | - | ⏳ |
| Item Update | < 2s | - | ⏳ |
| Item Delete | < 1s | - | ⏳ |
| Sub-Item Create | < 2s | - | ⏳ |
| Sub-Item Update | < 2s | - | ⏳ |
| Sub-Item Delete | < 1s | - | ⏳ |

---

## Test Environment Details

- **Application URL:** http://localhost
- **Database:** PostgreSQL (Docker container)
- **Cache:** Redis (Docker container)
- **Storage:** MinIO (Docker container)
- **Queue:** Redis (Docker container)
- **WebSocket:** Reverb (Docker container)

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
