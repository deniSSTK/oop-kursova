export const parseDateSafe = (s: string): Date | null => {
    const d = new Date(s);
    return isNaN(d.getTime()) ? null : d;
};