import type { AssetEntity } from "@/features/asset/entity/asset.entity";
import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from "typeorm";

@Entity("image_metadata")
export class ImageMetadataEntity {
  @PrimaryColumn({ type: "uuid" })
  assetId!: string; // assets.id ile aynı değer — hem PK hem FK

  @OneToOne("AssetEntity", (a: AssetEntity) => a.imageMetadata)
  @JoinColumn({ name: "assetId" })
  asset!: AssetEntity;

  @Column({ type: "integer", nullable: true })
  width!: number | null;

  @Column({ type: "integer", nullable: true })
  height!: number | null;
}
