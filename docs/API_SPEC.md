# FleetPulse RESTful API Specification

## Base URL: `/api/v1`

### Vehicles Endpoint
- `GET /api/v1/vehicles`: Query fleet inventory with filtering.
- `POST /api/v1/vehicles`: Register new fleet asset.

### Maintenance Endpoint
- `GET /api/v1/maintenance`: Retrieve service records.
- `POST /api/v1/maintenance`: Log completed maintenance with parts.

### Repairs Endpoint
- `GET /api/v1/repairs`: Active breakdown tickets.
- `POST /api/v1/repairs`: Report new mechanical issue.

### Documents Endpoint
- `GET /api/v1/documents`: Compliance certificates and countdowns.
- `POST /api/v1/documents`: Upload verified PDF certificate.
