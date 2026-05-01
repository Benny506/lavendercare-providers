export const dmTopic = (idA, idB) => {
    if (!idA || !idB) return null;
    const [a, b] = [idA, idB].sort();
    return `dm:${a}:${b}`;
}
