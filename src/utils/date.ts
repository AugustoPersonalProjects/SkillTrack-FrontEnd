// A API envia datas no formato "yyyy-MM-dd". new Date("yyyy-MM-dd") interpreta como
// meia-noite em UTC, o que no Brasil (UTC-3) volta um dia; aqui a data é lida no fuso local.
export function parseLocalDate(date: string): Date {
  const [year, month, day] = date.split("-").map(Number);
  return new Date(year, month - 1, day);
}

// Data de hoje no formato "yyyy-MM-dd", no fuso local
export function todayLocalISO(): string {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}
