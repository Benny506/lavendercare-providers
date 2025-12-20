// src/utils/dm.js
export function dmTopic(idA, idB) {
  // stable order so both sides compute the same topic
  const [a, b] = [idA, idB].sort();
  return `dm:${a}:${b}`;
}
