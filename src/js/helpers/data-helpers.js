export const filled = (content) => {
    if (content === undefined || content === null) {
        return false;
    }

    if (typeof content === 'string') {
        return content.trim().length > 0;
    }

    if (typeof content === 'object') {
        return Array.isArray(content) ? content.length > 0 : Object.entries(content)?.length > 0;
    }

    return true;
}
