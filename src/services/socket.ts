import { io } from "socket.io-client";

const WS_URL = import.meta.env.VITE_WS_URL;

export const socket = io(WS_URL, { autoConnect: false });
