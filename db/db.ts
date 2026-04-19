import { UserPreferences } from "@/features/user-preferences/entity/user-preferences.entity";
import { DataSource } from "typeorm";

const SqliteDataSource = new DataSource({
  type: "expo",
  driver: require("expo-sqlite"),
  database: "garagely.db",
  logging: false,

  synchronize: true,

  migrations: [],
  migrationsTableName: "garagely_migrations",
  migrationsRun: true,
  metadataTableName: "garagely_metadata",

  invalidWhereValuesBehavior: {
    null: "sql-null",
    undefined: "ignore",
  },

  entities: [UserPreferences],
});

export async function GetGaragelyDatabase() {
  if (!SqliteDataSource.isInitialized) {
    await SqliteDataSource.initialize();
  }
  return SqliteDataSource;
}

export async function initializeDatabase() {
  if (SqliteDataSource.isInitialized) return;
  await SqliteDataSource.initialize();
}
