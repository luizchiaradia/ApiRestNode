import {it, expect, beforeAll, afterAll, describe, beforeEach} from 'vitest'
import request from 'supertest'
import {app} from '../src/app'
import {execSync} from 'child_process'

describe('Transactions routes', () => {
    beforeAll(async () => {
        await app.ready()
    })

    afterAll(async () => {
        await app.close()
    })

    beforeEach(() => {
        execSync('npx knex migrate:rollback --all')
        execSync('npx knex migrate:latest')
    })

    it('should be able to create a new transaction', async () => {
        await request(app.server)
        .post('/transactions')
        .send({
            title: 'New transaction',
            amount: 5000,
            type: 'credit',
        })
        .expect(201)
    })

    it('should be able to list all transactions', async () => {
        const createTrasactionResponse =  await request(app.server)
        .post('/transactions')
        .send({
            title: 'New transaction',
            amount: 5000,
            type: 'credit',
        })
        const cookies = createTrasactionResponse.get('Set-Cookie')
        if (cookies) {
            const listTransactionsResponse = await request(app.server)
            .get('/transactions')
            .set('Cookie', cookies)
            .expect(200)

            expect(listTransactionsResponse.body.transactions).toEqual(
                [
                    expect.objectContaining({
                        title: 'New transaction',
                        amount: 5000,
                    })
                ]
            )
        }
    })
})