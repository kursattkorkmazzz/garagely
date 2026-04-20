import { type CurrencyType } from "@/shared/currency";
import { Column } from "typeorm";

export class Money {
  @Column({ type: "integer", nullable: true })
  amount?: number;

  @Column({ type: "text", nullable: true })
  currency?: CurrencyType;
}
