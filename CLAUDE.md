# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm start                 # Start Expo dev server (clears cache)
npm run lint              # ESLint via Expo preset
npm run build:android     # EAS local Android APK build (development profile)
npm run migration:generate  # Generate TypeORM database migrations
```

No test suite is configured. Always run `npx tsc --noEmit` after changes to verify zero TypeScript errors.

---

## Architecture Overview

**Garagely** is a local-first React Native / Expo app for vehicle garage management. All data lives in a local SQLite database — there is no remote backend.

### Key Stack

| Layer          | Technology                                      |
| -------------- | ----------------------------------------------- |
| Routing        | Expo Router (file-based, `app/` directory)      |
| State          | Zustand 5 (`stores/`)                           |
| Database       | TypeORM + `expo-sqlite` (`db/`)                 |
| Forms          | Formik + Yup                                    |
| Styling        | `react-native-unistyles` 3.x (`theme/`)         |
| i18n           | i18next + react-i18next (`i18n/`)               |
| Bottom sheets  | `react-native-actions-sheet`                    |
| Icons          | `lucide-react-native` (individual icon imports) |
| Image picker   | `expo-image-picker`                             |
| Image viewer   | `react-native-gallery-preview`                  |
| PDF viewer     | `react-native-pdf` + `react-native-blob-util`   |
| File system    | `expo-file-system` (new API: `File`, `Directory`, `Paths`) |
| Gestures       | `react-native-gesture-handler` + `react-native-reanimated` |

### Data Flow

```
UI Component → Zustand Store → Service (TypeORM repo) → SQLite
```

**Rule:** Stores are the only way UI accesses or mutates data. Services are never called directly from components or screens.

---

## Navigation

File-based Expo Router. Root `app/index.tsx` redirects to `/garage`.

### Tab Layout (`app/(tabs)/_layout.tsx`)

Three tabs: **Showcase**, **Garage**, **Settings**.

### Screen Hierarchy

```
app/
├── index.tsx                          → redirects to /garage
├── _layout.tsx                        → GestureHandlerRootView + DatabaseProvider + Providers
└── (tabs)/
    ├── _layout.tsx                    → Tabs (Showcase | Garage | Settings)
    ├── showcase/index.tsx             → component showcase
    ├── settings.tsx                   → user preferences screen
    └── garage/
        ├── _layout.tsx                → Stack navigator (slide_from_bottom animation)
        ├── index.tsx                  → GarageScreen (vehicle list)
        ├── gallery/index.tsx          → GalleryScreen
        └── vehicle/
            ├── index.tsx              → vehicle list
            └── [id]/vehicle-form.tsx  → create / edit vehicle wizard
```

### AppHeader

`layouts/header/app-header.tsx` — used in all Stack screens.

```tsx
<AppHeader
  title="My Screen"
  icon="Car"              // optional Lucide icon name
  goBack={true}           // shows back arrow
  onGoBack={() => {}}     // optional override (e.g. folder nav instead of router.back)
  RightComponent={<.../>} // optional right-side JSX
  {...props}              // spread NativeStackHeaderProps
/>
```

---

## State Stores (`stores/`)

Pattern: `create<State & Actions>()((set, get) => ({ ... }))` — always combine state and actions in a single type.

### `useVehicleStore`

```
State:  vehicles[], activeVehicleId, isLoading
Actions: load, create, update, delete, setActiveVehicle, getActiveVehicle
```

### `useUserPreferencesStore`

```
State:  theme, language, distanceUnit, currency, volumeUnit, isLoaded
Actions: load, setTheme, setLanguage, setDistanceUnit, setCurrency, setVolumeUnit
```

Side effects: `setTheme` calls `UnistylesRuntime.setTheme()`; `setLanguage` calls `LocalizationService.changeLanguage()`. Both persist to SQLite via `UserPreferencesService`.

### `useGalleryStore`

```
State:
  assetsById: Record<string, AssetEntity>   // normalized, O(1) lookup
  orderedIds: string[]                       // pagination order
  recentIds:  string[]                       // last 10 uploads
  page, hasMore, isLoading, isLoadingMore
  currentFolderId: string | null             // null = root
  folderPath: MediaFolderEntity[]            // breadcrumb [root → current]
  subFolders: MediaFolderEntity[]            // current level's children
  activeTypeFilter: "all" | "media" | "documents"
  isSelecting: boolean
  selectedIds: Set<string>

Actions (folder navigation):
  navigateToFolder(folderId)  → loads assets + subFolders + folderPath atomically
  navigateBack()              → goes to parent folder

Actions (folder CRUD):
  createFolder(name)
  renameFolder(id, name)
  moveFolder(folderId, targetParentId)
  deleteFolderWithWarning(id) → returns CascadeStats (for Alert)
  deleteFolder(id)            → cascade deletes files + DB records

Actions (asset):
  uploadImage(uri)   → uploads to currentFolderId automatically
  uploadVideo(uri)
  uploadDocument(uri)
  deleteAsset(id)
  deleteSelected()
  renameAsset(id, newBaseName)
  moveAsset(assetId, targetFolderId)
  loadInitial()  → pruneOrphanedAssets + load page 1 + root folders
  loadMore()     → respects currentFolderId
```

---

## Database (`db/`)

`db/db.ts` — single `DataSource`, `synchronize: true`, no manual migrations needed in dev.

```ts
entities: [UserPreferences, Vehicle, AssetEntity, MediaFolderEntity, ImageMetadataEntity]
```

`DatabaseProvider` (`db/hooks/database-provider.tsx`) initializes the connection and loads `UserPreferences` before the app renders. Returns `null` until init completes.

### Base Entity (`db/entity/base.entity.ts`)

```ts
abstract class BaseEntity {
  id: string        // @PrimaryGeneratedColumn("uuid")
  createdAt: Date   // @CreateDateColumn()
  updateAt: Date    // @UpdateDateColumn()
}
```

---

## Feature Modules (`features/`)

DDD-inspired structure. Each feature owns: entity, errors, service, types, (optionally) screens + components.

### `features/vehicle`

**Entity:** `Vehicle` — brand, model, year, plate (unique), color (hex), transmissionType, bodyType, fuelType, purchase (Money embedded), purchaseDate.

**Service:** `VehicleService` — `getAll`, `getById`, `create(dto)`, `update(id, dto)`, `delete(id)`.

**Screen:** `VehicleFormScreen` — Formik wizard with `createVehicleFormSchema(t)`. Each step uses `useFormikContext<VehicleFormState>()`.

### `features/asset`

#### Entities

**`AssetEntity`** (`assets` table):
```
type, mimeType, baseName, fullName, extension
basePath, fullPath, sizeBytes
folderId (nullable FK → media_folders)
imageMetadata (OneToOne → ImageMetadataEntity, lazy)
```

**`MediaFolderEntity`** (`media_folders` table):
```
name
parentId (nullable self-ref FK — tree structure, ON DELETE CASCADE)
parent, children (self-referential relations)
assets (OneToMany → AssetEntity)
```

**`ImageMetadataEntity`** (`image_metadata` table):
```
assetId (PK + FK → assets)
width, height (nullable integers)
```

**`AssetCategoryEntity`** (`asset_categories` table) — **DEPRECATED**, kept only as stub to avoid TS errors during migration. Will be fully deleted.

#### Services

**`AssetService`:**
- `uploadImageAsset(uri, { folderId? })` / `uploadVideoAsset` / `uploadDocumentAsset`
- `getAll(limit, offset)` — all assets paginated
- `getByFolder(folderId | null, limit, offset)` — folder-scoped
- `getRecent(limit)`, `getById(id)`, `moveAsset(id, folderId)`
- `rename(id, newBaseName)` — renames physical file + DB record; rollback on DB failure
- `deleteById(id)` — deletes physical file + ImageMetadata + DB record
- `pruneOrphanedAssets()` — bidirectional cleanup on app start (DB record without file → delete record; file without DB record → delete file)

**`MediaFolderService`:**
- `getRootFolders()`, `getChildren(parentId)`, `getFolderPath(folderId)` → breadcrumb array
- `create(dto)`, `rename(id, dto)` — validates name, checks sibling name conflicts
- `moveFolder(folderId, newParentId)` — circular reference guard (prevents moving into own subtree)
- `getCascadeStats(folderId)` → `{ folderCount, assetCount }` for Alert warning
- `deleteCascade(folderId)` — deletes physical files, image_metadata, assets, then folder (DB ON DELETE CASCADE handles subtree)
- `collectDescendantIds(parentId)` — recursive subtree ID collection

#### Storage (`features/asset/storage/expo-fs-storage.ts`)

`ExpoFileSystemStorage` — all file I/O goes through this class. Never use `expo-file-system` directly elsewhere.

```
Paths.document/storage/  → permanent storage (persists across app reinstalls on Android!)
Paths.cache/storage/      → temp storage (OS may clean)
```

**Upload flow:**
1. `uploadFileToTemp(uri)` → copy to temp dir, return `StorageAsset`
2. `commitFile(tempAsset, finalAssetId)` → move to permanent dir named `{uuid}.{ext}`
3. On failure: `deleteFile(tempAsset)` cleans up temp

**Other methods:** `renameFile`, `deleteFile`, `getFile`, `isFileExists`, `getFinalStorageDir` (used by pruneOrphanedAssets).

**⚠️ Android warning:** `Paths.document` maps to external app storage which **persists across reinstalls**. `pruneOrphanedAssets()` must be called on startup to clean orphaned files.

#### Error Codes

```ts
// AssetErrors
FILE_NOT_FOUND_ERROR, MAX_FILE_SIZE_EXCEEDED, NOT_SUPPORTED_MIME_TYPE,
INVALID_NAME, NAME_TOO_LONG, NAME_ALREADY_EXISTS

// MediaFolderErrors
FOLDER_NOT_FOUND, CIRCULAR_REFERENCE, NAME_ALREADY_EXISTS (folder),
INVALID_FOLDER_NAME, FOLDER_NAME_TOO_LONG

// StorageErrors
FILE_NOT_FOUND_ERROR, UNKNOWN_MIME_TYPE_ERROR, STORAGE_WRITE_ERROR,
STORAGE_COMMIT_ERROR, STORAGE_DELETE_ERROR

// GlobalErrors
FORBIDDEN, UNAUTHORIZED, NETWORK_ERROR, UNKNOWN_ERROR
```

All errors extend `AppError` via `AppError.createAppError(errorCode, message?, details?)`. `AppErrorCode` is a union of all error types in `shared/errors/app-error.ts`. To add a new domain, add its error type to the union there.

**UI error handling:** `handleUIError(error)` from `utils/handle-ui-error.ts` — shows a Toast with the localized error message from the `errors` i18n namespace. Use in `.catch(handleUIError)` chains.

### `features/gallery`

**Screen:** `GalleryScreen` — the main gallery. Accessed via `app/(tabs)/garage/gallery/index.tsx`.

**Behavior by context:**
- **Root** (`folderPath.length === 0`): shows only folder grid. No type filter chips, no breadcrumb, no media/doc lists.
- **Inside folder**: shows breadcrumb + type filter chips + sub-folders + media grid + document list.

**Components:**

| Component | Purpose |
|---|---|
| `GalleryBreadcrumb` | Horizontal path: `Folder A › Sub Folder` — tappable ancestors |
| `GalleryFolderGrid` | `FlatList numColumns=3`, folder cards with long-press action sheet |
| `GalleryFolderNameModal` | Shared modal for create + rename folder; handles `NAME_ALREADY_EXISTS_FOLDER` |
| `GalleryFolderPickerModal` | Full-screen slide modal; navigable folder tree; "Move Here" bottom button |
| `GalleryMediaGrid` | Image/video grid, selection mode with overlay + checkmarks |
| `GalleryDocumentList` | PDF list with selection checkboxes |
| `GalleryRenameModal` | Asset rename (file name + extension suffix display) |
| `GallerySelectionBar` | Fixed bottom bar in selection mode (count + delete + cancel) |
| `GalleryFilterChips` | All / Media / Documents type filter (folder-only, hidden at root) |
| `GalleryEmpty` | Empty state with upload CTA |
| `GallerySelectionBar` | Fixed bottom bar: selected count, delete, cancel |

**Image preview:** `AppImageViewer` wraps `react-native-gallery-preview`. Requires `GestureHandlerRootView` at app root (already in `app/_layout.tsx`).

**PDF preview:** `AppPdfViewer` wraps `react-native-pdf`. Requires a native build (`expo-dev-client`) — does not work in Expo Go.

**Long-press action sheet pattern:**
```tsx
SheetManager.show("select-sheet", {
  payload: {
    sections: [{ data: [{ key, label, icon }] }],
    renderItem: ({ item }) => (
      <SelectItem label={item.label} onPress={() => { SheetManager.hide("select-sheet"); /* action */ }} />
    ),
  },
});
```

### `features/user-preferences`

`UserPreferences` entity stores theme, language, distanceUnit, currency, volumeUnit, activeVehicleId. `UserPreferencesService.getOrCreate()` always returns a record (creates default on first run).

---

## UI Components (`components/`)

**Never use raw React Native primitives for UI.** Always use the `App*` wrappers.

### `components/ui/`

| Component | Usage |
|---|---|
| `AppButton` | `variant`: `primary`, `secondary`, `outline`, `ghost`, `link`, `icon`. `size`: `sm`, `md`, `lg`, `icon`. Accepts `loading` prop. |
| `AppText` | Wraps `Text` with theme styles |
| `AppToggle` | Boolean toggle |
| `AppSegmented` | Segmented control |
| `AppBadge` | Label badge |
| `AppImageViewer` | Full-screen image gallery with swipe and zoom |
| `AppPdfViewer` | Full-screen PDF modal with page counter |
| `icon.tsx` | `<Icon name="FolderOpen" size={20} color={...} />` — type-safe Lucide wrapper |

### Input System (`components/ui/app-input/`)

Always compose inputs with the group system:

```tsx
<AppInputGroup error={!!error} size="md">
  <AppInputField value={value} onChangeText={setValue} autoFocus />
  <AppInputAddon position="right">
    <AppText>.jpg</AppText>
  </AppInputAddon>
</AppInputGroup>
```

- `AppInputGroup` — border, focus, error, disabled states via context
- `AppInputField` — the actual `TextInput`
- `AppInputAddon` — prefix/suffix decorations (`position="left"|"right"`)

### Field System (`components/ui/app-field/`)

Six composable sub-components for labeled form fields. Import each individually.

| Component | Description |
|---|---|
| `AppField` | Vertical flex container (`gap: xs`). Wraps label + input + error. |
| `AppFieldLabel` | `label` typography, `mutedForeground` color. |
| `AppFieldDescription` | `caption` typography, `mutedForeground`. Helper text below the input. |
| `AppFieldError` | `caption` typography, `destructive` color. Render only when error string is truthy. |
| `AppFieldSeperator` | 1px horizontal rule (`border` color). Has `.noPadding = true` so `AppFieldGroup` renders it edge-to-edge. |
| `AppFieldGroup` | Card container (rounded, bordered, `card` background). Accepts `label` and `description` string props for section header. Adds `paddingHorizontal` padding around each child automatically — unless the child has `.noPadding = true` (i.e. `AppFieldSeperator`). |

#### Standalone field (inside a form, not grouped)

```tsx
<AppField>
  <AppFieldLabel>{t("fields.brand")}</AppFieldLabel>
  <AppInputGroup>
    <AppInputField value={value} onChangeText={onChange} onBlur={onBlur} />
  </AppInputGroup>
  {error ? <AppFieldError>{error}</AppFieldError> : null}
</AppField>
```

#### Grouped fields (iOS Settings style)

```tsx
<AppFieldGroup label={t("sections.basicInfo")}>
  {/* Each child gets horizontal padding automatically */}
  <AppField>
    <AppFieldLabel>{t("fields.brand")}</AppFieldLabel>
    <AppInputGroup><AppInputField ... /></AppInputGroup>
    {errors.brand ? <AppFieldError>{errors.brand}</AppFieldError> : null}
  </AppField>
  <AppFieldSeperator />   {/* edge-to-edge divider — no extra padding */}
  <AppField>
    <AppFieldLabel>{t("fields.model")}</AppFieldLabel>
    <AppInputGroup><AppInputField ... /></AppInputGroup>
  </AppField>
</AppFieldGroup>
```

#### With description

```tsx
<AppField>
  <AppFieldLabel>API Key</AppFieldLabel>
  <AppInputGroup><AppInputField .../></AppInputGroup>
  <AppFieldDescription>Used for third-party integrations.</AppFieldDescription>
</AppField>
```

### Money Input Field (`components/money-input-field/money-input-field.tsx`)

Composite input for monetary values with inline currency picker.

```tsx
<MoneyInputField
  label={t("fields.purchaseAmount")}
  placeholder={t("placeholders.purchaseAmount")}
  value={values.purchaseAmount}          // string
  onMoneyChange={(money: number) => setFieldValue("purchaseAmount", money)}
  onBlur={handleBlur("purchaseAmount")}
  selectedCurrency={values.purchaseCurrency as CurrencyType}
  onCurrencyChange={(currency) => setFieldValue("purchaseCurrency", currency)}
  error={errors.purchaseAmount}          // optional
/>
```

Internally uses `AppField + AppFieldLabel + AppInputGroup + AppInputField + AppInputAddon + AppFieldError`. The currency badge on the right opens a bottom sheet via `useCurrencySheet`.

### List Components (`components/list/`)

```tsx
// Typical settings row
<AppListItem
  label="Distance Unit"
  icon="Ruler"
  iconColor={theme.colors.primary}
  selectedValue="km"
  chevron
  onPress={...}
/>

// Group with separator lines
<AppListGroup>
  <AppListItem ... first />
  <AppListItem ... last />
</AppListGroup>
```

Props: `label`, `icon` (Lucide name), `iconColor`, `sub` (subtitle), `selectedValue`, `trailing` (ReactNode), `chevron`, `destructive`, `first`, `last`.

---

## Styling with Unistyles

**Always** use `StyleSheet.create((theme) => ({ ... }))` from `react-native-unistyles`. Never hardcode colors or sizes.

```ts
import { StyleSheet, useUnistyles } from "react-native-unistyles";

const styles = StyleSheet.create((theme) => ({
  container: {
    backgroundColor: theme.colors.background,
    padding: theme.spacing.md,
    borderRadius: theme.radius.lg,
  },
  title: {
    ...theme.typography.heading3,
    color: theme.colors.foreground,
  },
}));

// In component:
const { theme } = useUnistyles();
```

### Theme Tokens

**Colors** (`theme.colors.*`) — light/dark aware:
```
primary, primaryForeground
secondary, secondaryForeground
background, foreground
card, cardForeground
muted, mutedForeground
destructive, destructiveForeground
border, input, ring
color.{red,orange,cyan,green,purple,rose}  // semantic palette
```

**Spacing** (`theme.spacing.*`):
```
xxs=2, xs=4, sm=8, md=16, lg=24, xl=32, xxl=48
```

**Radius** (`theme.radius.*`):
```
none=0, sm=4, md=8, lg=12, xl=16, xxl=20, full=9999
```

**Typography** (`theme.typography.*`):
```
display, heading1–6
bodyLarge, bodyMedium, bodySmall
rowLabel, rowValue, rowSub
label, helperText, caption, overline
buttonLarge, buttonMedium, buttonSmall
```

**Variants** (Unistyles feature — used in `AppButton`):
```ts
variants: {
  variant: { primary: { backgroundColor: theme.colors.primary }, ... },
  size:    { sm: { ... }, md: { ... } },
}
// Use with: stylesheet.useVariants({ variant, size })
```

---

## Forms

All forms use **Formik + Yup**.

### Validation Schema Pattern

```ts
// schema file
export const createVehicleFormSchema = (t: (key: string, opts?: any) => string) =>
  Yup.object({
    brand: Yup.string().required(t("errors.brand")),
    year:  Yup.number().min(1900, t("errors.yearMin", { min: 1900 })),
    // ...
  });

// in component
const { t } = useI18n("vehicle");
const schema = useMemo(() => createVehicleFormSchema(t), [t]);
```

### Wizard Pattern

Single top-level `<Formik>` wrapper; each step uses `useFormikContext<FormState>()`:

```tsx
// Root screen
<Formik initialValues={...} validationSchema={schema} onSubmit={handleSubmit}>
  <StepOne />   {/* useFormikContext() inside */}
</Formik>

// Step component
function StepOne() {
  const { values, errors, setFieldValue } = useFormikContext<VehicleFormState>();
  return <AppInputField value={values.brand} onChangeText={v => setFieldValue("brand", v)} />;
}
```

---

## i18n

### Structure

```
i18n/
├── locales/
│   ├── en/  common, components, currency, errors, gallery, garage,
│   │        languages, settings, theme, units, vehicle
│   └── tr/  (same files)
├── hooks/use-i18n.tsx        → useI18n(namespace) hook
├── types/namespace.ts        → TranslationNamespaces enum
└── localization.service.ts   → changeLanguage()
```

### Usage

```tsx
const { t } = useI18n("gallery");    // typed namespace
t("folders.allFiles")                // type-safe key access
t("folders.deleteConfirmMessage", { folderCount: 3, assetCount: 7 })
```

### Adding a New Namespace

1. Create `i18n/locales/en/{name}.json` and `tr/{name}.json`
2. Add to `TranslationNamespaces` in `i18n/types/namespace.ts`
3. Add to `LanguageResources` in `i18n/localization.service.ts`

### Error Translations

Error code keys live in `errors.json`. `handleUIError` looks up `error.errorCode` in the `errors` namespace. Add new error codes there when adding new `AppErrorCode` values.

---

## Error System

```ts
// Define
export const MyErrors = { THING_FAILED: "THING_FAILED" } as const;
export type MyError = (typeof MyErrors)[keyof typeof MyErrors];

// Register
// shared/errors/app-error.ts → AppErrorCode union: | MyError

// Throw
throw AppError.createAppError(MyErrors.THING_FAILED, undefined, { detail });

// Catch in UI
.catch(handleUIError)   // shows Toast with i18n message from errors namespace

// Catch manually
} catch (err) {
  if (err instanceof AppError && err.errorCode === MyErrors.THING_FAILED) { ... }
}
```

---

## Asset / File Upload Flow

Complete lifecycle:

```
1. User picks file (expo-image-picker / expo-document-picker)
2. AssetService.uploadImageAsset(uri, { folderId })
   a. Validate mime type + size
   b. ExpoFileSystemStorage.uploadFileToTemp(uri)  → temp copy
   c. DB transaction: insert AssetEntity (temp paths), get UUID
   d. ExpoFileSystemStorage.commitFile(tempAsset, uuid) → move to permanent
   e. Update AssetEntity with final paths
   f. Save ImageMetadataEntity (width × height) for images
   g. Commit transaction
3. On any error: deleteFile(tempFile) + rollbackTransaction
4. Store: prepend to orderedIds + recentIds
```

**Supported types:**
- Images: `ImageMimeTypes` enum values
- Videos: `VideoMimeTypes` enum values
- Documents: `DocumentMimeTypes` (currently `application/pdf`)

---

## MediaFolder System

Folder tree with unlimited depth. Assets belong to one folder (or none = root).

```
Root (currentFolderId = null)
├── Folder A
│   ├── Sub-folder A1
│   └── Sub-folder A2
│       └── Asset.jpg
└── Folder B
    └── Invoice.pdf
```

### Navigation Rules

- Root shows **only** folder grid (no asset lists, no filter chips, no breadcrumb)
- Inside a folder shows: breadcrumb + filter chips + sub-folders + media + docs
- Header back button calls `store.navigateBack()` when inside a folder

### Cascade Delete Warning

Always call `deleteFolderWithWarning(id)` first to get `{ folderCount, assetCount }`, show Alert, then call `deleteFolder(id)` on confirm.

### Circular Reference Protection

`MediaFolderService.moveFolder()` throws `CIRCULAR_REFERENCE` if moving a folder into its own subtree. Catch this specifically in the UI.

---

## Lucide Icons

Import individual icons, not the whole package:

```ts
// ✅ Correct
import { FolderPlus, Upload } from "lucide-react-native/icons";

// ❌ Wrong — bloats bundle
import * as Icons from "lucide-react-native";
```

Or use the `Icon` component for dynamic icon names:
```tsx
import Icon from "@/components/ui/icon";
<Icon name="FolderOpen" size={24} color={theme.colors.primary} />
```

---


## Deprecated / Pending Cleanup

These files are stubs kept temporarily to avoid TS errors. **Delete them** once all referencing code is updated:

- `features/asset/entity/asset-category.entity.ts` — replaced by `MediaFolderEntity`
- `features/asset/service/asset-category.service.ts` — replaced by `MediaFolderService`
- `features/asset/errors/asset-category.errors.ts` — replaced by `media-folder.errors.ts`
- `features/gallery/components/GalleryCategoryChips.tsx` — replaced by `GalleryBreadcrumb`
