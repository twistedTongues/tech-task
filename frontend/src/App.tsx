import { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Button,
  Input,
  VStack,
  HStack,
  Text,
  Heading,
  Container,
  Flex,
  Box
} from '@chakra-ui/react';
import { Toaster, toaster } from './components/ui/toaster'
import { CommentType, PaginatedResponse } from './types';
import Comment from './Comment';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function App() {
  const [comments, setComments] = useState<CommentType[]>([]);
  const [newComment, setNewComment] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const limit = 5; // Number of comments per page

  // Fetch comments on page change
  useEffect(() => {
    const fetchComments = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get<PaginatedResponse>(`${API_URL}/comments`, {
          params: { page: currentPage, limit }
        });

        setComments(response.data.comments);
        setTotalPages(response.data.totalPages);
      } catch (error) {
        toaster.create({
          description: 'Error fetching comments. Please try again later.',
          type: 'error'
        })

        console.error('Error fetching comments:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchComments();
  }, [currentPage]);

  // Submit a new top-level comment
  const handleSubmit = async () => {
    if (!newComment.trim()) {
      toaster.create({
        description: 'Comment cannot be empty',
        type: 'error'
      })
      return;
    }

    try {
      setIsSubmitting(true);
      await axios.post(`${API_URL}/comments`, {
        text: newComment,
        author: "User", // In a real app, this would come from auth
      });

      setNewComment('');
      await refreshComments();

      toaster.create({
        description: 'Comment posted successfully',
        type: 'success'
      })
    } catch (error) {
      toaster.create({
        description: 'Failed to post comment. Please try again later.',
        type: 'error'
      })

      console.error('Error posting comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit comment on Enter key
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  // Submit a reply to an existing comment
  const handleReplySubmit = async (parentId: string, text: string) => {
    if (!text.trim()) {
      toaster.create({
        description: 'Reply cannot be empty',
        type: 'error'
      })

      return;
    }

    try {
      await axios.post(`${API_URL}/comments/${parentId}/reply`, {
        text,
        author: "User", // In a real app, this would come from auth
      });

      await refreshComments();

      toaster.create({
        description: 'Reply posted successfully',
        type: 'success'
      })

    } catch (error) {
      toaster.create({
        description: 'Failed to post reply. Please try again later.',
        type: 'error'
      })

      console.error('Error posting reply:', error);
    }
  };

  // Refresh comments from server
  const refreshComments = async () => {
    try {
      const response = await axios.get<PaginatedResponse>(`${API_URL}/comments`, {
        params: { page: currentPage, limit }
      });

      setComments(response.data.comments);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error('Error refreshing comments:', error);
    }
  };

  return (
    <Container maxW="800px" py={8}>
      <VStack align="stretch">
        <Heading as="h1" size="xl" textAlign="center" mb={6}>
          Comment System
        </Heading>

        <Box borderWidth="1px" borderRadius="lg" p={4} bg="white">
          <VStack align="stretch">
            <Input
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              onKeyDown={handleKeyPress}
              disabled={isSubmitting}
              color="gray.800"
            />
            <Button
              colorScheme="blue"
              onClick={handleSubmit}
              loading={isSubmitting}
              loadingText="Posting"
              width="full"
              variant="outline"
              color="gray.800"
              _hover={{
                bg: 'blue.500',
                color: 'white',
                borderColor: 'blue.500'
              }}
            >
              Post Comment
            </Button>
          </VStack>
        </Box>

        {isLoading ? (
          <Text textAlign="center">Loading comments...</Text>
        ) : comments.length === 0 ? (
          <Text textAlign="center">No comments yet. Be the first to comment!</Text>
        ) : (
          <VStack align="stretch">
            {comments.map((comment) => (
              <Comment
                key={comment.id}
                comment={comment}
                onReplySubmit={handleReplySubmit}
                refreshComments={refreshComments}
                depth={0}
              />
            ))}
          </VStack>
        )}

        {totalPages > 1 && (
          <Flex justify="center" mt={6}>
            <HStack>
              <Button
                onClick={() => setCurrentPage(p => p - 1)}
                disabled={currentPage === 1 || isLoading}
                size="sm"
              >
                Previous
              </Button>

              <Text>
                Page {currentPage} of {totalPages}
              </Text>

              <Button
                onClick={() => setCurrentPage(p => p + 1)}
                disabled={currentPage >= totalPages || isLoading}
                size="sm"
              >
                Next
              </Button>
            </HStack>
          </Flex>
        )}
      </VStack>
      <Toaster />
    </Container>
  );
}
