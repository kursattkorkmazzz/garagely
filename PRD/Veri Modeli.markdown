```mermaid
erDiagram

    %% USER & PREFERENCES ──────────────────────────────
    users {
        string id PK
        string full_name
        string email
        timestamp created_at
        timestamp updated_at
    }

    user_preferences {
        string id PK
        string user_id FK
        string locale
        string preferred_distance_unit
        string preferred_currency
        string theme
        timestamp created_at
        timestamp updated_at
    }

    %% Fuel Station ──────────────────────

    fuel_station_brand {
        string id PK
        string name
        string logo_url
        string country
        string brand_color
        boolean is_system
        boolean is_active
    }

    fuel_station_fuel {
        string id PK
        string type
    }

    fuel_logs {
        string id PK
        string vehicle_id FK
        string fuel_station_brand_id FK
        string fuel_station_name
        string fuel_station_fuel_id FK
        timestamp date
        number odometer_km
        number amount "KW for electricity Liter for others"
        number unit_price
        number total_cost
        boolean is_full_tank
        timestamp created_at
    }


    %% Vehicle ──────────────────────

    vehicle_brands {
        string id PK
        string name
        string logo_url
        boolean is_system
    }

    vehicle_models {
        string id PK
        string brand_id FK
        string name
        string cover_photo_url
        number year
        boolean is_system
    }

    vehicle_transmission_types {
        string id PK
        string type
        string icon
    }

    vehicle_body_types {
        string id PK
        string type
        string icon
    }

    vehicle_fuel_types {
        string id PK
        string type
        string icon
        boolean is_active
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
        string cover_photo_url

        timestamp purchase_date
        number purchase_price
        number purchase_km

        timestamp created_at
        timestamp updated_at
    }

    %% Expenses ──────────────────────

    expense_categories {
        string id PK
        string type "maintenance | repair | cleaning | otopark | accessory | other"
        string icon
        string color
        boolean is_active
    }

    expense_logs {
        string id PK
        string vehicle_id FK
        string expense_category_id FK
        timestamp date
        number odometer_km
        string title
        string description
        number amount
        string vendor_name
        number next_service_km
        timestamp next_service_date
        timestamp created_at
    }



    %% Insurance ──────────────

    insurance_companies {
        string id PK
        string name
        string logo_url
        string phone
        string country
        string location
        boolean is_system
        boolean is_active
    }

    insurance_types {
        string id PK
        string type "Zorunlu Trafik Sigortası, Kasko Sigortası"
        string description
        boolean is_system
    }

    insurance_records {
        string id PK
        string vehicle_id FK
        string insurance_company_id FK
        string name
        string policy_no
        timestamp start_date
        timestamp end_date
        boolean is_active
        timestamp created_at
    }

    %%  Inspection ──────────────

    inspection_companies {
        string id PK
        string name
        string logo_url
        string phone
        string country
        string location
        boolean is_active
    }

    inspection_types {
        string id PK
        string type "Zorunlu Muayene, Periyodik Muayene etc."
        string description
        boolean is_system
    }

    inspection_records {
        string id PK
        string vehicle_id FK
        string inspection_company_id FK
        timestamp inspection_date
        timestamp expiry_date
        string cost_id
        timestamp created_at
    }


    %% Documents ─────────────────────

    documents {
        string id PK
        string user_id FK
        string title
        string storage_path
        string url
        number document_size
        string mime_type
        timestamp uploaded_at
    }

    document_relations {
        string id PK
        string document_id FK
        string entity_id FK
        string entity_type "expense, insurance, inspection, maintenance, profile etc."
    }



    %% Cost & Currency ─────────────────────

    currency{
        string id PK
        string type "USD, TL etc"
        boolean is_system
    }

    cost {
        string id PK
        number amount
        string currency_id
        timestamp created_at
    }


    %% Units ─────────────────────

    units {
        string id PK
        string unit_type "distance, volume, area"
        string unit "m,km,L,galon, m^3 etc"
        string value
    }

    %% User Notes ─────────────────────

    user_note {
        string id PK
        string entity_type
        string entity_id FK
        string note_path "Note path at the storage"
        string note_url "Note url for get the text"
    }

```
