import { DataSource } from "typeorm";

const SqliteDataSource = new DataSource({
  type: "expo",
  driver: require("expo-sqlite"),
  database: "garagely.db",
  logging: false,

  // Migration & Metadata Settings
  migrations: ["./migrations/**/*{.js,.ts}"],
  migrationsTableName: "garagely_migrations",
  migrationsRun: true,
  metadataTableName: "garagely_metadata",

  // Null Handling

  invalidWhereValuesBehavior: {
    null: "sql-null",
    undefined: "ignore",
  },

  entities: [],
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
