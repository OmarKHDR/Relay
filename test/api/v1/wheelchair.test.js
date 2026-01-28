import request from 'supertest';
import app from '#servers/expressServer.js';



describe('testing wheelchair api endpoints of velocity', () => {
	test('set velocity in wheelchair topic', async ()=> {
		const payload = {linear: 0.5, angular: 0.4};
		const res = await request(app)
		.post('/api/v1/wheelchair/velocity')
		.send(payload);
		expect(res.status).toBe(200);
		expect(res.header['content-type']).toMatch(/application\/json/);
		expect(res.body.status).toBe('success')
		expect(res.body).toMatchObject({
			status: expect.any(String),
			data: expect.any(Array),
			meta: expect.any(Object),
		});
	})

	test('get velocity from wheelchair topic', async ()=> {
		const res = await request(app)
		.get('/api/v1/wheelchair/velocity')
		expect(res.status).toBe(200);
		expect(res.header['content-type']).toMatch(/application\/json/);
		expect(res.body.status).toBe('success')
		expect(res.body).toMatchObject({
			status: expect.any(String),
			data: expect.any(Array),
			meta: expect.any(Object),
		});
	})
})
