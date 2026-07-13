function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export default function HighlightText({ text, query, className = '' }) {
    if (!query || !text) {
        return <span className={className}>{text}</span>;
    }

    const parts = text.split(new RegExp(`(${escapeRegExp(query)})`, 'gi'));

    return (
        <span className={className}>
            {parts.map((part, i) =>
                part.toLowerCase() === query.toLowerCase()
                    ? <mark key={i} className="rounded bg-amber-200 px-0.5 text-amber-900 dark:bg-amber-500/30 dark:text-amber-200">{part}</mark>
                    : part
            )}
        </span>
    );
}
