# Feature: Vehicle Expenses, Insurance Policies & Inspections

## Overview

Add three new data domains to Garagely, all nested under a specific vehicle:

- **Vehicle Expenses** — track fuel, parking, repair, toll, car wash, and other costs with optional receipt photos
- **Insurance Policies** — store policy details, renewal dates, coverage info, and attached documents
- **Vehicle Inspections** — record inspection history, pass/fail status, costs, next due dates, and attached documents

---

## Architecture

- **Expenses**: single `vehicle_expenses` Firestore collection with a `type` discriminator + flexible `metadata` map for type-specific fields
- **Insurance / Inspection**: separate dedicated collections (`vehicle_insurance_policies`, `vehicle_inspections`)
- **Sub-routers**: expense/insurance/inspection routers are mounted inside `vehicle.routes.ts` using `Router({ mergeParams: true })` — no changes to `app.ts`
- **Receipts/Documents**: reuse existing `StorageService.uploadAndLinkDocument()` and `deleteDocumentsByEntity()`
- **Mobile state**: screens call `sdk` directly with local `useState` — no new Zustand slices

---

## Phase 1 — packages/shared

### Modify

**`packages/shared/src/models/entity-type/entity-type.model.ts`**
Add three new enum values:
```typescript
EXPENSE_RECEIPT = "expense_receipt",
INSURANCE_DOCUMENT = "insurance_document",
INSPECTION_DOCUMENT = "inspection_document",
```

### New Models

**`packages/shared/src/models/vehicle-expense/expense-type.model.ts`**
```typescript
export enum ExpenseType {
  FUEL = "fuel",
  PARKING = "parking",
  REPAIR = "repair",
  TOLL = "toll",
  CAR_WASH = "car_wash",
  OTHER = "other",
}
```

**`packages/shared/src/models/vehicle-expense/vehicle-expense.model.ts`**
Fields: `id`, `vehicleId`, `userId`, `type` (ExpenseType), `amount`, `currency`, `date` (firestoreDate), `odometer?`, `notes?`, `metadata` (Record<string,unknown>|null), `receiptDocumentId` (string|null), `createdAt`, `updatedAt`

**`packages/shared/src/models/vehicle-insurance/vehicle-insurance-policy.model.ts`**
Fields: `id`, `vehicleId`, `userId`, `provider`, `policyNumber`, `startDate`, `endDate` (next renewal), `premium`, `currency`, `coverageType`, `isActive`, `notes?`, `documentId` (string|null), `createdAt`, `updatedAt`

**`packages/shared/src/models/vehicle-inspection/vehicle-inspection.model.ts`**
Fields: `id`, `vehicleId`, `userId`, `inspectionDate`, `nextInspectionDate?`, `passed` (boolean), `cost`, `currency`, `inspector?`, `location?`, `notes?`, `documentId` (string|null), `createdAt`, `updatedAt`

Each model folder has an `index.ts` re-exporting its contents.

### New Payloads

Each folder contains `create-*.payload.ts`, `update-*.payload.ts` (all fields optional), and `index.ts`.

**`packages/shared/src/payloads/expense/`**
- Create: `type`, `amount`, `currency`, `date` required; `odometer`, `notes`, `metadata` optional
- Update: all optional

**`packages/shared/src/payloads/insurance/`**
- Create: `provider`, `policyNumber`, `startDate`, `endDate`, `premium`, `currency`, `coverageType`, `isActive` required; `notes` optional
- Update: all optional

**`packages/shared/src/payloads/inspection/`**
- Create: `inspectionDate`, `passed`, `cost`, `currency` required; `nextInspectionDate`, `inspector`, `location`, `notes` optional
- Update: all optional

---

## Phase 2 — apps/backend

### Modify

**`apps/backend/src/modules/storage/config/storage.config.ts`**
Add to `defaultLimits` (required — `Record<EntityType, StorageLimits>` exhaustiveness check):
```typescript
[EntityType.EXPENSE_RECEIPT]:    { fileSize: 10 * MB, files: 1 },
[EntityType.INSURANCE_DOCUMENT]: { fileSize: 20 * MB, files: 1 },
[EntityType.INSPECTION_DOCUMENT]:{ fileSize: 20 * MB, files: 1 },
```

### New Module: `modules/expense/`

**Repository interface** (`IExpenseRepository`):
- `findById(id)` → `VehicleExpenseModel | null`
- `findByVehicleId(vehicleId, { page, limit, type? })` → `{ items, total }`
- `create(userId, vehicleId, data)` → `VehicleExpenseModel`
- `update(id, data)` → `VehicleExpenseModel`
- `updateReceiptDocumentId(id, receiptDocumentId | null)` → `void`
- `delete(id)` → `void`

**Repository**: collection `vehicle_expenses`, ordered by `date desc`, offset pagination

**Service** (constructor: `IExpenseRepository`, `IVehicleRepository`, `StorageService`):
- All methods verify vehicle ownership: `vehicle.userId === userId`
- `deleteExpense`: clean up receipt via `storageService.deleteDocumentsByEntity` before deleting record
- `uploadReceipt`: delete existing → upload new → call `updateReceiptDocumentId`
- `deleteReceipt`: delete from storage → set `receiptDocumentId = null`

**Routes** (`Router({ mergeParams: true })`):
```
GET    /               → getExpenses       (query: ?type=FUEL&page=1&limit=20)
POST   /               → validatePayload → createExpense
GET    /:id            → getExpenseById
PATCH  /:id            → validatePayload → updateExpense
DELETE /:id            → deleteExpense
POST   /:id/receipt    → upload.single("file") → uploadReceipt
GET    /:id/receipt    → getReceipt
DELETE /:id/receipt    → deleteReceipt
```

Response: `sendPaginated` for list, `sendSuccess` for all others.

### New Module: `modules/insurance/`

**Repository interface** (`IInsuranceRepository`):
- `findById`, `findByVehicleId` (returns full array — low volume), `create`, `update`, `updateDocumentId`, `delete`

**Repository**: collection `vehicle_insurance_policies`, ordered by `startDate desc`

**Service**: `getPolicies`, `getPolicyById`, `createPolicy`, `updatePolicy`, `deletePolicy` (cleans up document), `uploadDocument`, `deleteDocument`

**Routes** (`Router({ mergeParams: true })`):
```
GET    /               → getPolicies
POST   /               → validatePayload → createPolicy
GET    /:id            → getPolicyById
PATCH  /:id            → validatePayload → updatePolicy
DELETE /:id            → deletePolicy
POST   /:id/document   → upload.single("file") → uploadDocument
DELETE /:id/document   → deleteDocument
```

### New Module: `modules/inspection/`

Identical structure to insurance.

**Repository**: collection `vehicle_inspections`, ordered by `inspectionDate desc`

**Service**: `getInspections`, `getInspectionById`, `createInspection`, `updateInspection`, `deleteInspection`, `uploadDocument`, `deleteDocument`

**Routes** (`Router({ mergeParams: true })`):
```
GET    /               → getInspections
POST   /               → validatePayload → createInspection
GET    /:id            → getInspectionById
PATCH  /:id            → validatePayload → updateInspection
DELETE /:id            → deleteInspection
POST   /:id/document   → upload.single("file") → uploadDocument
DELETE /:id/document   → deleteDocument
```

### Modify

**`apps/backend/src/modules/vehicle/routes/vehicle.routes.ts`**
Mount sub-routers at the bottom, before export:
```typescript
router.use("/:vehicleId/expenses",    expenseRouter);
router.use("/:vehicleId/insurance",   insuranceRouter);
router.use("/:vehicleId/inspections", inspectionRouter);
```
> `/:vehicleId/expenses` (2 segments) does not conflict with existing `/:id` (1 segment).
> `mergeParams: true` on sub-routers is required for `req.params.vehicleId` to be accessible in controllers.

---

## Phase 3 — packages/api-sdk

### New Modules

**`modules/expense/expense.api.ts`** — `ExpenseApi` interface + `createExpenseApi` factory:
```typescript
getExpenses(vehicleId, query?: { type?: ExpenseType; page?: number; limit?: number }, callbacks?, key?)
getExpenseById(vehicleId, expenseId, callbacks?, key?)
createExpense(vehicleId, payload: CreateVehicleExpensePayload, callbacks?, key?)
updateExpense(vehicleId, expenseId, payload: UpdateVehicleExpensePayload, callbacks?, key?)
deleteExpense(vehicleId, expenseId, callbacks?, key?)
uploadReceipt(vehicleId, expenseId, file: File | Blob, callbacks?, key?)
getReceipt(vehicleId, expenseId, callbacks?, key?)
deleteReceipt(vehicleId, expenseId, callbacks?, key?)
```

**`modules/insurance/insurance.api.ts`** — `InsuranceApi` + `createInsuranceApi`:
```typescript
getPolicies(vehicleId, callbacks?, key?)
getPolicyById(vehicleId, policyId, callbacks?, key?)
createPolicy(vehicleId, payload: CreateVehicleInsurancePolicyPayload, callbacks?, key?)
updatePolicy(vehicleId, policyId, payload: UpdateVehicleInsurancePolicyPayload, callbacks?, key?)
deletePolicy(vehicleId, policyId, callbacks?, key?)
uploadDocument(vehicleId, policyId, file: File | Blob, callbacks?, key?)
deleteDocument(vehicleId, policyId, callbacks?, key?)
```

**`modules/inspection/inspection.api.ts`** — `InspectionApi` + `createInspectionApi`:
Same shape as insurance with inspection-specific payload/model types.

### Modify

**`packages/api-sdk/src/index.ts`**
- Add `expense: ExpenseApi`, `insurance: InsuranceApi`, `inspection: InspectionApi` to `GaragelySdk`
- Initialize in `createSdk`
- Add type exports

---

## Phase 4 — apps/mobile

### State Pattern

No new Zustand slices. Screens call `sdk` directly (from `stores/sdk.ts`) and manage state with local `useState`.

```typescript
import { sdk } from "@/stores/sdk";

const [expenses, setExpenses] = useState<VehicleExpenseModel[]>([]);
const [isLoading, setIsLoading] = useState(false);

useEffect(() => {
  const { request, cancel } = sdk.expense.getExpenses(
    vehicleId,
    { type: ExpenseType.FUEL },
    { onSuccess: (data) => setExpenses(data.data), onError: (e) => setError(e.message) },
    "fuel-expenses",
  );
  request.finally(() => setIsLoading(false));
  return () => cancel();
}, [vehicleId]);
```

### New Screens (`app/vehicles/[vehicleId]/`)

**`_layout.tsx`** — Stack navigator (same pattern as `app/vehicles/_layout.tsx`)

**Expenses:**
- `expenses/index.tsx` — list all expenses, filter by type, FAB to add, delete with confirmation
- `expenses/add.tsx` — form: type picker, amount, currency, date picker, odometer?, notes?, type-specific metadata section (FUEL: liters + price-per-liter; REPAIR: workshop + description; etc.), optional receipt photo
- `expenses/[expenseId].tsx` — detail/edit with receipt preview and delete

**Insurance:**
- `insurance/index.tsx` — list all policies with renewal date badges, active/expired status
- `insurance/add.tsx` — form: provider, policyNumber, startDate, endDate, premium, currency, coverageType, isActive toggle, document upload
- `insurance/[policyId].tsx` — detail/edit with document section

**Inspections:**
- `inspections/index.tsx` — list all inspections with pass/fail badge, overdue warning if `nextInspectionDate` is past
- `inspections/add.tsx` — form: inspectionDate, nextInspectionDate?, passed toggle, cost, currency, inspector?, location?, notes?, document upload
- `inspections/[inspectionId].tsx` — detail/edit with document section

---

## Design Notes

### `receiptDocumentId` / `documentId` denormalization
These fields on each model store the document ID directly, avoiding a `document_relations` collection query on every read. They must stay in sync: set when uploading, cleared to `null` when deleting.

### Expense `metadata` flexibility
The `metadata` field is `Record<string, unknown> | null`. Type-specific sub-fields (e.g. `liters`, `pricePerLiter` for FUEL) are stored as-is with no backend validation. Mobile forms handle type-specific UI sections. This keeps the API generic and allows adding new expense types without schema migrations.

### Vehicle ownership verification
Every service method calls `vehicleRepository.findById(vehicleId)` and verifies `vehicle.userId === userId` before any operation. `IVehicleRepository` is injected into all three new services.

### Deletion cascade
When a vehicle is deleted, linked expense/insurance/inspection records are **not** automatically cascade-deleted. Orphaned records are inaccessible via the API due to ownership checks. Acceptable tech debt — can be resolved via a Firestore Cloud Function trigger later.

### Expense pagination
Expenses use `sendPaginated` (vehicles can accumulate hundreds of records over years). Insurance and inspections return a full array (low volume per vehicle).

---

## Firestore Collections

| Collection | Key Fields |
|---|---|
| `vehicle_expenses` | vehicleId, userId, type, amount, currency, date, odometer, notes, metadata, receiptDocumentId |
| `vehicle_insurance_policies` | vehicleId, userId, provider, policyNumber, startDate, endDate, premium, coverageType, isActive, documentId |
| `vehicle_inspections` | vehicleId, userId, inspectionDate, nextInspectionDate, passed, cost, inspector, location, documentId |

---

## Files Summary

### New files (47 total)

**packages/shared (16):**
- `models/vehicle-expense/` × 3 (expense-type, vehicle-expense, index)
- `models/vehicle-insurance/` × 2 (model, index)
- `models/vehicle-inspection/` × 2 (model, index)
- `payloads/expense/` × 3 (create, update, index)
- `payloads/insurance/` × 3 (create, update, index)
- `payloads/inspection/` × 3 (create, update, index)

**apps/backend (18):**
- `modules/expense/` × 6 (repo interface, repo, service, controller, routes, index)
- `modules/insurance/` × 6
- `modules/inspection/` × 6

**packages/api-sdk (6):**
- `modules/expense/` × 2 (api, index)
- `modules/insurance/` × 2
- `modules/inspection/` × 2

**apps/mobile (10):**
- `app/vehicles/[vehicleId]/_layout.tsx`
- `app/vehicles/[vehicleId]/expenses/` × 3 (index, add, [expenseId])
- `app/vehicles/[vehicleId]/insurance/` × 3 (index, add, [policyId])
- `app/vehicles/[vehicleId]/inspections/` × 3 (index, add, [inspectionId])

### Modified files (4)

- `packages/shared/src/models/entity-type/entity-type.model.ts` — add 3 enum values
- `apps/backend/src/modules/storage/config/storage.config.ts` — add 3 entity type limits
- `apps/backend/src/modules/vehicle/routes/vehicle.routes.ts` — mount 3 sub-routers
- `packages/api-sdk/src/index.ts` — add 3 SDK modules

---

## Verification

```bash
# Type-check all workspaces
npm run check-types

# Build all packages
npm run build

# Lint
npm run lint
```

Manual API tests (with Firebase emulators running):
- `POST /vehicles/:id/expenses` → 201 with expense object
- `GET /vehicles/:id/expenses?type=FUEL&page=1&limit=20` → paginated list
- `POST /vehicles/:id/expenses/:eid/receipt` (multipart) → 201 with document
- `GET /vehicles/:id/insurance` → empty array `[]`
- `POST /vehicles/:id/insurance` → 201 with policy object
- `POST /vehicles/:id/inspections` → 201 with inspection object
- `DELETE /vehicles/:id` → subsequent GET on expenses/insurance/inspections returns 404 (ownership check fails)
