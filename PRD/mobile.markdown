- [x] Tema ayarlanacak. Tweakcn
- [x] Component Kütüphanesi oluşturulacak.
- [x] Ekranlar tasarlanmaya başlacak
  - [x] Giriş Yap
  - [x] Kayıt Ol
  - [x] Backend hata kodları ile localization i18n mesajları bastıracak map'leri hazırla.





Vehicle Backend Prompt



``````markdown

```
		vehicle_brands {
        string id PK
        string name
        string logo_url
        boolean is_system
        bool is_active
    }

    vehicle_models {
        string id PK
        string brand_id FK
        string name
        string cover_photo_url
        number year
        boolean is_system
        bool is_active
    }

    vehicle_transmission_types {
        string id PK
        string type
        string icon
        bool is_active
    }

    vehicle_body_types {
        string id PK
        string type
        string icon
        bool is_active
    }

    vehicle_fuel_types {
        string id PK
        string type
        string icon
        bool is_active
    }

    vehicles {
        string id PK
        string user_id FK
        string vehicle_fuel_type_id FK
        string vehicle_transmission_type_id FK
        string vehicle_body_type_id FK

        string vehicle_brand_id FK
        string vehicle_model_id FK

        string color
        string plate
        string vin
        number current_km
        string cover_photo_document_id

        timestamp purchase_date
        number purchase_price
        number purchase_km

        timestamp created_at
        timestamp updated_at
    }
````

The system must support both predefined (system) brands and models and user-created models.

1️⃣ Predefined (System) Data

The system will be seeded with predefined vehicle brands and models.

These records must have:

is_system = true

Users must be able to select these predefined brands and models when creating a vehicle.

2️⃣ User-Created Models

If a user selects a brand but cannot find their vehicle model:

They should be able to create a new model.

This new model must:

Be linked to the selected brand

Have is_system = false

Be available for future selections

3️⃣ Listing Logic

When listing brands:

Return only is_system = true brands by default.

When listing models for a selected brand:

Return:

All is_system = true models

Optionally include user-created models

Order results:

System models first

User-created models after

4️⃣ Data Integrity Rules

To prevent duplicate models:

Add a unique constraint:

Unique (brand_id, LOWER(name), year)

This ensures:

No duplicate models under the same brand (case-insensitive)

Avoids repeated user submissions of identical models

5️⃣ Vehicle Creation Flow
When creating a vehicle:

User selects:

Brand

Model

Transmission type

Body type

Fuel type

If the model does not exist:

Create a new vehicle_models record

Then create the vehicles record

NOTE: The ICON field will be lucide icon name.
NOTE: You can create entity_type for documents.
NOTE: Event is_active false, return the data because we will handle at UI. Like disabled etc.


``````

