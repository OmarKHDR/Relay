export interface WSCallback {
    publish: publisher[];
    subscribe: subscriber[];
    broadcast: broadcast[];
}

// the callback gives the message then sends it
export type publisher = {
    eventName: string;
    callback: Function;
};

// the callback does the handler of incomming messages
export type subscriber = {
    eventName: string;
    callback: Function;
};


// the callback takes the io object to broadcast using it
export type broadcast = {
	callback: Function; 
}