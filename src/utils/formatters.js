export const formatLabel = (str) => {
    if (!str) return "";
    return str
        .toString()
        .replace(/_/g, " ")
        .toLowerCase()
        .split(" ")
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
};
