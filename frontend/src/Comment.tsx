import { useState } from 'react';
import axios from 'axios';
import {
  Box,
  Flex,
  VStack,
  Button,
  Text,
  Textarea,
  Badge,
} from '@chakra-ui/react';
import { toaster } from './components/ui/toaster'
import { CommentType } from './types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

interface CommentProps {
  comment: CommentType;
  onReplySubmit: (parentId: string, text: string) => void;
  refreshComments: () => void;
  depth: number;
}

const MAX_NESTING_DEPTH = 4;

const Comment = ({
  comment,
  onReplySubmit,
  refreshComments,
  depth
}: CommentProps) => {
  const [isReplying, setIsReplying] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [localVotes, setLocalVotes] = useState(comment.votes);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Calculate if we should show indentation based on depth
  const shouldShowIndent = depth < MAX_NESTING_DEPTH;

  // Calculate border color based on depth
  const borderColors = [
    'blue.500', 'green.500', 'purple.500', 'orange.500', 'red.500'
  ];
  const borderColor = borderColors[depth % borderColors.length];

  // Calculate background color for comment
  const bgColor = depth % 2 === 0 ? 'gray.50' : 'white';

  const handleReplyToggle = () => {
    setIsReplying(!isReplying);
    if (!isReplying) {
      setReplyText('');
    }
  };

  const handleReplySubmit = async () => {
    if (!replyText.trim()) {
      toaster.create({
        description: 'Reply cannot be empty',
        type: 'error'
      })

      return;
    }

    try {
      setIsSubmitting(true);
      onReplySubmit(comment.id, replyText);
      setReplyText('');
      setIsReplying(false);
    } catch (error) {
      console.error('Error submitting reply:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpvote = async () => {
    try {
      setLocalVotes(v => v + 1);
      await axios.post(`${API_URL}/comments/${comment.id}/upvote`);
      setTimeout(() => refreshComments(), 500);
    } catch (error) {
      setLocalVotes(v => v - 1); // Revert on error
      toaster.create({
        description: 'Failed to upvote',
        type: 'error'
      })

      console.error('Error upvoting comment:', error);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleString();
    } catch (_) {
      return dateString;
    }
  };

  return (
    <Box
      p={3}
      my={2}
      borderRadius="md"
      borderLeftWidth={shouldShowIndent ? "4px" : "0"}
      borderLeftColor={shouldShowIndent ? borderColor : undefined}
      ml={shouldShowIndent ? depth * 4 : 0}
      bg={bgColor}
      boxShadow="sm"
    >
      <Flex justify="space-between" mb={2}>
        <Flex align="center" gap={2}>
          <Text fontWeight="bold" color="gray.800">{comment.author}</Text>
          <Text fontSize="xs" color="gray.500">
            {formatDate(comment.timestamp)}
          </Text>
        </Flex>

        <Flex align="center" gap={1}>
          <Button
            size="xs"
            onClick={handleUpvote}
            variant="ghost"
            color="gray.800"
            _hover={{
              bg: borderColor,
              color: 'white',
              borderColor: borderColor
            }}

          >
            ▲
          </Button>
          <Badge colorScheme={localVotes > 0 ? "green" : "gray"}>
            {localVotes}
          </Badge>
        </Flex>
      </Flex>

      <Text mb={3} color="gray.800">{comment.text}</Text>

      <Flex>
        <Button
          size="xs"
          onClick={handleReplyToggle}
          color="gray.800"
          variant="outline"
          _hover={{
            bg: borderColor,
            color: 'white',
            borderColor: borderColor
          }}

        >
          {isReplying ? "Cancel" : "Reply"}
        </Button>
      </Flex>

      {isReplying && (
        <VStack mt={3} align="stretch">
          <Textarea
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder="Write your reply..."
            size="sm"
            resize="vertical"
            color="gray.800"
          />
          <Button
            size="sm"
            colorScheme="blue"
            onClick={handleReplySubmit}
            loading={isSubmitting}
            disabled={isSubmitting}
            variant="outline"
            color="gray.800"
            _hover={{
              bg: borderColor,
              color: 'white',
              borderColor: borderColor
            }}

          >
            Submit Reply
          </Button>
        </VStack>
      )}

      {/* Nested replies */}
      {comment.replies && comment.replies.length > 0 && (
        <Box mt={3}>
          {comment.replies.map((reply) => (
            <Comment
              key={reply.id}
              comment={reply}
              onReplySubmit={onReplySubmit}
              refreshComments={refreshComments}
              depth={depth + 1}
            />
          ))}
        </Box>
      )}
    </Box>
  );
};

export default Comment;
