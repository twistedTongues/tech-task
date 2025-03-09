"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.comments = void 0;
// Initial seed data for development
exports.comments = [
    {
        id: '1',
        text: 'This is the first comment',
        author: 'User1',
        timestamp: new Date().toISOString(),
        parentId: null,
        votes: 5
    },
    {
        id: '2',
        text: 'This is a reply to the first comment',
        author: 'User2',
        timestamp: new Date().toISOString(),
        parentId: '1',
        votes: 3
    }
];
