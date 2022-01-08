import { writable } from "svelte/store";

export const requestCounter = writable(0);
export const errorMessage = writable("");
