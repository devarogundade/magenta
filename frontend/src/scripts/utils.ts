import type { ReadableDate } from './../types';

export const toDate = (timestamp: number): ReadableDate => {
    const date = new Date(timestamp * 1000);

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    const month = months[date.getMonth()];
    const day = date.getDate();
    const hour = date.getHours();
    const min = date.getMinutes();
    const year = date.getFullYear();

    return { month, day, hour, min, year };
};

export function fineHash(hash: string) {
    if (!hash || hash.length < 30) return hash;
    return hash.substring(0, 10) + '...';
}

export function fineId(id: string) {
    if (!id || id.length < 16) return id;
    return id.substring(0, 16) + '...' + id.substring(id.length - 2, id.length);
}