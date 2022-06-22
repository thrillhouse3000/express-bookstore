process.env.NODE_ENV = 'test';

const request = require('supertest');
const app = require('../app');
const db = require('../db');
const Book = require('../models/book');

describe("/books route tests", () => {
    beforeAll(async () => {
        await db.query(
            `CREATE TABLE books (
            isbn TEXT PRIMARY KEY,
            amazon_url TEXT,
            author TEXT,
            language TEXT, 
            pages INTEGER,
            publisher TEXT,
            title TEXT, 
            year INTEGER)`
        );
    })

    beforeEach(async () => {
        await db.query(`DELETE FROM books`);

        book1 = await Book.create(
            {
                "isbn": "1",
                "amazon_url": "http://test.test",
                "author": "Testy Testerson",
                "language": "english",
                "pages": 2,
                "publisher": "Test Press",
                "title": "Testing",
                "year": 2017
            }
        );

        book2 = {
            "isbn": "2",
            "amazon_url": "http://test2.test",
            "author": "Testy Testerson2",
            "language": "english2",
            "pages": 22,
            "publisher": "Test Press2",
            "title": "Testing2",
            "year": 2018
        }
    });

    describe('GET /', () => {
        test('return list of all books', async () => {
            const res = await request(app).get('/books');
            expect(res.statusCode).toBe(200);
            expect(res.body).toEqual({books: [book1]});
            const books = await Book.findAll(); 
            expect(books.length).toBe(1);
        });
    });

    describe('GET /:id', () => {
        test('return book w/ id', async () => {
            const res = await request(app).get(`/books/${book1.isbn}`);
            expect(res.statusCode).toBe(200);
            expect(res.body).toEqual({book: book1});
        });
        test('return 404 if book does not exist', async () => {
            const res = await request(app).get(`/books/BAD`);
            expect(res.statusCode).toBe(404);
        });
    });

    describe('POST /', () => {
        test('create book', async () => {
            const res = await request(app).post('/books').send(book2);
            expect(res.statusCode).toBe(201);
            expect(res.body).toEqual({book:book2});
            const books = await Book.findAll();
            expect(books.length).toBe(2);
        });
        test('Responds w/ 400 when invalid inputs', async () => {
            const res = await request(app).post('/books').send('');
            expect(res.statusCode).toBe(400);
        });
    });

    describe('PUT /:id', () => {
        test('update an entire book', async () => {
            book2.isbn = "1";
            const res = await request(app).put(`/books/${book1.isbn}`).send(book2);
            expect(res.statusCode).toBe(200);
            expect(res.body).toEqual({book: book2});
            const books = await Book.findAll(); 
            expect(books.length).toBe(1);
        });
        test('Responds w/ 404 if book does not exist', async () => {
            const res = await request(app).put(`/books/BAD`).send(book2);
            expect(res.statusCode).toBe(404);
        });
        test('Responds w/ 400 when invalid inputs', async () => {
            const res = await request(app).put(`/books/${book1.isbn}`).send('');
            expect(res.statusCode).toBe(400);
        });
    });

    describe('PATCH /:id', () => {
        test('update parts of a book', async () => {
            const res = await request(app).patch(`/books/${book1.isbn}`).send({"author":"Testy3", "year":2021});
            expect(res.statusCode).toBe(200);
            book1.author = "Testy3";
            book1.year = 2021;
            expect(res.body).toEqual({book: book1});
            const books = await Book.findAll(); 
            expect(books.length).toBe(1);
        });
        test('Responds w/ 400 if invalid request parameters', async () => {
            const res = await request(app).patch(`/books/${book1.isbn}`).send({"notARealThing":"Wrong"});
            expect(res.statusCode).toBe(400);
        });
        test('Responds w/ 404 if book does not exist', async () => {
            const res = await request(app).patch(`/books/bad`).send({"author":"Testy3", "year":2021});
            expect(res.statusCode).toBe(404);
        });
    });

    describe('DELETE /:id', () => {
        test('delete a book by id', async () => {
            const res = await request(app).delete(`/books/${book1.isbn}`);
            expect(res.statusCode).toBe(200);
            expect(res.body).toEqual({ message: "Book deleted" });
            const books = await Book.findAll(); 
            expect(books.length).toBe(0);
        })
    })

    afterAll(async () => {
        await db.query(`DROP TABLE books`)
        await db.end();
    })
})