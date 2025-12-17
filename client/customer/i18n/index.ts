
import en from "./en";
import am from "./am";
import ti from "./ti";
import om from "./om";

export const translations = { en, am, ti, om };
export type Language = keyof typeof translations;
