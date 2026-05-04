import { BodyTypes } from "@/shared/enums/body-type";
import { FuelTypes } from "@/shared/enums/fuel-type";
import { TransmissionTypes } from "@/shared/enums/transmission-type";
import * as Yup from "yup";

type T = (key: string, options?: Record<string, unknown>) => string;

export const createVehicleFormSchema = (t: T) => {
  const currentYear = new Date().getFullYear();

  return Yup.object({
    brand: Yup.string().required(t("errors.brand")),
    model: Yup.string().required(t("errors.model")),
    year: Yup.number()
      .typeError(t("errors.year"))
      .required(t("errors.year"))
      .min(1900, t("errors.yearMin", { min: 1900 }))
      .max(currentYear + 1, t("errors.yearMax", { max: currentYear + 1 })),
    plate: Yup.string().required(t("errors.plate")),
    color: Yup.string()
      .required(t("errors.color"))
      .matches(/^#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$/, t("errors.colorHex")),
    transmissionType: Yup.string()
      .oneOf(Object.values(TransmissionTypes), t("errors.transmissionType"))
      .required(t("errors.transmissionType")),
    bodyType: Yup.string()
      .oneOf(Object.values(BodyTypes), t("errors.bodyType"))
      .required(t("errors.bodyType")),
    fuelType: Yup.string()
      .oneOf(Object.values(FuelTypes), t("errors.fuelType"))
      .required(t("errors.fuelType")),
    purchaseAmount: Yup.number()
      .typeError(t("errors.purchaseAmountInvalid"))
      .min(0, t("errors.purchaseAmountMin"))
      .optional(),
    purchaseCurrency: Yup.string().optional(),
    purchaseDate: Yup.number().nullable().optional(),
  });
};
