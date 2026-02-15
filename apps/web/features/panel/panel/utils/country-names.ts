const COUNTRY_NAMES: Record<string, string> = {
    AF: "Afghanistan", AL: "Albania", DZ: "Algeria", AD: "Andorra", AO: "Angola",
    AR: "Argentina", AM: "Armenia", AU: "Australia", AT: "Austria", AZ: "Azerbaijan",
    BS: "Bahamas", BH: "Bahrain", BD: "Bangladesh", BB: "Barbados", BY: "Belarus",
    BE: "Belgium", BZ: "Belize", BJ: "Benin", BT: "Bhutan", BO: "Bolivia",
    BA: "Bosnia and Herzegovina", BW: "Botswana", BR: "Brazil", BN: "Brunei", BG: "Bulgaria",
    CA: "Canada", CL: "Chile", CN: "China", CO: "Colombia", CR: "Costa Rica",
    HR: "Croatia", CU: "Cuba", CY: "Cyprus", CZ: "Czech Republic", DK: "Denmark",
    DO: "Dominican Republic", EC: "Ecuador", EG: "Egypt", SV: "El Salvador", EE: "Estonia",
    ET: "Ethiopia", FI: "Finland", FR: "France", GE: "Georgia", DE: "Germany",
    GH: "Ghana", GR: "Greece", GT: "Guatemala", HN: "Honduras", HK: "Hong Kong",
    HU: "Hungary", IS: "Iceland", IN: "India", ID: "Indonesia", IR: "Iran",
    IQ: "Iraq", IE: "Ireland", IL: "Israel", IT: "Italy", JM: "Jamaica",
    JP: "Japan", JO: "Jordan", KZ: "Kazakhstan", KE: "Kenya", KR: "South Korea",
    KW: "Kuwait", KG: "Kyrgyzstan", LA: "Laos", LV: "Latvia", LB: "Lebanon",
    LY: "Libya", LT: "Lithuania", LU: "Luxembourg", MO: "Macao", MK: "North Macedonia",
    MY: "Malaysia", MV: "Maldives", MT: "Malta", MX: "Mexico", MD: "Moldova",
    MC: "Monaco", MN: "Mongolia", ME: "Montenegro", MA: "Morocco", MZ: "Mozambique",
    MM: "Myanmar", NP: "Nepal", NL: "Netherlands", NZ: "New Zealand", NI: "Nicaragua",
    NG: "Nigeria", NO: "Norway", OM: "Oman", PK: "Pakistan", PA: "Panama",
    PY: "Paraguay", PE: "Peru", PH: "Philippines", PL: "Poland", PT: "Portugal",
    QA: "Qatar", RO: "Romania", RU: "Russia", SA: "Saudi Arabia", RS: "Serbia",
    SG: "Singapore", SK: "Slovakia", SI: "Slovenia", ZA: "South Africa", ES: "Spain",
    LK: "Sri Lanka", SD: "Sudan", SE: "Sweden", CH: "Switzerland", SY: "Syria",
    TW: "Taiwan", TJ: "Tajikistan", TZ: "Tanzania", TH: "Thailand", TR: "Turkey",
    TM: "Turkmenistan", UA: "Ukraine", AE: "United Arab Emirates", GB: "United Kingdom",
    US: "United States", UY: "Uruguay", UZ: "Uzbekistan", VE: "Venezuela", VN: "Vietnam",
    YE: "Yemen", ZM: "Zambia", ZW: "Zimbabwe",
};

export function countryCodeToName(code: string | undefined | null): string {
    const c = String(code ?? "").trim().toUpperCase();
    if (!c) return "";
    return COUNTRY_NAMES[c] ?? c;
}
