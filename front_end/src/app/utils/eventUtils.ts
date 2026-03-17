export function getEventStatus(eventDateString: string): "upcoming" | "completed" {
    if (!eventDateString) return "upcoming";

    // Robustly parse YYYY-MM-DD into a local date to avoid UTC offset shifting the day
    const [year, month, day] = eventDateString.split("-").map(Number);
    if (!year || !month || !day) return "upcoming";

    const eventDate = new Date(year, month - 1, day);
    eventDate.setHours(0, 0, 0, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (eventDate < today) {
        return "completed";
    }

    return "upcoming";
}
