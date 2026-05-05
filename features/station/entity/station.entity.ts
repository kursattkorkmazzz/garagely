import { BaseEntity } from "@/db/entity/base.entity";
import { AssetEntity } from "@/features/asset/entity/asset.entity";
import { StationType } from "@/features/station/types/station-type";
import { Tag } from "@/features/tag/entity/tag.entity";
import {
  Column,
  Entity,
  Index,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
} from "typeorm";

@Entity("stations")
export class Station extends BaseEntity {
  @Column({ type: "text" })
  name!: string;

  @Index()
  @Column({ type: "text" })
  type!: StationType;

  @Column({ type: "text", nullable: true })
  brand?: string | null;

  @Column({ type: "text", nullable: true })
  address?: string | null;

  @Column({ type: "text", nullable: true })
  city?: string | null;

  @Column({ type: "real", nullable: true })
  latitude?: number | null;

  @Column({ type: "real", nullable: true })
  longitude?: number | null;

  @Column({ type: "text", nullable: true })
  phone?: string | null;

  @Column({ type: "text", nullable: true })
  website?: string | null;

  @Column({ type: "text", nullable: true })
  notes?: string | null;

  @Column({ type: "integer", nullable: true })
  rating?: number | null;

  @Column({ type: "boolean", default: false })
  isFavorite!: boolean;

  @Column({ type: "text", nullable: true })
  coverAssetId?: string | null;

  @ManyToOne(() => AssetEntity, { nullable: true, onDelete: "SET NULL", eager: false })
  @JoinColumn({ name: "coverAssetId" })
  cover?: AssetEntity | null;

  @ManyToMany(() => AssetEntity, { eager: false })
  @JoinTable({
    name: "station_media_assets",
    joinColumn: { name: "stationId", referencedColumnName: "id" },
    inverseJoinColumn: { name: "assetId", referencedColumnName: "id" },
  })
  media?: AssetEntity[];

  @ManyToMany(() => Tag, { eager: false })
  @JoinTable({
    name: "station_tags_on_stations",
    joinColumn: { name: "stationId", referencedColumnName: "id" },
    inverseJoinColumn: { name: "tagId", referencedColumnName: "id" },
  })
  tags?: Tag[];
}
