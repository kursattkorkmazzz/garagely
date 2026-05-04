# DateTime Picker Implementation Plan

> **Durum: ✅ TAMAMLANDI**

## Overview

Kullanıcıdan UTC-0 formatında tarih/saat almak için kapsamlı bir picker sistemi.  
3 mode: sadece saat, sadece tarih, hem tarih hem saat.

---

## Paket Kurulumu

```bash
npm install dayjs
npm install countries-and-timezones
```

---

## Adım 1 — `shared/timezone` Modülü

```
shared/timezone/
  types/timezone-type.ts
  index.ts
```

```ts
// timezone-type.ts
import ct from "countries-and-timezones";

export type TimezoneString = string; // IANA format: "Europe/Istanbul"

export const getAllTimezones = () => ct.getAllTimezones();
// → Record<string, { name, utcOffset, utcOffsetStr, dstOffset, ... }>

export const getDeviceTimezone = (): TimezoneString =>
  Intl.DateTimeFormat().resolvedOptions().timeZone;
```

Timezone sabitleri enumerate edilmez (600+ IANA timezone var).  
`getAllTimezones()` ile runtime'da listelenir. Settings ekranında seçici için kullanılacak.

---

## Adım 2 — UserPreferences Timezone Alanı

### `user-preferences.entity.ts`
```ts
@Column({ type: "text", default: "UTC" })
timezone!: TimezoneString;
```

### `user-preferences.store.ts`
```ts
State:   timezone: TimezoneString
Actions: setTimezone(tz: TimezoneString) → persist + set state
```

### `db/hooks/database-provider.tsx` — İlk açılış init
```ts
// Eğer mevcut timezone "UTC" ise (hiç set edilmemişse)
// cihazın timezone'u ile güncelle
if (prefs.timezone === "UTC") {
  const deviceTz = getDeviceTimezone();
  await UserPreferencesService.update({ timezone: deviceTz });
}
```

`synchronize: true` olduğu için migration gerekmez.

---

## Adım 3 — `utils/dayjs.ts` (global setup)

```ts
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);
dayjs.extend(timezone);

export default dayjs;
```

`app/_layout.tsx` başlangıcında bir kez import edilir.

---

## Adım 4 — `date-time-utils.ts`

```
components/ui/app-date-picker/date-time-utils.ts
```

```ts
utcToLocal(utcMs, tz) → { year, month, day, hour, minute }
localToUtc(parts, tz) → number  // UTC ms

formatDate(utcMs, tz, lang)     → "25/01/2024"
formatTime(utcMs, tz)           → "14:30"
formatDateTime(utcMs, tz, lang) → "25/01/2024  14:30"
```

### Placeholder'lar (dile göre)

| Lang | Date         | Time    | DateTime              |
|------|--------------|---------|-----------------------|
| `tr` | `GG/AA/YYYY` | `SS:DD` | `GG/AA/YYYY  SS:DD`   |
| `en` | `DD/MM/YYYY` | `HH:MM` | `DD/MM/YYYY  HH:MM`   |

---

## Adım 5 — `AppTab` Komponenti (sıfırdan, shadcn tarzı)

`AppSegmented` kaldırılmaz — `AppTab` ayrı bir bileşen olarak eklenir.

```
components/ui/app-tab/
  index.ts
  app-tab.tsx           ← root (context + value yönetimi)
  app-tab-list.tsx      ← tab butonları satırı
  app-tab-trigger.tsx   ← tekil tab butonu (underline animasyonu)
  app-tab-panel.tsx     ← içerik paneli (sadece aktifken render)
  tab-context.ts        ← React context
```

### Görünüm (shadcn tarzı — underline aktif göstergesi)
```
┌─────────────────────────────────┐
│  Tarih      │  Saat             │  ← AppTabList
│─────────────│                   │  ← aktif underline (animated)
│                                 │
│     [AppDatePicker]             │  ← AppTabPanel value="date"
│                                 │
└─────────────────────────────────┘
```

### Kullanım (composable)
```tsx
<AppTab value={activeTab} onChange={setActiveTab}>
  <AppTabList>
    <AppTabTrigger value="date">Tarih</AppTabTrigger>
    <AppTabTrigger value="time">Saat</AppTabTrigger>
  </AppTabList>
  <AppTabPanel value="date">
    <AppDatePicker ... />
  </AppTabPanel>
  <AppTabPanel value="time">
    <AppTimePicker ... />
  </AppTabPanel>
</AppTab>
```

- Aktif tab: underline animasyonu (Reanimated)
- `AppTabPanel`: sadece `value === activeTab` olduğunda children render edilir

---

## Adım 6 — `ScrollDrum` (ortak iç bileşen)

```
components/ui/app-date-picker/scroll-drum.tsx
```

```ts
type ScrollDrumProps = {
  items: string[];
  selectedIndex: number;
  onIndexChange: (i: number) => void;
  itemHeight?: number;    // default: 44
  visibleItems?: number;  // default: 5
}
```

### Görünüm
```
┌───────────┐
│    08     │  muted
│    09     │  muted
│ ── 10 ──  │  ← selected (highlight band, absolute positioned)
│    11     │  muted
│    12     │  muted
└───────────┘
```

### Teknik Detaylar
- `snapToInterval={itemHeight}`
- `paddingVertical = 2 * itemHeight` — baş/son itemı ortalar
- `onMomentumScrollEnd` → `Math.round(offset / itemHeight)` → index
- `scrollRef.scrollTo` → value/index değişince programmatic scroll

---

## Adım 7 — `AppTimePicker` (refactor)

```ts
type AppTimePickerProps = {
  utcMs: number;
  timezone: string;
  onChange: (utcMs: number) => void;
}
```

- `utcMs` + timezone → `dayjs.utc(utcMs).tz(tz)` → `{ hour, minute }`
- 2× ScrollDrum: saat (00–23) + dakika (00–59)
- Seçim → local `{hour, minute}` + mevcut tarih parçaları → UTC ms → `onChange`

---

## Adım 8 — `AppDatePicker` (implement)

```ts
type AppDatePickerProps = {
  utcMs: number;
  timezone: string;
  onChange: (utcMs: number) => void;
}
```

- 3× ScrollDrum: gün (01–31), ay (01–12), yıl (1900–2100)
- Ay/yıl değişince `dayjs().daysInMonth()` ile max gün hesaplanır
- Seçili gün > max → clamp yapılır
- Seçim → UTC ms → `onChange`

---

## Adım 9 — `AppDateTimePickerField`

```ts
type Mode = "time" | "date" | "datetime";

type AppDateTimePickerFieldProps = {
  label: string;
  value: number | null;          // UTC ms, null = seçilmemiş
  onChange: (utcMs: number) => void;
  mode: Mode;
  error?: string;
  placeholder?: string;          // override (opsiyonel)
}
```

### Field görünümü
```
AppField
└── AppFieldLabel
└── Pressable → modal açar
    └── AppInputGroup
        ├── AppInputAddon (left): Calendar veya Clock icon
        └── AppInputField: "25/01/2024  14:30" veya placeholder (readonly)
└── AppFieldError
```

### Modal içeriği (mode'a göre)

| Mode       | Modal içeriği                                     |
|------------|---------------------------------------------------|
| `time`     | `AppTimePicker` (tab yok)                         |
| `date`     | `AppDatePicker` (tab yok)                         |
| `datetime` | `AppTab` → Tab1: `AppDatePicker`, Tab2: `AppTimePicker` |

### `datetime` mode özel davranışı
- Modal açılınca aktif tab = `"date"`
- `AppDatePicker.onChange` tetiklenince → 500ms sonra otomatik `"time"` tabına geç
- Kullanıcı manuel olarak `"date"` tabına dönebilir

### Timezone kaynağı
```ts
const { timezone } = useUserPreferencesStore();
```

### onChange davranışı
Picker değişince anında `onChange` tetiklenir. "Tamam" sadece modal kapatır.

### GestureHandlerRootView
Modal içinde `GestureHandlerRootView` sarmalayıcısı olacak (color picker'daki hata tekrarlanmaz).

---

## i18n Eklemeleri (components namespace)

| Key                              | EN                  | TR                   |
|----------------------------------|---------------------|----------------------|
| `dateTimePicker.titleTime`       | Select Time         | Saat Seç             |
| `dateTimePicker.titleDate`       | Select Date         | Tarih Seç            |
| `dateTimePicker.titleDatetime`   | Select Date & Time  | Tarih ve Saat Seç    |
| `dateTimePicker.done`            | Done                | Tamam                |
| `dateTimePicker.tabDate`         | Date                | Tarih                |
| `dateTimePicker.tabTime`         | Time                | Saat                 |

---

## Tamamlanan Adımlar

| # | Adım | Durum |
|---|------|-------|
| 0 | `npm install dayjs countries-and-timezones` | ✅ |
| 1 | `shared/timezone` modülü | ✅ |
| 2 | UserPreferences entity + store + DatabaseProvider | ✅ |
| 3 | `utils/dayjs.ts` + `app/_layout.tsx` import | ✅ |
| 4 | `date-time-utils.ts` | ✅ |
| 5 | `AppTab` komponenti (5 dosya) | ✅ |
| 6 | `ScrollDrum` komponenti | ✅ |
| 7 | `AppTimePicker` refactor | ✅ |
| 8 | `AppDatePicker` implement | ✅ |
| 9 | `AppDateTimePickerField` | ✅ |
| 10 | i18n strings (EN + TR) | ✅ |
| 11 | TypeScript check (sıfır hata) | ✅ |

---

## Dosya Değişim Özeti

```
npm install dayjs countries-and-timezones

utils/dayjs.ts                                              ← YENİ
app/_layout.tsx                                             ← dayjs import eklenir

shared/timezone/
  types/timezone-type.ts                                    ← YENİ
  index.ts                                                  ← YENİ

features/user-preferences/entity/user-preferences.entity.ts ← timezone alanı eklenir
stores/user-preferences.store.ts                            ← setTimezone action eklenir
db/hooks/database-provider.tsx                              ← device timezone init eklenir

components/ui/app-tab/
  index.ts                                                  ← YENİ
  app-tab.tsx                                               ← YENİ
  app-tab-list.tsx                                          ← YENİ
  app-tab-trigger.tsx                                       ← YENİ
  app-tab-panel.tsx                                         ← YENİ
  tab-context.ts                                            ← YENİ

components/ui/app-date-picker/
  scroll-drum.tsx                                           ← YENİ
  date-time-utils.ts                                        ← YENİ
  app-time-picker.tsx                                       ← REFACTOR
  app-date-picker.tsx                                       ← IMPLEMENT
  app-date-time-picker-field.tsx                            ← YENİ
  constants/ (mevcut kalır)
  utils/ (mevcut kalır)

i18n/locales/en/components.json                             ← dateTimePicker keys eklenir
i18n/locales/tr/components.json                             ← dateTimePicker keys eklenir
```

---

## Notlar

- `AppSegmented` kaldırılmaz, `AppTab` ile birlikte var olur.
- `synchronize: true` sayesinde UserPreferences migration gerekmez.
- Timezone ayarı ileride Settings ekranından `getAllTimezones()` ile seçilebilir hale getirilecek.
- Tüm picker value'ları UTC ms (milliseconds since epoch) olarak saklanır.
