/**
 * Formats a date into DD/MM/YYYY HH:mm:ss format
 * @param date Optional Date object. If not provided, uses current date
 * @returns Formatted date string
 */
export function formatTimestamp(date: Date = new Date()): string {
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    const seconds = date.getSeconds().toString().padStart(2, "0");

    return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
}

/**
 * Gets current timestamp formatted as DD/MM/YYYY HH:mm:ss
 * @returns Formatted current date string
 */
export function getCurrentTimestamp(): string {
    return formatTimestamp(new Date());
}

/**
 * Gets current timestamp formatted as YYYY-MM-DDTHH:mm:ss.sssZ
 * @returns Formatted current date string
 */
export const getUTCTimestamp = (): string => {
    return new Date().toISOString();
};
