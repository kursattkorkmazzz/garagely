import "dotenv/config";
import { db } from "../providers/firebase/firebase.provider";
import {
  transmissionTypesSeed,
  bodyTypesSeed,
  fuelTypesSeed,
  brandsSeed,
  modelsSeed,
} from "./data";

const COLLECTIONS = {
  TRANSMISSION_TYPES: "vehicle_transmission_types",
  BODY_TYPES: "vehicle_body_types",
  FUEL_TYPES: "vehicle_fuel_types",
  BRANDS: "vehicle_brands",
  MODELS: "vehicle_models",
};

async function seedCollection<T extends { id: string }>(
  collectionName: string,
  data: T[],
): Promise<void> {
  console.log(`Seeding ${collectionName}...`);

  const batch = db.batch();

  for (const item of data) {
    const { id, ...rest } = item;
    const docRef = db.collection(collectionName).doc(id);
    batch.set(docRef, rest, { merge: true });
  }

  await batch.commit();
  console.log(`✓ Seeded ${data.length} documents in ${collectionName}`);
}

async function seed(): Promise<void> {
  console.log("Starting database seed...\n");

  try {
    // Seed lookup tables
    await seedCollection(COLLECTIONS.TRANSMISSION_TYPES, transmissionTypesSeed);
    await seedCollection(COLLECTIONS.BODY_TYPES, bodyTypesSeed);
    await seedCollection(COLLECTIONS.FUEL_TYPES, fuelTypesSeed);

    // Seed brands and models
    await seedCollection(COLLECTIONS.BRANDS, brandsSeed);
    await seedCollection(COLLECTIONS.MODELS, modelsSeed);

    console.log("\n✓ Database seed completed successfully!");
  } catch (error) {
    console.error("\n✗ Database seed failed:", error);
    process.exit(1);
  }
}

seed()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Unexpected error:", error);
    process.exit(1);
  });
