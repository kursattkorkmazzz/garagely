import * as Yup from "yup";

export const createStationFormSchema = (
  t: (key: string, opts?: any) => string,
) =>
  Yup.object({
    name: Yup.string().trim().required(t("errors.name")),
    type: Yup.string().required(t("errors.type")),
    brand: Yup.string().nullable(),
    address: Yup.string().nullable(),
    city: Yup.string().nullable(),
    latitude: Yup.string()
      .nullable()
      .test("lat-range", t("errors.latitudeRange"), (value) => {
        if (!value) return true;
        const n = Number(value);
        return !Number.isNaN(n) && n >= -90 && n <= 90;
      }),
    longitude: Yup.string()
      .nullable()
      .test("lng-range", t("errors.longitudeRange"), (value) => {
        if (!value) return true;
        const n = Number(value);
        return !Number.isNaN(n) && n >= -180 && n <= 180;
      }),
    phone: Yup.string().nullable(),
    website: Yup.string().nullable(),
    notes: Yup.string().nullable(),
    rating: Yup.number()
      .nullable()
      .test("rating-range", t("errors.ratingRange"), (value) => {
        if (value === null || value === undefined) return true;
        return Number.isInteger(value) && value >= 1 && value <= 5;
      }),
    isFavorite: Yup.boolean(),
  });
