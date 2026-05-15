import * as irController from '#modules/ir/ir.controller.js';

export const irCallback = {
    publish: [],
    subscribe: [
        {
            eventName: 'ir:frame',
            callback: (socket, eventName, io) => {
                socket.on(eventName, (frame) => irController.handleFrame(socket, frame, io));
            },
        },
    ],
    broadcast: [],
    cleanup: () => {},
};
