# Spec Demo Test Plan

Version: 1.0
Owner: QA
Status: Approved for execution

1. Objective
- Validate that the specification demo meets functional and non-functional acceptance criteria.
- Verify data accuracy, user interactions, navigation, API integrations, and stability across supported environments.

2. Scope
- In scope:
  - UI components: DemoFeatureDisplay, InteractiveButton, InputForm, NavigationMenu
  - API: GET /api/demo-data, POST /api/user-action
  - Cross-browser/device validation (Chrome, Firefox, Edge, Safari; desktop, tablet, mobile)
  - Error handling, console errors, and performance observations
- Out of scope:
  - New feature development
  - Database schema changes
  - Load testing beyond manual observation

3. References
- Repository: https://github.com/Arafat-SJI/hackathon/tree/feature/specdriven-control-tower
- Task: Spec Demo Test

4. Test Environment
- Browsers: Chrome (latest), Firefox (latest), Edge (latest), Safari (latest on macOS/iOS)
- Operating systems: Windows 10/11, macOS (latest), Android 12+, iOS 16+
- Devices:
  - Desktop: 1440x900 and 1920x1080
  - Tablet: 768x1024 (portrait), 1024x768 (landscape)
  - Mobile: 375x812 (iPhone X/12), 360x800 (Pixel 5)
- Network conditions: Normal broadband, throttled 3G for performance observation
- Test accounts/data: Use non-production/demo-safe data

5. Entry and Exit Criteria
- Entry:
  - Deployed demo is accessible
  - Test data available; APIs reachable
  - Supported browsers installed
- Exit:
  - All planned test cases executed
  - All critical/major defects documented
  - Acceptance criteria assessed with pass/fail rationale

6. Test Data
- API expected behavior:
  - GET /api/demo-data
    - Expected 200 OK with JSON payload
    - Example fields: id:string, title:string, description:string, updatedAt:ISO string
    - No PII; consistent types and non-null for required fields
  - POST /api/user-action
    - Expected 2xx on valid submission; 4xx on validation errors with clear messages
    - Request example: { actionType: "click" | "form_submit", payload: object }
- UI form inputs (InputForm):
  - Name: alphabetic with spaces, 2-50 chars
  - Email: valid RFC 5322 format
  - Message: 1-500 chars; disallow only whitespace
  - Invalid examples to test: empty fields, malformed email, overly long strings, XSS payloads like <script>alert(1)</script>

7. Test Cases
Note: Execute each case on all supported browsers/devices unless noted.

TC-001: App loads successfully
- Area: Global/Load
- Precondition: App deployed and accessible
- Steps:
  1) Navigate to the demo URL
  2) Observe initial render
- Expected:
  - Page loads without unhandled errors
  - No console errors/warnings
  - Global navigation and primary content visible within 2s on broadband
  - Title and branding visible
- Priority: High | Type: Functional/UI

TC-002: NavigationMenu links work
- Area: NavigationMenu
- Steps:
  1) Click each visible nav link (e.g., Home, Features, Contact/About)
  2) Use browser back/forward
- Expected:
  - Route changes without full page reload
  - Active link highlighted/stateful
  - Back/forward restores prior state
- Priority: High | Type: Functional/UI

TC-003: DemoFeatureDisplay renders data
- Area: DemoFeatureDisplay, GET /api/demo-data
- Steps:
  1) Load page showing DemoFeatureDisplay
  2) Observe data list/cards
  3) Compare displayed values with API response via devtools Network tab
- Expected:
  - Data rendered matches API values (title/description/updatedAt)
  - Loading indicator shown during fetch; cleared after success
  - Empty state UI if API returns empty array
- Priority: High | Type: Functional/Data

TC-004: Data refresh/update timestamp
- Area: DemoFeatureDisplay
- Steps:
  1) Trigger any provided refresh mechanism (button or auto-refresh)
  2) Observe updatedAt changes if backend provides newer data
- Expected:
  - Refetch occurs; UI updates without duplicate items or flicker
  - No stale data after refresh
- Priority: Medium | Type: Functional

TC-005: Handle API error on data fetch
- Area: DemoFeatureDisplay error state
- Steps:
  1) Simulate network offline or mock 500 via devtools
  2) Reload or trigger fetch
- Expected:
  - User-friendly error message displayed
  - No crash; retry affordance present if designed
  - Console has no unhandled promise rejections
- Priority: High | Type: Error Handling

TC-006: InteractiveButton toggles state
- Area: InteractiveButton
- Steps:
  1) Click the button once and observe state change (label/color)
  2) Click again to toggle back
- Expected:
  - Visual and/or textual state reflects current status
  - Accessibility: button has role=button, focus outline visible, Enter/Space activates
- Priority: Medium | Type: Functional/Accessibility

TC-007: InputForm validation (client-side)
- Area: InputForm
- Steps:
  1) Submit with all fields empty
  2) Submit with invalid email
  3) Submit with overly long name/message
- Expected:
  - Inline validation messages for each invalid field
  - Submit disabled or rejected until valid
  - No console errors
- Priority: High | Type: Functional/Validation

TC-008: InputForm successful submit
- Area: InputForm, POST /api/user-action
- Steps:
  1) Fill valid Name, Email, Message
  2) Submit
  3) Inspect POST request/response in Network tab
- Expected:
  - POST request body includes correct payload
  - Response 2xx; success UI state (toast/message/reset)
  - Submit button shows loading state during request
- Priority: High | Type: Functional/API

TC-009: InputForm server-side validation error
- Area: InputForm, POST /api/user-action
- Steps:
  1) Trigger backend validation error (e.g., known invalid payload or force 400 via devtools)
- Expected:
  - Clear error message shown; field-level if provided
  - Form remains editable; submit re-enabled
- Priority: High | Type: Error Handling/API

TC-010: Keyboard navigation and focus management
- Area: Global Accessibility
- Steps:
  1) Use Tab/Shift+Tab to navigate interactive elements
  2) Activate controls with Enter/Space
- Expected:
  - Logical tab order; visible focus
  - No keyboard traps
- Priority: Medium | Type: Accessibility

TC-011: Responsive layout (tablet/mobile)
- Area: Responsive UI
- Steps:
  1) Resize viewport to mobile/tablet sizes
  2) Interact with nav, buttons, form
- Expected:
  - Layout adapts without overflow or clipped text
  - Touch targets adequate (>=44px)
- Priority: High | Type: UI/Responsive

TC-012: Dark mode (if supported)
- Area: Theming
- Steps:
  1) Toggle OS/browser dark mode or in-app theme switch
- Expected:
  - Text has sufficient contrast; icons visible
  - No illegible elements
- Priority: Low | Type: UI

TC-013: Performance observation on slow network
- Area: Performance
- Steps:
  1) Throttle to Slow 3G
  2) Reload app; time initial content
- Expected:
  - App remains usable; progress indicators visible
  - No long main-thread blocks (>2s continuous)
- Priority: Medium | Type: Performance

TC-014: Console cleanliness
- Area: Quality
- Steps:
  1) Use the app through main flows
  2) Monitor console
- Expected:
  - No errors; warnings minimized and actionable
- Priority: High | Type: Quality

TC-015: Security basics (client-side)
- Area: Security
- Steps:
  1) Enter <script>alert(1)</script> into fields
  2) Observe display and network payload
- Expected:
  - Content is escaped/sanitized in UI
  - No script execution; payload treated as text
- Priority: High | Type: Security

8. Non-Functional Checks
- Accessibility: basic keyboard support and focus management verified
- Performance: subjective load responsiveness and loading indicators
- Reliability: recover gracefully from transient network errors

9. Defect Reporting
- Severity levels:
  - Critical: Crash/data loss/security risk; blocks testing
  - Major: Core feature broken; no reasonable workaround
  - Minor: Non-blocking functional/UI issue with workaround
  - Cosmetic: Visual/polish issue; no functional impact
- Report fields:
  - Title, Environment, Steps to Reproduce, Expected, Actual, Severity, Screenshots/Logs, Affected Browser/Device, Build/Commit

10. Acceptance Criteria Mapping
- Features functional as designed: TC-001,002,003,006,008 pass
- Data accurate and up-to-date: TC-003,004 pass; confirm API parity
- Interactions smooth and error-free: TC-002,006,007,008 pass without regressions
- Efficient load and stability: TC-001,013,014 pass
- Bugs documented with repro and severity: All defects logged per Defect Reporting

11. Execution Notes
- Execute in priority order: High, then Medium, then Low
- Capture screenshots and HAR files for failures
- Re-test failures after fixes; record results
