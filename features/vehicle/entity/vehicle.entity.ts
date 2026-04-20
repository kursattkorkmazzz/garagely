import { BaseEntity } from "@/db/entity/base.entity";
import { type BodyType } from "@/shared/enums/body-type";
import { type FuelType } from "@/shared/enums/fuel-type";
import { type TransmissionType } from "@/shared/enums/transmission-type";
import { Money } from "@/shared/money";
import { Column, Entity } from "typeorm";

@Entity("vehicles")
export class Vehicle extends BaseEntity {
  @Column({ type: "text" })
  brand!: string;

  @Column({ type: "text" })
  model!: string;

  @Column({ type: "integer" })
  year!: number;

  @Column({ type: "text", unique: true })
  plate!: string;

  @Column({ type: "text" })
  color!: string;

  @Column({ type: "text" })
  transmissionType!: TransmissionType;

  @Column({ type: "text" })
  bodyType!: BodyType;

  @Column({ type: "text" })
  fuelType!: FuelType;

  @Column(() => Money, { prefix: "purchase" })
  purchase?: Money;

  @Column({ type: "integer", nullable: true })
  purchaseDate?: number;
}
