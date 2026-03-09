export const isValidUrl = (urlString: string): boolean => {
    const urlPattern = new RegExp(
        '^(https?:\\/\\/)?' + // validate protocol
        '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // validate domain name
        '((\\d{1,3}\\.){3}\\d{1,3}))' + // validate OR ip (v4) address
        '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // validate port and path
        '(\\?[;&a-z\\d%_.~+=-]*)?' + // validate query string
        '(\\#[-a-z\\d_]*)?$', // validate fragment locator
        'i'
    );
    return !!urlPattern.test(urlString);
};

export const generateShortCode = (): string => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
};

// Also export a helper to append https:// if a user types a raw domain like google.com
export const normalizeUrl = (url: string): string => {
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
        return 'https://' + url;
    }
    return url;
};
