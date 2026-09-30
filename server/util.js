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

// Durstenfeld shuffle (returns a new array)
export function shuffle(arr) {
    const ans = [...arr];
    for (let i = ans.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [ans[i], ans[j]] = [ans[j], ans[i]];
    }
    return ans;
}
