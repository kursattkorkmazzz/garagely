import { AssetEntity } from "@/features/asset/entity/asset.entity";
import { Column, Entity, JoinColumn, OneToOne } from "typeorm";

@Entity("image_metadata")
export class ImageMetadataEntity {
  @Column("uuid")
  assetId!: string; // assets.id ile aynı değer

  @OneToOne(() => AssetEntity, (a) => a.imageMetadata)
  @JoinColumn({ name: "assetId" }) // FK burada — metadata tarafında
  asset!: AssetEntity;

  @Column({ type: "integer", nullable: true })
  width!: number | null;

  @Column({ type: "integer", nullable: true })
  height!: number | null;
}
