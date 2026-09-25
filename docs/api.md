# API Endpoint Reference

## Control Plane & Simulations
- `POST /api/simulations` - Enqueue new simulation run
- `GET /api/simulations` - List past and active simulations
- `GET /api/simulations/:id` - Get simulation details
- `POST /api/simulations/:id/cancel` - Cancel running simulation
- `GET /api/simulations/:id/metrics` - Historical timeseries metrics
- `GET /api/simulations/:id/events` - Simulation event logs
- `WS /api/simulations/:id/stream` - Live WebSocket metric stream

## Chaos Lab
- `GET /api/chaos` - Current chaos configuration
- `POST /api/chaos/config` - Update latency/error/cache chaos settings
- `POST /api/chaos/reset` - Reset chaos parameters

## SaaS Workloads
- **ERP:** `/api/erp/students/:id`, `/api/erp/students/:id/attendance`, `/api/erp/students/:id/marks`, `/api/erp/students/:id/timetable`, `/api/erp/students/:id/fees`, `/api/erp/notifications`
- **CRM:** `/api/crm/customers`, `/api/crm/customers/:id`, `/api/crm/leads`, `/api/crm/opportunities`, `/api/crm/reports`
- **E-Commerce:** `/api/ecommerce/products`, `/api/ecommerce/products/search`, `/api/ecommerce/cart`, `/api/ecommerce/checkout`, `/api/ecommerce/orders`
