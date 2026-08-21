// Instance Socket.IO partagée (initialisée dans index.js, utilisée par les routes chat).
let io = null;

export const setIo = (instance) => {
  io = instance;
};

export const getIo = () => io;