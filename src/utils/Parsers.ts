class Parser {
    parseDateSafe = (s: string): Date | null => {
        const d = new Date(s);
        return isNaN(d.getTime()) ? null : d;
    };
}

export default Parser;