import { ObjectId } from "mongodb";

// Error with an HTTP status that the error handler in server.js will send to the client
export function httpError(status, message) {
    const err = new Error(message);
    err.status = status;
    err.expose = true;
    return err;
}

// Parse a hex id string, responding 400 instead of crashing on malformed ids
export function toObjectId(id) {
    if (!ObjectId.isValid(id)) throw httpError(400, `Invalid id: ${id}`);
    return ObjectId.createFromHexString(String(id));
}

// Deterministic random number generator: the same seed always gives the same sequence in [0, 1).
// cyrb53-style string hash feeding mulberry32.
export function seededRandom(seed) {
    let h1 = 0xdeadbeef, h2 = 0x41c6ce57;
    for (let i = 0; i < seed.length; i++) {
        const ch = seed.charCodeAt(i);
        h1 = Math.imul(h1 ^ ch, 2654435761);
        h2 = Math.imul(h2 ^ ch, 1597334677);
    }
    let state = (Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909)) >>> 0;

    return () => {
        state = (state + 0x6d2b79f5) >>> 0;
        let t = state;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

// Durstenfeld shuffle (returns a new array). Pass a seeded `random` for repeatable results.
export function shuffle(arr, random = Math.random) {
    const ans = [...arr];
    for (let i = ans.length - 1; i > 0; i--) {
        const j = Math.floor(random() * (i + 1));
        [ans[i], ans[j]] = [ans[j], ans[i]];
    }
    return ans;
}
