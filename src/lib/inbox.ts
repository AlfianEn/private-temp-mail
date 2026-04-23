const INBOX_DOMAIN = process.env.INBOX_DOMAIN || "mail.example.com";

const FIRST_NAMES = [
  "andi", "bima", "dina", "fajar", "nina", "raka", "sinta", "tiara", "reza", "putri",
  "arya", "dewi", "faris", "hana", "indra", "jihan", "kevin", "lina", "mira", "nanda",
];

const LAST_NAMES = [
  "saputra", "pratama", "wijaya", "maulana", "permata", "ramadhan", "kencana", "nugraha", "maharani", "utama",
  "anindya", "febriansyah", "rahma", "kirana", "syahputra", "mahendra", "anggraini", "cahya", "putra", "lestari",
];

function randomItem(items: string[]) {
  return items[Math.floor(Math.random() * items.length)] || "user";
}

function randomDigits(length = 3) {
  let out = "";
  for (let i = 0; i < length; i += 1) {
    out += Math.floor(Math.random() * 10).toString();
  }
  return out;
}

export function generateInboxAddress() {
  const firstName = randomItem(FIRST_NAMES);
  const lastName = randomItem(LAST_NAMES);
  return `${firstName}.${lastName}${randomDigits(3)}@${INBOX_DOMAIN}`;
}

export { INBOX_DOMAIN };
