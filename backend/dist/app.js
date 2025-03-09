"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const data_1 = require("./data");
const app = (0, express_1.default)();
app.use((0, cors_1.default)({ origin: 'http://localhost:5173' }));
app.use(express_1.default.json());
// Helper function for validation
const validateAndSanitize = (text) => {
    // Trim whitespace and check length
    const trimmed = text.trim();
    if (!trimmed)
        return null;
    // Remove HTML tags and special characters
    return trimmed
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/[\\$'"]/g, '');
};
// GET all comments
app.get('/comments', (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const topLevel = data_1.comments.filter(c => c.parentId === null);
    const total = topLevel.length;
    const totalPages = Math.ceil(total / limit);
    const paginated = topLevel
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice((page - 1) * limit, page * limit);
    const nested = paginated.map(comment => ({
        ...comment,
        replies: getNestedReplies(comment.id, data_1.comments)
    }));
    res.json({
        comments: nested,
        currentPage: page,
        totalPages,
        totalComments: total
    });
});
// Recursive function to build the nested comment structure
function getNestedReplies(parentId, allComments) {
    return allComments
        .filter(c => c.parentId === parentId)
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .map(reply => ({
        ...reply,
        replies: getNestedReplies(reply.id, allComments)
    }));
}
// POST new top-level comment
app.post('/comments', (req, res) => {
    const rawText = req.body.text;
    const sanitized = validateAndSanitize(rawText);
    if (!sanitized) {
        res.status(400).json({ error: 'Comment text is required' });
        return;
    }
    const newComment = {
        id: Date.now().toString(),
        text: sanitized, // Use the sanitized text
        author: validateAndSanitize(req.body.author) || 'Anonymous',
        timestamp: new Date().toISOString(),
        parentId: null,
        votes: 0,
    };
    data_1.comments.push(newComment);
    res.status(201).json(newComment);
});
// POST reply to a comment
app.post('/comments/:id/reply', (req, res) => {
    const parentId = req.params.id;
    const parentComment = data_1.comments.find(c => c.id === parentId);
    if (!parentComment) {
        res.status(404).json({ error: 'Parent comment not found' });
        return;
    }
    const rawText = req.body.text;
    const sanitized = validateAndSanitize(rawText);
    if (!sanitized) {
        res.status(400).json({ error: 'Reply text is required' });
        return;
    }
    const newReply = {
        id: Date.now().toString(),
        text: sanitized, // Use the sanitized text
        author: validateAndSanitize(req.body.author) || 'Anonymous',
        timestamp: new Date().toISOString(),
        parentId,
        votes: 0,
    };
    data_1.comments.push(newReply);
    res.status(201).json(newReply);
});
// POST upvote a comment
app.post('/comments/:id/upvote', (req, res) => {
    const commentId = req.params.id;
    const comment = data_1.comments.find(c => c.id === commentId);
    if (!comment) {
        res.status(404).json({ error: 'Comment not found' });
        return;
    }
    comment.votes++;
    res.status(200).json({ votes: comment.votes });
});
// GET a single comment with its replies
app.get('/comments/:id', (req, res) => {
    const commentId = req.params.id;
    const comment = data_1.comments.find(c => c.id === commentId);
    if (!comment) {
        res.status(404).json({ error: 'Comment not found' });
        return;
    }
    const commentWithReplies = {
        ...comment,
        replies: getNestedReplies(comment.id, data_1.comments)
    };
    res.json(commentWithReplies);
});
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
