export const GHS = (n: number | string | null | undefined) => {
  const v = Number(n ?? 0);
  return `¢${v.toFixed(2)}`;
};

export function genRefCode(): string {
  const letters = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const numbers = "23456789";
  const combined = `${letters}${numbers}`;

  const chars = [
    letters[Math.floor(Math.random() * letters.length)],
    numbers[Math.floor(Math.random() * numbers.length)],
  ];

  for (let i = chars.length; i < 6; i++) {
    chars.push(combined[Math.floor(Math.random() * combined.length)]);
  }

  for (let i = chars.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }

  return chars.join("");
}

