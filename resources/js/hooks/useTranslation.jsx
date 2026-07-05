import { usePage } from '@inertiajs/react';
import { useCallback } from 'react';

export function useTranslation() {
    const { translations, locale } = usePage().props;

    const t = useCallback((key, replacements = {}) => {
        const [namespace, ...keyParts] = key.split('.');
        const translationKey = keyParts.join('.');

        const value = translations?.[namespace]?.[translationKey];

        if (!value) {
            return key;
        }

        if (Object.keys(replacements).length === 0) {
            return value;
        }

        return Object.entries(replacements).reduce(
            (str, [k, v]) => str.replace(`:${k}`, v),
            value,
        );
    }, [translations]);

    return { t, locale };
}
