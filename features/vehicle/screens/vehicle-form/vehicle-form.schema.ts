import { BodyTypes } from "@/shared/enums/body-type";
import { FuelTypes } from "@/shared/enums/fuel-type";
import { TransmissionTypes } from "@/shared/enums/transmission-type";
import * as Yup from "yup";

const currentYear = new Date().getFullYear();

//TODO: Buradaki hata mesajları translation dosyasından alınabilir, ancak şimdilik direkt olarak yazdım.
export const vehicleFormSchema = Yup.object({
  brand: Yup.string().required("Brand is required"),
  model: Yup.string().required("Model is required"),
  year: Yup.number()
    .typeError("Enter a valid year")
    .required("Year is required")
    .min(1900, "Year must be after 1900")
    .max(currentYear + 1, `Year cannot exceed ${currentYear + 1}`),
  plate: Yup.string().required("Plate is required"),
  color: Yup.string().required("Color is required"),
  transmissionType: Yup.string()
    .oneOf(Object.values(TransmissionTypes), "Select a transmission type")
    .required("Select a transmission type"),
  bodyType: Yup.string()
    .oneOf(Object.values(BodyTypes), "Select a body type")
    .required("Select a body type"),
  fuelType: Yup.string()
    .oneOf(Object.values(FuelTypes), "Select a fuel type")
    .required("Select a fuel type"),
  purchaseAmount: Yup.number()
    .typeError("Enter a valid amount")
    .min(0)
    .optional(),
  purchaseCurrency: Yup.string().optional(),
  purchaseDate: Yup.number().nullable().optional(),
});
