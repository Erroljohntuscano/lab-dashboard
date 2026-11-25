# Event Registration Dashboard

A dashboard showing registration, check-in, payment, and revenue metrics.
React (Vite) frontend + Express API. Data is synthetic (lab use only).

## Run locally
1. `cd server && npm install && npm start`   → API on http://localhost:4000
2. `cd client && npm install && npm run dev` → App on http://localhost:5173

## API
`GET /api/reports/summary` returns aggregated data (not raw rows).
Test flags: `?simulate=empty`, `?simulate=error`, `?simulate=slow`.

## Metrics
| Metric | Meaning | Formula |
|---|---|---|
| Total registrations | All sign-ups in the range | count of records |
| Checked in | People who showed up | count where checkedIn = true |
| Check-in rate | Share who showed up | checkedIn ÷ total × 100 |
| Paid / Pending / Waived | Payment status counts | count by status (they add up to total) |
| Revenue | Money collected | paid × ₱300 (waived and pending earn ₱0) |

## Chart
**Registrations by day** supports the decision: which days need more
desk staff and when to send reminders. A table version is available for
screen readers.

## UI states
Loading (skeleton), Error (message + retry), Empty (friendly message),
Ready (KPIs + chart). Also shows data range and last-updated time.

## Accessibility
Responsive grid, high-contrast colors, text labels on every number,
chart has an aria-label and a table alternative, visible keyboard focus.