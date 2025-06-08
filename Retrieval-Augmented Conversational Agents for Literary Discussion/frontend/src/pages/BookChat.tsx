import { useState, useRef, useEffect } from "react";
import {
  Box,
  VStack,
  Input,
  Text,
  useToast,
  Flex,
  Heading,
  Avatar,
  Card,
  CardBody,
  Divider,
  Spinner,
  IconButton,
} from "@chakra-ui/react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { FaArrowLeft, FaPaperPlane, FaBook } from "react-icons/fa";
import axios from "axios";

interface Message {
  role: "user" | "bot";
  content: string;
}

interface BookData {
  title: string;
  authors: string[];
  description: string;
  thumbnail: string;
  isPrepared?: boolean;
}

interface ChatResponse {
  status: string;
  response: string | null;
  history: string[];
  message?: string;
}

const BookChat = () => {
  const { bookId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const toast = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const bookData = location.state?.bookData as BookData;

  useEffect(() => {
    if (!bookId || !bookData) {
      navigate("/");
      return;
    }

    // If book is not prepared, redirect back to home
    if (!bookData.isPrepared) {
      toast({
        title: "Error",
        description:
          "Book data is not prepared. Please try selecting the book again.",
        status: "error",
        duration: 5000,
      });
      navigate("/");
      return;
    }

    // Add welcome message
    setMessages([
      {
        role: "bot",
        content: `Welcome! I'm ready to discuss "${bookData.title}" with you. What would you like to know about this book?`,
      },
    ]);
    setIsInitialized(true);
    scrollToBottom();
  }, [bookId, bookData, navigate, toast]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSend = async () => {
    if (!input.trim() || !isInitialized || !bookId) return;

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    try {
      console.log("Sending query to backend...");
      const response = await axios.post<ChatResponse>(
        "http://127.0.0.1:8001/chat/query",
        {
          book_id: bookId,
          question: userMessage,
          history: messages.map(
            (m) => `${m.role === "user" ? "User" : "Bot"}: ${m.content}`
          ),
        }
      );

      if (response.data.status === "error") {
        throw new Error(response.data.message || "Failed to get response");
      }

      if (response.data.response) {
        setMessages((prev) => [
          ...prev,
          {
            role: "bot",
            content:
              response.data.response ||
              "Sorry, I couldn't process your question.",
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          { role: "bot", content: "Sorry, I couldn't process your question." },
        ]);
      }
    } catch (error) {
      console.error("Error in chat:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to get response";

      // Add error message to chat
      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          content: `Sorry, I encountered an error: ${errorMessage}`,
        },
      ]);

      toast({
        title: "Error",
        description: errorMessage,
        status: "error",
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!bookData) return null;

  return (
    <VStack h="calc(100vh - 200px)" spacing={4}>
      <Flex w="full" justify="space-between" align="center">
        <IconButton
          aria-label="Back to search"
          icon={<FaArrowLeft />}
          onClick={() => navigate("/")}
          variant="ghost"
          colorScheme="brand"
        />
        <Heading size="md" color="brand.500">
          {bookData.title}
        </Heading>
        <Box w="40px" /> {/* Spacer for alignment */}
      </Flex>

      <Card w="full" h="full" variant="outline">
        <CardBody display="flex" flexDirection="column" p={4}>
          <VStack flex={1} overflowY="auto" spacing={4} align="stretch" pb={4}>
            {messages.map((message, index) => (
              <Flex
                key={index}
                justify={message.role === "user" ? "flex-end" : "flex-start"}
                gap={2}
              >
                {message.role === "bot" && (
                  <Avatar
                    size="sm"
                    name="BookChat"
                    bg="brand.500"
                    icon={<FaBook />}
                  />
                )}
                <Box
                  maxW="70%"
                  bg={message.role === "user" ? "brand.500" : "gray.100"}
                  color={message.role === "user" ? "white" : "gray.800"}
                  p={3}
                  borderRadius="lg"
                >
                  <Text>{message.content}</Text>
                </Box>
                {message.role === "user" && (
                  <Avatar size="sm" name="User" bg="gray.500" />
                )}
              </Flex>
            ))}
            {isLoading && (
              <Flex justify="flex-start" gap={2}>
                <Avatar
                  size="sm"
                  name="BookChat"
                  bg="brand.500"
                  icon={<FaBook />}
                />
                <Box bg="gray.100" p={3} borderRadius="lg">
                  <Spinner size="sm" color="brand.500" />
                </Box>
              </Flex>
            )}
            <div ref={messagesEndRef} />
          </VStack>

          <Divider />

          <Flex gap={2} pt={4}>
            <Input
              placeholder="Ask a question about the book..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSend()}
              disabled={isLoading}
            />
            <IconButton
              aria-label="Send message"
              icon={<FaPaperPlane />}
              onClick={handleSend}
              isLoading={isLoading}
              colorScheme="brand"
            />
          </Flex>
        </CardBody>
      </Card>
    </VStack>
  );
};

export default BookChat;
