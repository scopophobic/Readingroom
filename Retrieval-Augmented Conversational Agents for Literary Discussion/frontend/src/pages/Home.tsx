import { useState } from "react";
import {
  Box,
  Input,
  Button,
  VStack,
  Heading,
  Text,
  useToast,
  Grid,
  Image,
  Card,
  CardBody,
  Stack,
  CardFooter,
  InputGroup,
  InputRightElement,
  Spinner,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { FaSearch } from "react-icons/fa";
import axios from "axios";

interface Book {
  book_id: string;
  title: string;
  authors: string[];
  description: string;
  thumbnail: string;
  published_date?: string;
  publisher?: string;
  categories?: string[];
  page_count?: number;
  language?: string;
}

interface SearchResponse {
  status: string;
  results: Book[];
  total_items?: number;
  message?: string;
}

const Home = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();

  const {
    data: searchData,
    isLoading,
    error,
    refetch,
  } = useQuery<SearchResponse>({
    queryKey: ["books", searchQuery],
    queryFn: async () => {
      if (!searchQuery.trim()) {
        return { status: "success", results: [] };
      }

      try {
        const response = await axios.get(
          `http://127.0.0.1:8001/search-books?q=${encodeURIComponent(
            searchQuery
          )}`
        );

        if (response.data.status === "error") {
          throw new Error(response.data.message || "Search failed");
        }

        return response.data;
      } catch (error) {
        if (axios.isAxiosError(error)) {
          throw new Error(
            error.response?.data?.message || "Failed to search books"
          );
        }
        throw error;
      }
    },
    enabled: false,
    retry: 1,
    staleTime: 30000, // Cache results for 30 seconds
  });

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast({
        title: "Please enter a search term",
        status: "warning",
        duration: 3000,
      });
      return;
    }

    setIsSearching(true);
    try {
      await refetch();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to search books";
      toast({
        title: "Search failed",
        description: errorMessage,
        status: "error",
        duration: 5000,
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleBookSelect = async (book: Book) => {
    try {
      // Show loading toast
      const loadingToast = toast({
        title: "Checking book data...",
        description: "Verifying if book data is ready",
        status: "info",
        duration: null,
        isClosable: false,
      });

      // First check if book data exists
      const checkResponse = await axios.get(
        "http://127.0.0.1:8001/books/check",
        {
          params: { book_id: book.book_id },
        }
      );

      let isPrepared = false;
      let message = "";

      if (
        checkResponse.data.status === "success" &&
        checkResponse.data.exists
      ) {
        // Book data already exists
        isPrepared = true;
        message = "Book data is ready";
      } else {
        // Need to prepare the book
        toast.update(loadingToast, {
          title: "Preparing book data...",
          description: "This may take a few moments",
        });

        const prepareResponse = await axios.post(
          "http://127.0.0.1:8001/books/prepare",
          null,
          {
            params: {
              book_id: book.book_id,
              book_title: book.title,
              author: book.authors?.[0],
            },
          }
        );

        if (prepareResponse.data.status === "error") {
          throw new Error(
            prepareResponse.data.message || "Failed to prepare book data"
          );
        }

        isPrepared = true;
        message = prepareResponse.data.data?.already_exists
          ? "Book data was already ready"
          : "Book data prepared successfully";
      }

      // Close loading toast
      toast.close(loadingToast);

      // Show success toast
      toast({
        title: "Ready to chat!",
        description: message,
        status: "success",
        duration: 2000,
      });

      // Navigate to chat with the prepared book data
      navigate(`/chat/${book.book_id}`, {
        state: {
          bookData: {
            ...book,
            isPrepared,
          },
        },
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to prepare book data";
      toast({
        title: "Error",
        description: errorMessage,
        status: "error",
        duration: 5000,
      });
    }
  };

  const books = searchData?.results || [];
  const totalItems = searchData?.total_items || 0;

  return (
    <VStack spacing={8} align="stretch">
      <Box textAlign="center" py={10}>
        <Heading size="2xl" mb={4} color="brand.500">
          BookChat
        </Heading>
        <Text fontSize="xl" color="gray.600">
          Search for a book and start a conversation about it
        </Text>
      </Box>

      <Box maxW="600px" mx="auto" w="full">
        <InputGroup size="lg">
          <Input
            placeholder="Search for a book..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSearch()}
            pr="4.5rem"
            isDisabled={isLoading}
          />
          <InputRightElement width="4.5rem">
            <Button
              h="1.75rem"
              size="sm"
              onClick={handleSearch}
              isLoading={isLoading || isSearching}
              colorScheme="brand"
              isDisabled={!searchQuery.trim()}
            >
              <FaSearch />
            </Button>
          </InputRightElement>
        </InputGroup>
      </Box>

      {(isLoading || isSearching) && (
        <Box textAlign="center" py={10}>
          <Spinner size="xl" color="brand.500" />
          <Text mt={4} color="gray.600">
            Searching books...
          </Text>
        </Box>
      )}

      {error && (
        <Box textAlign="center" py={10}>
          <Text color="red.500" fontSize="lg">
            {error instanceof Error
              ? error.message
              : "An error occurred while searching"}
          </Text>
        </Box>
      )}

      {books.length > 0 && (
        <>
          <Text textAlign="center" color="gray.600">
            Found {totalItems} results
          </Text>
          <Grid
            templateColumns={{
              base: "1fr",
              md: "repeat(2, 1fr)",
              lg: "repeat(3, 1fr)",
            }}
            gap={6}
            py={4}
          >
            {books.map((book) => (
              <Card
                key={book.book_id}
                overflow="hidden"
                variant="outline"
                _hover={{ transform: "translateY(-2px)", shadow: "md" }}
                transition="all 0.2s"
                cursor="pointer"
                onClick={() => handleBookSelect(book)}
              >
                <CardBody>
                  <Image
                    src={
                      book.thumbnail ||
                      "https://via.placeholder.com/150x200?text=No+Image"
                    }
                    alt={book.title}
                    objectFit="cover"
                    w="full"
                    h="200px"
                    fallbackSrc="https://via.placeholder.com/150x200?text=No+Image"
                  />
                  <Stack mt={4}>
                    <Heading size="md" noOfLines={2}>
                      {book.title}
                    </Heading>
                    <Text color="gray.600" noOfLines={1}>
                      by {book.authors?.join(", ") || "Unknown Author"}
                    </Text>
                    {book.published_date && (
                      <Text fontSize="sm" color="gray.500">
                        Published: {new Date(book.published_date).getFullYear()}
                      </Text>
                    )}
                    <Text noOfLines={3} fontSize="sm">
                      {book.description || "No description available."}
                    </Text>
                  </Stack>
                </CardBody>
                <CardFooter>
                  <Button w="full" colorScheme="brand" variant="ghost">
                    Start Chat
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </Grid>
        </>
      )}

      {books.length === 0 &&
        !isLoading &&
        !isSearching &&
        searchQuery &&
        !error && (
          <Box textAlign="center" py={10}>
            <Text fontSize="lg" color="gray.600">
              No books found. Try a different search term.
            </Text>
          </Box>
        )}
    </VStack>
  );
};

export default Home;
