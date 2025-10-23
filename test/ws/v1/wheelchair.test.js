import {io} from 'socket.io-client';
import httpServer from '#src/wsInit.js';
import dotenv from 'dotenv';
import Test from 'supertest/lib/test';

dotenv.config();

const PORT = process.env.SERVER_PORT;
const HOST = process.env.SERVER_HOSTNAME;

let socket;

beforeAll((done)=>{
	httpServer.listen(PORT, HOST, ()=> {
		socket = new io(`http://${HOST}:${PORT}`);
		socket.on('connect', done)
	})
})

afterAll(()=>{
	socket.close();
	httpServer.close();
})

describe('testing wheelchair websocket control over velocity', ()=>{
	test('listen to wheelchair velocity change', async ()=> {
		socket.on('wheelchair:velocity', (data)=> {
			expect(data).toMatchObject({
				linear: expect.any(Number),
				angular: expect.any(Number),
				meta: expect.any(Object)
			})
			expect(data).toHaveProperty('meta.timestamp');
			expect(data).toHaveProperty('meta.source');
		})
	})
	test('wheelchair velocity control', async ()=> {
		socket.emit('wheelchair:velocity', {linear: 0.5, angular:0.5})
	})
})