# Expense (Gider) Feature — Implementation Plan

> Status: planning. UX paterni Station feature ile birebir uyumlu. Mimari kararları kullanıcıyla netleştirildi.

---

## ⚠️ Kritik Uyarılar — Implementation Sırasında Atlama!

Bunlar plan üzerinde anlaştığımız ve uygulanırken kolayca **kaçırılabilecek** noktalar. Her adımı yazmadan önce ilgili olanları gözden geçir.

### Mimari & Veri Bütünlüğü

1. **Type değişimi YASAK** — `update()` çağrısında `dto.type !== existing.type` ise `TYPE_IMMUTABLE` fırlat. UI'da da type alanı edit'te disabled. Aksi halde stale metadata kalır.
2. **Metadata tutarlılığı** — `Expense` insert + metadata insert + line items insert **tek transaction içinde**. Herhangi biri patlarsa rollback. Asla "önce expense'i kaydet, sonra metadata'yı dene" demeyin.
3. **`synchronize: true` ama production'da değil** — Yeni 8 entity + 2 common entity ekleniyor. Local DB sync otomatik; ama `db.ts` entities array'ine eklemeyi unutursan tablo yaratılmaz, runtime'da loud-fail eder.
4. **`vehicle_parts` / `vehicle_accessories` FK `RESTRICT`** — Kullanıcı kullanımdaki parçayı silmeye çalışırsa SQLite FK ihlali fırlatır. Servis bunu yakalayıp `PART_IN_USE`/`ACCESSORY_IN_USE` `AppError`'una çevirmek zorunda — ham hata UI'a sızmasın.
5. **Vehicle CASCADE** — Bir vehicle silindiğinde tüm expense'ler + metadata + line items + media join row'ları silinir. Bunu silme akışındaki Alert mesajında **kullanıcıya açıkça söyle** (Vehicle delete confirm Alert'ine "X gider de silinecek" notu ekle — `getCascadeStats(vehicleId)` benzeri helper). Sessiz veri kaybı olmasın.
6. **Station SET NULL** — Station silindiğinde expense'in `stationId`'si null'a düşer; expense kaybolmaz. Detail ekranında station alanını her zaman nullable render et.
7. **Money currency immutability after save** — Bir gider kaydedildikten sonra currency'si değişebilir mi? **Evet, edit'te değişebilir** (kullanıcı yanlış girdiyse düzeltsin). Ama liste/grup hesaplamalarında currency mismatch'e dikkat — toplam **almıyoruz**, currency'ye göre group by yapılırsa karşılaştırma hatası olmaz.

### Validation & Tip Eşleşmesi

8. **`FUEL_KIND_UNITS` invariant** — UI'da kind değişince unit otomatik resetlenmeli (örn. PETROL'den ELECTRIC'e geçince `fuelUnit` zorla `KWH`). Hem Yup hem servis validator hem UI side-effect — üçü de tutarlı olmalı.
9. **`pricePerUnit` auto-calc** — Sadece `quantity > 0 && pricePerUnit boş` ise hesapla. Kullanıcı manuel girdiyse override'ı koru. Aksi halde her keystroke'ta override ezilir.
10. **Line item zorunluluğu** — REPAIR ve ACCESSORY için `lineItems.length === 0` durumunda `*_REQUIRES_LINE_ITEM` hatası. Ama UI'da boş gönderilemesin diye Yup `min(1)` + form save button disabled state'i gerekir.
11. **Station type eşleşmesi** — Form'da `EXPENSE_TYPE_STATION_FILTER`'a göre filtrele, ama servis tarafında da `INVALID_STATION_FOR_TYPE` ile koru. Kullanıcı eski bir expense'in type'ını edit'lerken (yapamayacak ama yine de) tutarsız station kalmasın.

### State / UX

12. **`activeVehicleId` null durumu** — Hiçbir araç yokken expense liste/form ekranı açılırsa **boş state** + "önce araç ekle" CTA. `useExpenseStore.load()` `vehicleId` filtresi olmadan çağrılırsa tüm expense'leri çeker — istemediğimiz davranış. Mount guard'ı koy.
13. **Race-guard pattern** — Station store'daki `loadToken` mantığı **birebir** kopyala. Filter değişikliği + type-route reset üst üste binebilir; en son load kazanmalı. Atlanırsa stale data render edilir.
14. **`loadMore` dedupe** — Pagination cursor'ında `addOrderBy("e.id", "DESC")` stable tiebreaker ekle. `seenIds` Set ile dedupe; pagination sırasında insert/delete olursa duplicate render olmasın.
15. **Type-route reset double-load tuzağı** — `[type]/index.tsx` mount edildiğinde `resetFilters()` + `setFilters({ type, vehicleId })` peş peşe çağrıldığında iki load tetiklenir. `loadToken` ile sadece sonuncusu uygulanır — bu pattern'i Station'dan birebir kopyala.
16. **`useFocusEffect` reload** — Detail ekranından edit'e gidip dönüldüğünde `useFocusEffect(() => store.load())` ile listeyi tazele (Vehicle pattern). Aksi halde edit edilen item eski haliyle gözükür.

### Bileşen / API Geri Uyumluluğu

17. **`AppMediaGalleryField` `coverSlot` prop'u GERİ UYUMLU** — Default `true` olmalı. Aksi halde Station form'u kırılır. Patch'ten sonra Station form'unu manuel test et.
18. **`select-sheet` payload yapısı bozulmasın** — `VehiclePartPicker` ve `VehicleAccessoryPicker` mevcut sheet API'sini kullanır. Yeni bir sheet kayıt etmek **gerekmiyor** — sadece `payload.renderItem` ile özelleştir.
19. **i18n namespace registration** — Yeni 3 namespace'i `TranslationNamespaces` enum'una **VE** `LanguageResources`'a **VE** her iki dil dosyasına ekle. Üçünden biri unutulursa runtime'da silent fallback olur.
20. **`errors.json` eksik anahtar = silent UNKNOWN_ERROR** — `handleUIError` mesajı i18n'den çekiyor; eklenmemiş error code TR/EN için "UNKNOWN_ERROR" Toast'una düşer. Yeni error code eklerken her iki dile de mesaj eklemeyi unutma.

### Dosya Sistemi & Asset

21. **Media silinince fiziksel dosya?** — Expense silinince ManyToMany join row temizlenir; **AssetEntity ve fiziksel dosya temizlenmez** (asset gallery'de kalır). Bu **istenen davranış** (kullanıcı asset'i bilinçli yüklemiş olabilir). Aksi yön gerekirse ayrı feature olarak konuş.
22. **`pruneOrphanedAssets` etkilenir mi?** — Hayır; expense_media_assets join tablosu asset varlığını etkilemez, asset hala gallery'de duruyor.

### Performans

23. **Liste query'sinde N+1 tuzağı** — `query()`'de `leftJoinAndSelect` ile sadece görüntülenecek alanları çek (vehicle, station, ilk media item — line items ve metadata DETAIL'da yüklenir). Liste'de tüm metadata'yı joinleme; 100 expense × 5 metadata join = SQLite'ı yavaşlatır.
24. **`getById` tam yükleme** — Detail için `relations: ["vehicle", "station", "media", "fuelMeta", "repairMeta", "repairMeta.lineItems", "repairMeta.lineItems.part", "parkingMeta", "carWashMeta", "accessoryMeta", "accessoryMeta.lineItems", "accessoryMeta.lineItems.accessory"]`. Tek query, eager load.

### Test Edilmesi Şart Olan Senaryolar

25. **Tüm 5 type için create + edit + delete + liste + filter + sort** — 20 senaryo.
26. **Vehicle silme cascade** — Bir araca bağlı 5 type'tan en az birer expense yarat, vehicle'ı sil, hepsinin temizlendiğini doğrula.
27. **Station silme** — Bir station'a bağlı expense yarat, station'ı sil, expense'in `stationId`'si null'a düştü mü?
28. **VehiclePart silme `IN_USE`** — Repair expense'te kullanılan parça silinmeye çalışılınca `PART_IN_USE` Toast.
29. **Currency mismatch liste** — Aynı vehicle için iki farklı currency'de expense oluştur, liste tutarlı render ediyor mu?

---

## 0. Karar Özeti (Q&A)

| # | Karar |
|---|---|
| 1 | **Multi-table** (common + per-type metadata). `expense` ortak; `fuel_expense_metadata`, `repair_expense_metadata`, `parking_expense_metadata`, `car_wash_expense_metadata`, `accessory_expense_metadata`. Repair ve Accessory line-items ayrı tablolar. |
| 2 | Garage ana sayfasında **5 ayrı buton**, her tip kendi listesine gider. (Buttons mevcut.) |
| 3 | Vehicle **zorunlu**, daima `activeVehicleId`'e bağlı. Form vehicle picker göstermez — header subtitle olarak araç adı. |
| 4 | Station **opsiyonel**. Form'da type-aware station picker (yalnızca uygun `StationType`'lar listelenir). Station detail ekranında **"Bu istasyonda yapılan giderler"** bölümü eklenecek. |
| 5 | FuelKind → izin verilen unit map: `PETROL/DIESEL/LPG/CNG → L | GAL`, `ELECTRIC → KWH` (kilitli). Default unit = `userPreferences.volumeUnit`. |
| 6 | `odometer` her gider için **opsiyonel**. Birim user pref `distanceUnit`. |
| 7 | Yakıt seviyesi **çeyreklik enum** (`E | Q1 | Q2 | Q3 | F`). |
| 8 | `isFullTank` toggle FUEL'de var. |
| 9 | Repair için **line items** (her parça için: `vehiclePartId`, `quantity`, `unitPrice`, `note`). Parts ayrı common entity (`vehicle_parts`). |
| 10 | `parkingDurationMinutes` opsiyonel (saat + dakika dual input UI). |
| 11 | Accessory için **line items** + `vehicle_accessories` ayrı common entity. |
| 12 | Toplam göstermiyoruz — gerekirse currency'ye göre group by. |
| 13 | Default sort `occurredAt_desc`. |
| 14 | Hard delete. Vehicle silindiğinde `ON DELETE CASCADE` ile expense'ler silinir. |
| 15 | `AppMediaGalleryField` kullanılacak; cover yok, hepsi grid. |
| 16 | Bu sürümde dashboard yok, sadece CRUD + liste/detay. |

---

## 1. Veri Modeli

### 1.1 Ortak `expense` tablosu

```ts
@Entity("expenses")
class Expense extends BaseEntity {
  @Column() type: ExpenseType;                     // enum: FUEL | REPAIR_SERVICE | PARKING | CAR_WASH | ACCESSORY

  @ManyToOne(() => Vehicle, { onDelete: "CASCADE" })
  @JoinColumn() vehicle: Vehicle;
  @Column() vehicleId: string;

  @Column(() => Money) amount: Money;              // value: real, currency: text (Vehicle.purchase pattern)

  @Column("bigint") occurredAt: number;            // UTC ms

  @ManyToOne(() => Station, { nullable: true, onDelete: "SET NULL" })
  @JoinColumn() station: Station | null;
  @Column({ nullable: true }) stationId: string | null;

  @Column("text", { nullable: true }) note: string | null;
  @Column("integer", { nullable: true }) odometer: number | null;   // değer; birim pref'ten

  @ManyToMany(() => AssetEntity)
  @JoinTable({ name: "expense_media_assets" })
  media: AssetEntity[];

  // Type-specific metadata 1-1 (lazy):
  @OneToOne(() => FuelExpenseMetadata,    m => m.expense, { cascade: true })  fuelMeta?:    FuelExpenseMetadata;
  @OneToOne(() => RepairExpenseMetadata,  m => m.expense, { cascade: true })  repairMeta?:  RepairExpenseMetadata;
  @OneToOne(() => ParkingExpenseMetadata, m => m.expense, { cascade: true })  parkingMeta?: ParkingExpenseMetadata;
  @OneToOne(() => CarWashExpenseMetadata, m => m.expense, { cascade: true })  carWashMeta?: CarWashExpenseMetadata;
  @OneToOne(() => AccessoryExpenseMetadata,m => m.expense, { cascade: true }) accessoryMeta?: AccessoryExpenseMetadata;
}
```

### 1.2 `fuel_expense_metadata`

```ts
@Entity("fuel_expense_metadata")
class FuelExpenseMetadata {
  @PrimaryColumn() expenseId: string;
  @OneToOne(() => Expense, { onDelete: "CASCADE" })
  @JoinColumn({ name: "expenseId" }) expense: Expense;

  @Column() fuelKind: FuelKind;                    // PETROL | DIESEL | LPG | CNG | ELECTRIC
  @Column("real") fuelQuantity: number;
  @Column() fuelUnit: FuelUnit;                    // L | GAL | KWH
  @Column("real", { nullable: true }) pricePerUnit: number | null; // calc default; manuel override
  @Column({ nullable: true }) fuelLevelAfter: FuelLevel | null;    // E | Q1 | Q2 | Q3 | F
  @Column("boolean", { default: false }) isFullTank: boolean;
}
```

### 1.3 `repair_expense_metadata` + line items

```ts
@Entity("repair_expense_metadata")
class RepairExpenseMetadata {
  @PrimaryColumn() expenseId: string;
  @OneToOne(() => Expense, { onDelete: "CASCADE" })
  @JoinColumn({ name: "expenseId" }) expense: Expense;

  @OneToMany(() => RepairExpenseLineItem, li => li.repairMeta, { cascade: true })
  lineItems: RepairExpenseLineItem[];
}

@Entity("repair_expense_line_items")
class RepairExpenseLineItem {
  @PrimaryGeneratedColumn("uuid") id: string;

  @ManyToOne(() => RepairExpenseMetadata, m => m.lineItems, { onDelete: "CASCADE" })
  repairMeta: RepairExpenseMetadata;
  @Column() repairMetaId: string;

  @ManyToOne(() => VehiclePart, { onDelete: "RESTRICT" })
  part: VehiclePart;
  @Column() partId: string;

  @Column("integer", { default: 1 }) quantity: number;
  @Column("real", { nullable: true }) unitPrice: number | null;
  @Column("text", { nullable: true }) note: string | null;
}
```

### 1.4 `parking_expense_metadata`

```ts
@Entity("parking_expense_metadata")
class ParkingExpenseMetadata {
  @PrimaryColumn() expenseId: string;
  @OneToOne(() => Expense, { onDelete: "CASCADE" })
  @JoinColumn({ name: "expenseId" }) expense: Expense;

  @Column("integer", { nullable: true }) durationMinutes: number | null;
}
```

### 1.5 `car_wash_expense_metadata`

```ts
@Entity("car_wash_expense_metadata")
class CarWashExpenseMetadata {
  @PrimaryColumn() expenseId: string;
  @OneToOne(() => Expense, { onDelete: "CASCADE" })
  @JoinColumn({ name: "expenseId" }) expense: Expense;

  @Column() washType: WashType;     // EXTERIOR | INTERIOR | FULL | DETAILING
}
```

### 1.6 `accessory_expense_metadata` + line items

```ts
@Entity("accessory_expense_metadata")
class AccessoryExpenseMetadata {
  @PrimaryColumn() expenseId: string;
  @OneToOne(() => Expense, { onDelete: "CASCADE" })
  @JoinColumn({ name: "expenseId" }) expense: Expense;

  @OneToMany(() => AccessoryExpenseLineItem, li => li.accessoryMeta, { cascade: true })
  lineItems: AccessoryExpenseLineItem[];
}

@Entity("accessory_expense_line_items")
class AccessoryExpenseLineItem {
  @PrimaryGeneratedColumn("uuid") id: string;

  @ManyToOne(() => AccessoryExpenseMetadata, m => m.lineItems, { onDelete: "CASCADE" })
  accessoryMeta: AccessoryExpenseMetadata;
  @Column() accessoryMetaId: string;

  @ManyToOne(() => VehicleAccessory, { onDelete: "RESTRICT" })
  accessory: VehicleAccessory;
  @Column() accessoryId: string;

  @Column("integer", { default: 1 }) quantity: number;
  @Column("real", { nullable: true }) unitPrice: number | null;
  @Column("text", { nullable: true }) note: string | null;
}
```

### 1.7 Common entity'ler (yeni)

```ts
// features/common/vehicle-part/entity/vehicle-part.entity.ts
@Entity("vehicle_parts")
class VehiclePart extends BaseEntity {
  @Column() name: string;                 // unique (case-insensitive normalize edilecek)
  @Column("text", { nullable: true }) note: string | null;
}

// features/common/vehicle-accessory/entity/vehicle-accessory.entity.ts
@Entity("vehicle_accessories")
class VehicleAccessory extends BaseEntity {
  @Column() name: string;
  @Column("text", { nullable: true }) note: string | null;
}
```

İleride istenirse `category` enum/free-text alanı eklenebilir; şimdilik basit tutuyoruz (Tag pattern). Servis `getOrCreate(name)` ile case-insensitive davranır.

### 1.8 `db/db.ts` — entities listesine eklenecekler

```
Expense,
FuelExpenseMetadata, RepairExpenseMetadata, RepairExpenseLineItem,
ParkingExpenseMetadata, CarWashExpenseMetadata,
AccessoryExpenseMetadata, AccessoryExpenseLineItem,
VehiclePart, VehicleAccessory,
```

`synchronize: true` olduğu için manuel migration gerekmez (dev).

---

## 2. Type Sistemi

### 2.1 Enum'lar

```ts
// features/expense/types/expense-type.ts
export const ExpenseTypes = {
  FUEL: "FUEL",
  REPAIR_SERVICE: "REPAIR_SERVICE",
  PARKING: "PARKING",
  CAR_WASH: "CAR_WASH",
  ACCESSORY: "ACCESSORY",
} as const;
export type ExpenseType = (typeof ExpenseTypes)[keyof typeof ExpenseTypes];

// features/expense/types/fuel.ts
export const FuelKinds = { PETROL, DIESEL, LPG, CNG, ELECTRIC } as const;
export const FuelUnits = { L: "L", GAL: "GAL", KWH: "KWH" } as const;
export const FuelLevels = { E: "E", Q1: "Q1", Q2: "Q2", Q3: "Q3", F: "F" } as const;

export const FUEL_KIND_UNITS: Record<FuelKind, FuelUnit[]> = {
  PETROL:   ["L", "GAL"],
  DIESEL:   ["L", "GAL"],
  LPG:      ["L", "GAL"],
  CNG:      ["L", "GAL"],
  ELECTRIC: ["KWH"],
};

// features/expense/types/wash.ts
export const WashTypes = { EXTERIOR, INTERIOR, FULL, DETAILING } as const;
```

### 2.2 Station type filtering map

```ts
// features/expense/constants/expense-station-types.ts
export const EXPENSE_TYPE_STATION_FILTER: Record<ExpenseType, StationType[] | "ALL"> = {
  FUEL:           [StationTypes.GAS_STATION],
  REPAIR_SERVICE: [StationTypes.MECHANIC, StationTypes.AUTHORIZED_SERVICE],
  PARKING:        [StationTypes.PARKING],
  CAR_WASH:       [StationTypes.CAR_WASH],
  ACCESSORY:      "ALL",                   // herhangi biri
};
```

### 2.3 Type meta (icon + color)

```ts
// features/expense/constants/expense-type-meta.ts — Station pattern
EXPENSE_TYPE_META = {
  FUEL:           { icon: "Fuel",          colorToken: "color.cyan" },
  REPAIR_SERVICE: { icon: "Wrench",        colorToken: "color.orange" },
  PARKING:        { icon: "ParkingSquare", colorToken: "color.purple" },
  CAR_WASH:       { icon: "Droplets",      colorToken: "color.green" },
  ACCESSORY:      { icon: "Sparkles",      colorToken: "color.rose" },
};
```

### 2.4 Query / pagination

```ts
// features/expense/types/expense-query.ts — Station pattern birebir
export type ExpenseSortKey = "occurredAt_desc" | "occurredAt_asc" | "amount_desc" | "amount_asc";
export type ExpenseFilters = {
  type: ExpenseType | null;        // route-driven
  vehicleId: string | null;        // genelde activeVehicleId; All view için null olabilir
  dateFrom: number | null;
  dateTo: number | null;
  amountMin: number | null;
  amountMax: number | null;
  stationIds: string[];
  hasMedia: boolean;
  // FUEL alt filtreleri
  fuelKinds: FuelKind[];
};
export const EXPENSE_PAGE_SIZE = 20;
export const DEFAULT_EXPENSE_SORT: ExpenseSortKey = "occurredAt_desc";
```

---

## 3. Servis Katmanı

### 3.1 `ExpenseService`

```ts
class ExpenseService {
  // Liste
  query(q: ExpenseQuery): Promise<ExpensePage>
    // QueryBuilder ile, leftJoinAndSelect cover/media meta;
    // limit+1 trick (Station pattern), stable id tiebreaker
  getById(id): Promise<Expense>
    // relations: vehicle, station, media, fuelMeta, repairMeta+lineItems+part,
    // parkingMeta, carWashMeta, accessoryMeta+lineItems+accessory
  getByStation(stationId, q?): Promise<ExpensePage>          // Station detail için
  getByVehicle(vehicleId, q?): Promise<ExpensePage>          // ileride lazım olabilir

  // Mutasyon — transaction içinde
  create(dto: CreateExpenseDto): Promise<Expense>
    // 1. Validate ortak alanlar
    // 2. Validate type-specific (validators/<type>.validator.ts)
    // 3. Transaction:
    //    - insert Expense (without metadata)
    //    - insert metadata row (type'a göre)
    //    - line items varsa insert et
    //    - media link (ManyToMany)
    // 4. Return tam yüklü
  update(id, dto: UpdateExpenseDto): Promise<Expense>
    // type değişimi YASAK (form'da kilitli olacak)
    // metadata replace mantığı (line items: diff yerine sil+yeniden insert basit)
  delete(id): Promise<void>
    // hard delete; CASCADE metadata + line items + media join row temizler
}
```

### 3.2 Type-specific validators

`features/expense/validators/`:
- `fuel-expense.validator.ts` — `fuelKind` ∈ allowed; `fuelUnit` ∈ `FUEL_KIND_UNITS[fuelKind]`; `fuelQuantity > 0`; `pricePerUnit ≥ 0`; `fuelLevelAfter` enum.
- `repair-expense.validator.ts` — `lineItems.length ≥ 1`; her line: `partId` exists, `quantity ≥ 1`, `unitPrice ≥ 0`.
- `parking-expense.validator.ts` — `durationMinutes ≥ 0` (nullable).
- `car-wash-expense.validator.ts` — `washType` enum.
- `accessory-expense.validator.ts` — `lineItems.length ≥ 1`; her line: `accessoryId` exists, `quantity ≥ 1`, `unitPrice ≥ 0`.

Hata fırlatımı `AppError.createAppError(ExpenseErrors.INVALID_FUEL_QUANTITY, ...)` formatında.

### 3.3 Common servisler

- `VehiclePartService`: `getAll`, `getById`, `getByIds`, `getOrCreate(name)`, `rename(id, name)`, `delete(id)`. Repair line item kullanan expense varken silmeye `RESTRICT` engel olur — UI bunu yakalar (`VehiclePartErrors.IN_USE`).
- `VehicleAccessoryService`: aynı pattern.

---

## 4. Hata Kodları

```ts
ExpenseErrors:
  EXPENSE_NOT_FOUND
  TYPE_IMMUTABLE                       // update'te type değişti
  INVALID_AMOUNT
  INVALID_OCCURRED_AT
  INVALID_ODOMETER
  INVALID_STATION_FOR_TYPE             // station tip uyumsuz

  // FUEL
  INVALID_FUEL_KIND
  INVALID_FUEL_UNIT_FOR_KIND
  INVALID_FUEL_QUANTITY
  INVALID_FUEL_LEVEL

  // REPAIR
  REPAIR_REQUIRES_LINE_ITEM
  INVALID_LINE_ITEM_QUANTITY

  // ACCESSORY
  ACCESSORY_REQUIRES_LINE_ITEM

  // PARKING
  INVALID_DURATION

VehiclePartErrors:
  PART_NOT_FOUND
  PART_NAME_TOO_SHORT
  PART_NAME_ALREADY_EXISTS
  PART_IN_USE                          // RESTRICT FK ihlali

VehicleAccessoryErrors:
  ACCESSORY_NOT_FOUND
  ACCESSORY_NAME_TOO_SHORT
  ACCESSORY_NAME_ALREADY_EXISTS
  ACCESSORY_IN_USE
```

`shared/errors/app-error.ts` → `AppErrorCode` union'a eklenir. `errors.json` (TR/EN) güncellenir.

---

## 5. Store

### 5.1 `useExpenseStore` (Station pattern)

```ts
state:
  expenses: Expense[]
  hasMore: boolean
  page: number
  isLoading, isLoadingMore: boolean
  filters: ExpenseFilters
  sort: ExpenseSortKey
  loadToken: number

actions:
  load()               // increments token, applies if still current
  loadMore()           // race-guard, dedupe by id
  create(dto)          // → load()
  update(id, dto)      // → load()
  delete(id)           // optimistic remove + top-up if page short
  setFilters(patch)    // → load()
  setSort(sort)        // → load()
  resetFilters()       // type ve activeVehicle preserved → load()
  getById(id)
  getByStationId(stationId, opts)   // Station detail view-only — store dışı state
```

### 5.2 `useVehiclePartStore` ve `useVehicleAccessoryStore`

Tag store pattern: `parts[]`, `load`, `create`, `rename`, `delete`. Kullanım yerleri:
- `RepairExpenseFields` (line item için picker)
- `Settings → Data → Vehicle Parts` yönetim ekranı

---

## 6. Navigation

Mevcut garage screen'inde 5 buton zaten var (kullanıcı onayladı). Her buton `/garage/expense/[type]`'a gider. Form ve detail ortak.

```
app/(tabs)/garage/expense/
  [type]/
    index.tsx            → ExpenseListScreen (route param: type)
                          // başlık: t(`expense.types.${type}`)
                          // sağ: Plus icon → /expense/new?type=<type>
  new.tsx                → ExpenseFormScreen (create; query: ?type=<type>)
  [id]/
    index.tsx            → ExpenseDetailScreen
    edit.tsx             → ExpenseFormScreen (edit)
```

`_layout.tsx` Stack (slide_from_right). Active vehicle yokken liste/form ekranları "araç seç" CTA'sı gösterir.

---

## 7. UI Bileşenleri

### 7.1 Liste (`ExpenseListScreen`)

- AppHeader: type label + araç adı subtitle, sağda `Plus`
- ListHeader: `ExpenseFilterBar` (Filter pill + Sort pill — Station pattern)
- Item (`ExpenseListItem`):
  - Sol: type tinted bg + icon
  - Orta: title (örn. FUEL → "25 L Petrol", REPAIR → ilk parça adı + N more, PARKING → süre, CAR_WASH → washType, ACCESSORY → ilk aksesuar adı + N more)
  - Sub: `formatDate(occurredAt)` · station.name? · vehicle.brand+model
  - Sağ: `formatMoney(amount)` pill + chevron
- Empty: filtered-empty / no-expenses-yet (CTA: ilk gideri ekle)
- Pagination: FlatList `onEndReached`, footer `ActivityIndicator`, pull-to-refresh

### 7.2 Detail (`ExpenseDetailScreen`)

- Hero: type icon tinted bg banner (isteğe bağlı: ilk media item önizleme)
- Title section: type badge + büyük amount + `formatDateTime(occurredAt)`
- Vehicle info (tıklanabilir → vehicle detail)
- Type-specific group:
  - FUEL → kind, quantity+unit, pricePerUnit, fuelLevelAfter (4 segmented göstergesi), isFullTank badge
  - REPAIR → line items list (parça adı, qty, unitPrice)
  - PARKING → süre (X saat Y dakika)
  - CAR_WASH → washType label
  - ACCESSORY → line items list
- Station group (varsa, tıklanabilir → station detail)
- Note box
- Media grid (`AppMediaGalleryField` read-only render) — cover yok
- Header right: Pencil + Trash2 (Vehicle pattern)
- Edit dönüşünde `useFocusEffect` ile reload

### 7.3 Form (`ExpenseFormScreen`)

Tek `<Formik>`, sectioned (Vehicle wizard pattern, ama tek scroll içinde):

```
Section: Genel bilgi (Common)
  - amount (MoneyInputField — currency = pref.currency default)
  - occurredAt (AppDateTimePickerField, mode="datetime")
  - odometer (opsiyonel; suffix = pref.distanceUnit)
  - station (ExpenseStationPickerField — type'a göre filtrelenmiş)

Section: Tipe özel (dinamik)
  - FUEL          → FuelExpenseFields
  - REPAIR_SERVICE→ RepairExpenseFields
  - PARKING       → ParkingExpenseFields
  - CAR_WASH      → CarWashExpenseFields
  - ACCESSORY     → AccessoryExpenseFields

Section: Notlar & Medya
  - note (multiline)
  - media (AppMediaGalleryField; cover slot OFF — yeni prop `coverSlot={false}`)
```

`type` query/edit'ten geldikten sonra **kilitli** (UI'da değiştirilemez). `update` servisi de TYPE_IMMUTABLE atar.

### 7.4 Type-specific field componentleri

**`FuelExpenseFields`** (`features/expense/components/type-fields/`)
- `fuelKind` — segmented (PETROL | DIESEL | LPG | CNG | ELECTRIC) → ikonlu
- `fuelUnit` — segmented; `FUEL_KIND_UNITS[fuelKind]` ile değişen seçenekler. ELECTRIC seçili ise tek seçenek (`KWH`), kilitli.
- `fuelQuantity` — numeric input + addon (unit label)
- `pricePerUnit` — auto-calc'lı numeric input. Default = `amount.value / fuelQuantity` (fuelQuantity > 0). Kullanıcı override edebilir; quantity/amount değişince yeniden senkronize seçeneği için bir "auto-sync" toggle ekleyebiliriz (basit: değişince override flag'i sıfırlanmaz, yalnızca boş ise tetiklenir).
- `fuelLevelAfter` — 5'li segmented (E | 1/4 | 1/2 | 3/4 | F) ikon olarak yakıt göstergesi grafiği
- `isFullTank` — toggle

**`RepairExpenseFields`**
- Line items list (ekle/sil/yeniden sırala değil — sadece ekle/sil)
- Her satır: `LineItemRow`
  - `VehiclePartPicker` — bottom sheet (`select-sheet`); arama + "Yeni parça oluştur" CTA → `VehiclePartService.getOrCreate`
  - quantity numeric (default 1)
  - unitPrice numeric (opsiyonel)
  - note tek satırlık input (opsiyonel)
- Footer: "Toplam" hesaplama (sum of `qty * unitPrice` — bilgi amaçlı, expense `amount` ile zorunlu eşitlik yok)
- Boş durumda: "İlk parçayı ekle" CTA

**`ParkingExpenseFields`**
- `durationHours` + `durationMinutes` — iki numeric input yan yana → store'a `durationMinutes = h*60 + m` olarak yazılır

**`CarWashExpenseFields`**
- `washType` — 4'lü segmented (EXTERIOR | INTERIOR | FULL | DETAILING)

**`AccessoryExpenseFields`**
- Repair ile aynı line item pattern, picker `VehicleAccessoryPicker` kullanır.

### 7.5 `ExpenseStationPickerField`

- Sheet açar (`select-sheet`)
- Kaynak: `StationService.getAll()` → filtrele `EXPENSE_TYPE_STATION_FILTER[type]`
- Boş durum (uygun istasyon yok): "İlk <type> istasyonunu ekle" CTA → station form'a yönlenir
- Selected state: station name + type badge; X ile temizle

### 7.6 `ExpenseFilterSheet`

Section'lar:
- Date range (from–to)
- Amount range (min–max, currency symbol = expense'in currency'sinden bağımsız sadece sayı; ileride iyileştirilebilir)
- Vehicle (default activeVehicle, multi seçim opsiyonu YOK — şimdilik tek vehicle filter)
- Station picker (multi)
- hasMedia toggle
- (FUEL view'da) fuelKind multi select
- Footer: Reset / Apply

Sort sheet: 4 satır (`occurredAt_desc/asc`, `amount_desc/asc`).

### 7.7 `AppMediaGalleryField` — `coverSlot` prop'u

Mevcut bileşene `coverSlot?: boolean` (default `true`) eklenir. `false` ise cover slot ve "Set as Cover" aksiyonu render edilmez, item'lar 3 kolon grid olarak başlar. Station davranışı bozulmaz.

### 7.8 `VehiclePartPicker` / `VehicleAccessoryPicker`

`select-sheet` içinde:
- `AppInputField` (search)
- `FlatList` matching parts
- "Yeni Parça Ekle" / "Yeni Aksesuar Ekle" satırı (search query non-empty olduğunda görünür) → `getOrCreate`
- onSelect → callback + sheet kapanır

### 7.9 Settings → Data altına yeni girişler

- "Vehicle Parts" → `VehiclePartManagementScreen` (Tag scope ekranı pattern: rename modal + delete confirm)
- "Vehicle Accessories" → aynı

`PART_IN_USE` / `ACCESSORY_IN_USE` hatası `handleUIError` ile Toast olarak gösterilir.

---

## 8. UserPreferences Entegrasyonu

`UserPreferences` entity'sine eklemek **zorunlu olmayan** değişiklikler:
- (mevcut) `currency` → form `amount.currency` default
- (mevcut) `volumeUnit` (L | GAL) → fuel form için non-electric default
- (mevcut) `distanceUnit` → odometer suffix
- (yeni, opsiyonel) `defaultFuelKind: FuelKind | null` — son seçilen yakıtı hatırlamak için. **MVP'de eklemeyebiliriz**; alternatif: en son kullanılan FuelKind'i runtime'da `expenseStore`'dan türet (son fuel expense'inin kind'i).

Karar: MVP'de pref alanı eklemiyoruz; `useExpenseStore.getLastFuelKindForVehicle(vehicleId)` helper'ı ile son kullanımdan default'la.

---

## 9. Station Detail Entegrasyonu

`StationDetailScreen` sonuna **"Bu istasyonda yapılan giderler"** seksiyonu:
- `ExpenseService.getByStation(station.id, { limit: 5, sort: "occurredAt_desc" })` çağrısı
- 5 item özet listesi + "Tümünü gör" linki → `/garage/expense?stationId=<id>` (filter store'a uygulanmış halde mount eder)
- Boş durum: "Henüz gider eklenmemiş"

`StationListItem` üzerinde değişiklik **yok** (sadece detail seviyesi).

---

## 10. i18n

### 10.1 Yeni namespace'ler

```
i18n/locales/{en,tr}/
  expense.json
  vehicle-part.json
  vehicle-accessory.json
```

`TranslationNamespaces` enum'a 3 yeni değer; `LanguageResources`'a registrasyon.

### 10.2 expense.json iskeleti

```
title, titleByType.{FUEL,REPAIR_SERVICE,PARKING,CAR_WASH,ACCESSORY}
types.{...}
fuelKinds.{PETROL,DIESEL,LPG,CNG,ELECTRIC}
fuelUnits.{L,GAL,KWH}
fuelLevels.{E,Q1,Q2,Q3,F}
washTypes.{...}
sections.{general,typeSpecific,notesMedia}
fields.{amount,occurredAt,odometer,station,note,fuelKind,fuelQuantity,fuelUnit,pricePerUnit,fuelLevelAfter,isFullTank,washType,duration,durationHours,durationMinutes,lineItems,part,accessory,quantity,unitPrice}
placeholders.{...}
errors.{...}
filters.{title,button,dateRange,amountRange,stations,hasMedia,fuelKinds,apply,reset,emptyFiltered,clearFilters}
sort.{title,button,occurredAt_desc,occurredAt_asc,amount_desc,amount_asc}
form.{title.create,title.edit,save,cancel}
detail.{stationGroup,vehicleGroup,linkedExpensesAtStation}
empty.{noExpenses,noExpensesSub,addFirst}
```

### 10.3 errors namespace eklemeleri

`ExpenseErrors` + `VehiclePartErrors` + `VehicleAccessoryErrors` tüm kodları için TR/EN mesaj satırı.

---

## 11. Klasör Yerleşimi

```
features/expense/
  entity/
    expense.entity.ts
    fuel-expense-metadata.entity.ts
    repair-expense-metadata.entity.ts
    repair-expense-line-item.entity.ts
    parking-expense-metadata.entity.ts
    car-wash-expense-metadata.entity.ts
    accessory-expense-metadata.entity.ts
    accessory-expense-line-item.entity.ts
  types/
    expense-type.ts
    fuel.ts
    wash.ts
    expense-query.ts
  constants/
    expense-type-meta.ts
    expense-station-types.ts
  errors/
    expense.errors.ts
  validators/
    fuel-expense.validator.ts
    repair-expense.validator.ts
    parking-expense.validator.ts
    car-wash-expense.validator.ts
    accessory-expense.validator.ts
  service/
    expense.service.ts
  components/
    ExpenseListItem.tsx
    ExpenseFilterBar.tsx
    ExpenseFilterSheet.tsx
    ExpenseStationPickerField.tsx
    type-fields/
      FuelExpenseFields.tsx
      RepairExpenseFields.tsx
      ParkingExpenseFields.tsx
      CarWashExpenseFields.tsx
      AccessoryExpenseFields.tsx
    line-items/
      LineItemRow.tsx
  screens/
    expense-list/
      ExpenseListScreen.tsx
    expense-detail/
      ExpenseDetailScreen.tsx
    expense-form/
      ExpenseFormScreen.tsx
      schema.ts
      form-types.ts
      utils.ts                   (formValuesToDto, dtoToFormValues)
  utils/
    fuel-units.ts
    line-item-helpers.ts

features/common/
  vehicle-part/
    entity/vehicle-part.entity.ts
    errors/vehicle-part.errors.ts
    service/vehicle-part.service.ts
    components/VehiclePartPicker.tsx
    screens/VehiclePartManagementScreen.tsx
  vehicle-accessory/
    entity/vehicle-accessory.entity.ts
    errors/vehicle-accessory.errors.ts
    service/vehicle-accessory.service.ts
    components/VehicleAccessoryPicker.tsx
    screens/VehicleAccessoryManagementScreen.tsx

stores/
  expense.store.ts
  vehicle-part.store.ts
  vehicle-accessory.store.ts

app/(tabs)/garage/expense/
  _layout.tsx
  [type]/index.tsx
  new.tsx
  [id]/index.tsx
  [id]/edit.tsx

app/(tabs)/settings/
  vehicle-parts/index.tsx           (yeni)
  vehicle-accessories/index.tsx     (yeni)

i18n/locales/{en,tr}/
  expense.json
  vehicle-part.json
  vehicle-accessory.json
```

---

## 12. Implementation Sırası (Todo)

> **Status legend:** `[ ]` not started · `[~]` in progress · `[x]` done · `[!]` blocked
>
> **Kural:** Bir adımı bitirip diğerine geçmeden önce ilgili kutucuğu `[x]` yap, kısa bir not düş (commit hash, dikkat edilen şey vb.). Her adımın sonunda `npx tsc --noEmit` çalıştır ve sıfır hata gör.

### Step 1 — Common: Vehicle Parts
- [ ] **1.1** `features/common/vehicle-part/entity/vehicle-part.entity.ts`
- [ ] **1.2** `features/common/vehicle-part/errors/vehicle-part.errors.ts` + `app-error.ts` union'a ekle
- [ ] **1.3** `features/common/vehicle-part/service/vehicle-part.service.ts` (CRUD + `getOrCreate`)
- [ ] **1.4** `db/db.ts` entities listesine `VehiclePart` ekle
- [ ] **1.5** `stores/vehicle-part.store.ts`
- [ ] **1.6** `i18n/locales/{en,tr}/vehicle-part.json` + `TranslationNamespaces` + `LanguageResources` + `errors.json` ekleri
- [ ] **1.7** `features/common/vehicle-part/screens/VehiclePartManagementScreen.tsx` (Settings → Data)
- [ ] **1.8** Settings'e link + tsc

### Step 2 — Common: Vehicle Accessories
- [ ] **2.1** Step 1 ile **bire bir aynı yapı**, `VehicleAccessory` için tekrarla (entity / errors / service / db.ts / store / i18n / management screen / settings link)
- [ ] **2.2** tsc

### Step 3 — Expense Entity Ailesi
- [ ] **3.1** `features/expense/entity/expense.entity.ts`
- [ ] **3.2** `fuel-expense-metadata.entity.ts`
- [ ] **3.3** `repair-expense-metadata.entity.ts` + `repair-expense-line-item.entity.ts`
- [ ] **3.4** `parking-expense-metadata.entity.ts`
- [ ] **3.5** `car-wash-expense-metadata.entity.ts`
- [ ] **3.6** `accessory-expense-metadata.entity.ts` + `accessory-expense-line-item.entity.ts`
- [ ] **3.7** `db/db.ts` entities listesine 8 entity'yi ekle
- [ ] **3.8** tsc; uygulamayı çalıştır → tablolar oluştu mu doğrula (DB inspector veya log)

### Step 4 — Types, Constants, Errors
- [ ] **4.1** `features/expense/types/expense-type.ts` (`ExpenseTypes` enum)
- [ ] **4.2** `features/expense/types/fuel.ts` (`FuelKinds`, `FuelUnits`, `FuelLevels`, `FUEL_KIND_UNITS` map)
- [ ] **4.3** `features/expense/types/wash.ts`
- [ ] **4.4** `features/expense/types/expense-query.ts` (`ExpenseFilters`, `ExpenseSortKey`, `ExpenseQuery`, `ExpensePage`, defaults)
- [ ] **4.5** `features/expense/constants/expense-type-meta.ts`
- [ ] **4.6** `features/expense/constants/expense-station-types.ts` (`EXPENSE_TYPE_STATION_FILTER`)
- [ ] **4.7** `features/expense/errors/expense.errors.ts` + `app-error.ts` union
- [ ] **4.8** tsc

### Step 5 — Validators
- [ ] **5.1** `features/expense/validators/fuel-expense.validator.ts`
- [ ] **5.2** `features/expense/validators/repair-expense.validator.ts`
- [ ] **5.3** `features/expense/validators/parking-expense.validator.ts`
- [ ] **5.4** `features/expense/validators/car-wash-expense.validator.ts`
- [ ] **5.5** `features/expense/validators/accessory-expense.validator.ts`
- [ ] **5.6** tsc

### Step 6 — ExpenseService
- [ ] **6.1** `query()` (filters + sort + pagination, NULLS LAST emulation, `+1` hasMore trick, stable tiebreaker)
- [ ] **6.2** `getById()` (full eager load — uyarı #24)
- [ ] **6.3** `getByStation()` (Station detail için)
- [ ] **6.4** `create()` — FUEL transaction'lı yol
- [ ] **6.5** `create()` — diğer 4 type
- [ ] **6.6** `update()` (TYPE_IMMUTABLE check + metadata replace + line items diff/replace)
- [ ] **6.7** `delete()` (CASCADE doğrula)
- [ ] **6.8** tsc

### Step 7 — Expense Store
- [ ] **7.1** `stores/expense.store.ts` (Station store kopyası — loadToken pattern)
- [ ] **7.2** `getLastFuelKindForVehicle(vehicleId)` helper
- [ ] **7.3** tsc

### Step 8 — i18n
- [ ] **8.1** `i18n/locales/{en,tr}/expense.json` (sections.10.2'deki tüm anahtarlar)
- [ ] **8.2** `errors.json` — Expense + VehiclePart + VehicleAccessory error code'ları
- [ ] **8.3** `TranslationNamespaces` + `LanguageResources` registrasyonu
- [ ] **8.4** tsc

### Step 9 — `AppMediaGalleryField` Patch
- [ ] **9.1** `coverSlot?: boolean` (default `true`) prop'u ekle
- [ ] **9.2** Station form'unu manuel test et — kırılmadığını doğrula
- [ ] **9.3** tsc

### Step 10 — Liste Ekranı
- [ ] **10.1** `ExpenseListItem.tsx` (type icon + title üretici + amount pill)
- [ ] **10.2** `ExpenseFilterBar.tsx`
- [ ] **10.3** `ExpenseFilterSheet.tsx` + `sheets.ts` registrasyonu
- [ ] **10.4** `ExpenseListScreen.tsx` (FlatList + pagination + empty states)
- [ ] **10.5** tsc

### Step 11 — Detail Ekranı
- [ ] **11.1** `ExpenseDetailScreen.tsx` iskelet (header + delete confirm)
- [ ] **11.2** Type-specific render — FUEL
- [ ] **11.3** Type-specific render — REPAIR (line items list)
- [ ] **11.4** Type-specific render — PARKING
- [ ] **11.5** Type-specific render — CAR_WASH
- [ ] **11.6** Type-specific render — ACCESSORY (line items list)
- [ ] **11.7** Station group + media grid + note
- [ ] **11.8** tsc

### Step 12 — Form Ekranı
- [ ] **12.1** `expense-form/form-types.ts` + `schema.ts` + `utils.ts` (formValuesToDto / dtoToFormValues)
- [ ] **12.2** `ExpenseFormScreen.tsx` iskelet (Formik root + common section)
- [ ] **12.3** `ExpenseStationPickerField.tsx` (type-aware filter)
- [ ] **12.4** `ParkingExpenseFields.tsx` (en basit, ısınma)
- [ ] **12.5** `CarWashExpenseFields.tsx`
- [ ] **12.6** `FuelExpenseFields.tsx` (kind→unit reset side-effect — uyarı #8, pricePerUnit auto-calc — uyarı #9)
- [ ] **12.7** `LineItemRow.tsx` (shared)
- [ ] **12.8** `VehiclePartPicker.tsx` → `RepairExpenseFields.tsx`
- [ ] **12.9** `VehicleAccessoryPicker.tsx` → `AccessoryExpenseFields.tsx`
- [ ] **12.10** Note + `AppMediaGalleryField` (coverSlot=false) bölümü
- [ ] **12.11** tsc

### Step 13 — Routing
- [ ] **13.1** `app/(tabs)/garage/expense/_layout.tsx`
- [ ] **13.2** `app/(tabs)/garage/expense/[type]/index.tsx`
- [ ] **13.3** `app/(tabs)/garage/expense/new.tsx` (query: `?type=`)
- [ ] **13.4** `app/(tabs)/garage/expense/[id]/index.tsx`
- [ ] **13.5** `app/(tabs)/garage/expense/[id]/edit.tsx`
- [ ] **13.6** Mevcut Garage screen butonlarının href'lerini bağla
- [ ] **13.7** tsc

### Step 14 — Station Detail Entegrasyonu
- [ ] **14.1** `StationDetailScreen`'e "Bu istasyonda yapılan giderler" bölümü (`ExpenseService.getByStation`, ilk 5)
- [ ] **14.2** "Tümünü gör" linki → expense list filtered by stationId
- [ ] **14.3** Boş durum render
- [ ] **14.4** tsc

### Step 15 — Vehicle Silme Cascade UX
- [ ] **15.1** Vehicle delete confirm Alert'ine "X gider de silinecek" notu ekle (uyarı #5)
- [ ] **15.2** `ExpenseService.countByVehicle(vehicleId)` helper
- [ ] **15.3** tsc

### Step 16 — Final Verification
- [ ] **16.1** `npx tsc --noEmit` — sıfır hata
- [ ] **16.2** Manuel test matrisi (uyarı #25–29):
  - [ ] FUEL create / edit / delete / liste / filter / sort
  - [ ] REPAIR create (line items) / edit / delete / liste
  - [ ] PARKING create / edit / delete / liste
  - [ ] CAR_WASH create / edit / delete / liste
  - [ ] ACCESSORY create (line items) / edit / delete / liste
  - [ ] Vehicle silme cascade'i — tüm expense temizlendi
  - [ ] Station silme — expense.stationId null'a düştü
  - [ ] VehiclePart silme `PART_IN_USE` Toast
  - [ ] VehicleAccessory silme `ACCESSORY_IN_USE` Toast
  - [ ] Aynı vehicle, farklı currency expense'ler liste tutarlı
  - [ ] Type-route reset double-load yok (filter chips spam → tek render)
  - [ ] Edit dönüşü `useFocusEffect` ile reload
- [ ] **16.3** ESLint temiz

---

## 13. Açık Notlar / İleride

- **Aggregate / dashboard** (sumByMonth, sumByType, fuel consumption analytics) — sonraki sürüm.
- **Multi-currency total** — gerekirse currency'ye göre group by ile gösterilir.
- **Recurring expenses** (abonelikler) — sonraki sürüm.
- **CSV / PDF export** — sonraki sürüm.
- **`pricePerUnit` auto-calc UX** — basit başlat (boş ise hesapla); kullanıcıdan feedback gelirse iyileştir.
- **VehiclePart / VehicleAccessory'de kategori alanı** — gerek duyulursa eklenir; şu an düz isim listesi.
