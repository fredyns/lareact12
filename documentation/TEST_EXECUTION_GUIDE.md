# Test Execution Guide - Sample Items & Sub-Items CRUD

## Quick Start

The browser preview is now open at: **http://localhost**

## Application Routes

### Sample Items Routes
- **List:** http://localhost/sample/items
- **Create:** http://localhost/sample/items/create
- **Show:** http://localhost/sample/items/{id}
- **Edit:** http://localhost/sample/items/{id}/edit

### Sub-Items Routes (Standalone)
- **List:** http://localhost/sample/sub-items
- **Create:** http://localhost/sample/sub-items/create
- **Show:** http://localhost/sample/sub-items/{id}
- **Edit:** http://localhost/sample/sub-items/{id}/edit

### Sub-Items Routes (Embedded in Item)
- **Managed from:** http://localhost/sample/items/{id} (item detail page)

---

## Test Execution Steps

### Phase 1: Sample Items CRUD Testing

#### 1.1 Login (if required)
1. Navigate to http://localhost
2. Login with test credentials
3. Verify successful authentication

#### 1.2 Test CREATE - Sample Items
1. Navigate to http://localhost/sample/items
2. Click "Create" or "Add New Item" button
3. Fill in the form with test data:
   - **Test Case 1:** Complete all fields
   - **Test Case 2:** Only required fields
   - **Test Case 3:** Invalid data (test validation)
4. Submit the form
5. **Verify:**
   - Success message appears
   - Redirected to appropriate page
   - Item appears in the list
6. **Record:** Response time and any issues

#### 1.3 Test READ - Sample Items
1. Navigate to http://localhost/sample/items
2. **Verify:**
   - Items list loads correctly
   - Pagination works (if applicable)
   - Search/filter works (if applicable)
3. Click on an item to view details
4. **Verify:**
   - Item details page loads
   - All data displayed correctly
   - Sub-items section visible (if any)
5. **Record:** Page load times

#### 1.4 Test UPDATE - Sample Items
1. From item details page, click "Edit"
2. Modify various fields
3. **Test Cases:**
   - Valid updates
   - Invalid data (validation)
   - Cancel operation
4. Save changes
5. **Verify:**
   - Success message
   - Changes reflected in database
   - Redirected appropriately
6. **Record:** Response time

#### 1.5 Test DELETE - Sample Items
1. Navigate to an item
2. Click "Delete" button
3. **Verify:**
   - Confirmation dialog appears
4. Test both:
   - Cancel deletion
   - Confirm deletion
5. **Verify:**
   - Item removed from list
   - Appropriate message shown
6. **Record:** Response time

---

### Phase 2: Sub-Items CRUD Testing (Embedded)

#### 2.1 Test CREATE - Sub-Items (Embedded)
1. Navigate to an item detail page
2. Find the sub-items section
3. Click "Add Sub-Item" or similar button
4. Fill in the sub-item form
5. Submit
6. **Verify:**
   - Sub-item created
   - Appears in the list immediately
   - Parent item shows updated count
7. **Record:** Response time

#### 2.2 Test READ - Sub-Items (Embedded)
1. View item with sub-items
2. **Verify:**
   - Sub-items list displayed
   - All sub-item data visible
3. Click on a sub-item to view details (if modal/popup)
4. **Verify:** Details shown correctly

#### 2.3 Test UPDATE - Sub-Items (Embedded)
1. From item detail page, edit a sub-item
2. Modify fields
3. Save changes
4. **Verify:**
   - Changes saved
   - Updated data displayed
5. **Record:** Response time

#### 2.4 Test DELETE - Sub-Items (Embedded)
1. From item detail page, delete a sub-item
2. Confirm deletion
3. **Verify:**
   - Sub-item removed
   - Parent item count updated
4. **Record:** Response time

---

### Phase 3: Sub-Items CRUD Testing (Standalone)

#### 3.1 Test CREATE - Sub-Items (Standalone)
1. Navigate to http://localhost/sample/sub-items
2. Click "Create" button
3. Fill form (including parent item selection)
4. Submit
5. **Verify:** Sub-item created and listed

#### 3.2 Test READ - Sub-Items (Standalone)
1. Navigate to http://localhost/sample/sub-items
2. **Verify:** All sub-items listed
3. Click on a sub-item
4. **Verify:** Detail page loads correctly

#### 3.3 Test UPDATE - Sub-Items (Standalone)
1. Edit a sub-item from standalone list
2. Modify and save
3. **Verify:** Changes reflected

#### 3.4 Test DELETE - Sub-Items (Standalone)
1. Delete a sub-item from standalone list
2. Confirm
3. **Verify:** Sub-item removed

---

### Phase 4: Performance Testing

#### 4.1 Measure Response Times
For each operation, record:
- **Page Load Time:** Time to fully render page
- **API Response Time:** Time from submit to response
- **UI Update Time:** Time for UI to reflect changes

#### 4.2 Stress Testing (Optional)
- Create multiple items rapidly
- Bulk operations (if available)
- Concurrent operations

#### 4.3 Performance Benchmarks
| Operation | Target | Actual | Pass/Fail |
|-----------|--------|--------|-----------|
| List Load | < 2s | ___ | ___ |
| Create | < 2s | ___ | ___ |
| Update | < 2s | ___ | ___ |
| Delete | < 1s | ___ | ___ |

---

### Phase 5: Edge Cases & Error Handling

#### 5.1 Test Edge Cases
- [ ] Create item with very long text
- [ ] Create item with special characters
- [ ] Delete item with many sub-items
- [ ] Update item with concurrent edits
- [ ] Network interruption during operation

#### 5.2 Test Error Handling
- [ ] Submit form with missing required fields
- [ ] Submit form with invalid data types
- [ ] Access non-existent item (404)
- [ ] Unauthorized access (permissions)

---

## Test Data Suggestions

### Sample Item Test Data

**Test Item 1 - Complete Data:**
```
Name: Test Item Alpha
Description: This is a comprehensive test item with all fields filled
Status: Active
Category: Test Category
Priority: High
Notes: Additional notes for testing purposes
```

**Test Item 2 - Minimal Data:**
```
Name: Minimal Test Item
(Only required fields)
```

**Test Item 3 - Special Characters:**
```
Name: Test Item with Special Chars !@#$%^&*()
Description: Testing special characters: <script>alert('test')</script>
```

### Sub-Item Test Data

**Sub-Item 1:**
```
Name: Sub-Item Alpha
Description: First sub-item for testing
Quantity: 5
Status: Active
```

**Sub-Item 2:**
```
Name: Sub-Item Beta
Description: Second sub-item for testing
Quantity: 10
Status: Pending
```

---

## Checklist

### Pre-Test
- [ ] Docker containers running
- [ ] Application accessible at localhost
- [ ] Database seeded with initial data (if needed)
- [ ] Test user account available
- [ ] Browser preview opened

### During Test
- [ ] Record all response times
- [ ] Take screenshots of issues
- [ ] Note any error messages
- [ ] Document unexpected behavior

### Post-Test
- [ ] Update TEST_PLAN.md with results
- [ ] Document all bugs found
- [ ] Create bug reports (if needed)
- [ ] Provide recommendations

---

## Notes Section

Use this space to record observations during testing:

```
[Timestamp] - [Observation]
Example: 10:00 AM - Item creation successful, response time: 1.2s
```

---

## Browser Developer Tools

### Useful Commands
1. **Open DevTools:** F12 or Ctrl+Shift+I
2. **Network Tab:** Monitor API calls and response times
3. **Console Tab:** Check for JavaScript errors
4. **Performance Tab:** Record page load performance

### What to Monitor
- Network requests (XHR/Fetch)
- Response times
- HTTP status codes
- Console errors
- Memory usage

---

## Completion Criteria

Tests are complete when:
- [ ] All CRUD operations tested for Items
- [ ] All CRUD operations tested for Sub-Items (embedded)
- [ ] All CRUD operations tested for Sub-Items (standalone)
- [ ] Performance benchmarks recorded
- [ ] Edge cases tested
- [ ] All results documented in TEST_PLAN.md
- [ ] Bug report created (if issues found)

---

**Ready to begin testing!** 🚀

Open the browser preview and start with Phase 1.
