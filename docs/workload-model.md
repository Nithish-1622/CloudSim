# SaaS Workload Models

CloudSim features three initial simulated SaaS workloads:

## 1. Student ERP
- **Profile:** High Read Ratio (85%), high cacheability.
- **Distribution:**
  - Login (30%)
  - Student Profile (20%)
  - Attendance (15%)
  - Marks (15%)
  - Timetable (10%)
  - Fees (5%)
  - Notifications (5%)

## 2. CRM Enterprise
- **Profile:** Balanced Read/Write operational mix.
- **Distribution:**
  - Login (25%)
  - List Customers (25%)
  - View Customer Detail (15%)
  - List Leads (15%)
  - Create Lead (10%)
  - View Opportunities (5%)
  - View Reports (5%)

## 3. E-Commerce Platform
- **Profile:** Read-heavy catalog search with high-intensity checkout writes.
- **Distribution:**
  - Search Catalog (25%)
  - List Products (25%)
  - View Product Detail (20%)
  - Add to Cart (15%)
  - Checkout (10%)
  - Order History (5%)
