import { ChakraProvider, Box } from "@chakra-ui/react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import theme from "./theme";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import BookChat from "./pages/BookChat";


const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ChakraProvider theme={theme}>
        <Router>
          <Box minH="100vh">
            <Navbar />
            <Box maxW="1200px" mx="auto" px={4} py={8}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/chat/:bookId" element={<BookChat />} />
              </Routes>
            </Box>
          </Box>
        </Router>
      </ChakraProvider>
    </QueryClientProvider>
  );
}

export default App;
