function normaliseYear(value) {
  const text = String(value || "").trim();

  if (/^20\d{2}$/.test(text)) {
    return Number(text);
  }

  if (/^\d{2}$/.test(text)) {
    return Number(`20${text}`);
  }

  return null;
}

export function getRingYear(bird) {
  const savedYear = normaliseYear(bird?.year);

  if (savedYear) {
    return savedYear;
  }

  const ringNumber = String(bird?.ringNumber || "").toUpperCase();
  const fourDigitMatch = ringNumber.match(/(?:^|\D)(20\d{2})(?:\D|$)/);

  if (fourDigitMatch) {
    return Number(fourDigitMatch[1]);
  }

  const twoDigitMatch = ringNumber.match(/^[A-Z]{1,4}\s?(\d{2})(?:\D|$)/);

  return twoDigitMatch ? Number(`20${twoDigitMatch[1]}`) : null;
}

export function calculateBirdAge(bird, currentDate = new Date()) {
  const ringYear = getRingYear(bird);

  if (!ringYear) {
    return {
      ringYear: null,
      ageInYears: null,
      ageCategory: "Age Unknown",
    };
  }

  const ageInYears = currentDate.getFullYear() - ringYear;

  if (ageInYears < 0) {
    return {
      ringYear,
      ageInYears,
      ageCategory: "Next Season Ring",
    };
  }

  if (ageInYears === 0) {
    return {
      ringYear,
      ageInYears,
      ageCategory: "Young Bird",
    };
  }

  if (ageInYears === 1) {
    return {
      ringYear,
      ageInYears,
      ageCategory: "Yearling",
    };
  }

  return {
    ringYear,
    ageInYears,
    ageCategory: `${ageInYears} Year Old`,
  };
}

export function withCalculatedAge(bird, currentDate = new Date()) {
  return {
    ...bird,
    ...calculateBirdAge(bird, currentDate),
  };
}
