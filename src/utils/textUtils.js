export const normalizeText = (text) => {
  if (!text) return "";
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
};

export const includesSearch = (target, search) => {
  if (!target || !search) return false;
  return normalizeText(target).includes(normalizeText(search));
};
