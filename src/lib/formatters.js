import { format, formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

export function formatDate(date, pattern = "d MMMM yyyy") {
  if (!date) return "";
  return format(new Date(date), pattern, { locale: fr });
}

export function formatDateShort(date) {
  return formatDate(date, "dd/MM/yyyy");
}

export function formatDateTime(date) {
  return formatDate(date, "d MMM yyyy '·' HH:mm");
}

export function formatRelative(date) {
  if (!date) return "";
  return formatDistanceToNow(new Date(date), { addSuffix: true, locale: fr });
}

export function formatAmount(amount, currency = "XAF") {
  if (amount === null || amount === undefined) return "—";
  return `${new Intl.NumberFormat("fr-FR").format(amount)} ${currency}`;
}

export function initials(firstName = "", lastName = "") {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

export function truncate(text = "", max = 140) {
  if (!text) return "";
  return text.length > max ? `${text.slice(0, max).trim()}…` : text;
}
