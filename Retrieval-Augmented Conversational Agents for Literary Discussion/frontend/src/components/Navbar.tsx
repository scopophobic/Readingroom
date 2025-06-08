import {
  Box,
  Flex,
  Heading,
  Button,
  useColorModeValue,
} from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import { FaBook } from "react-icons/fa";

const Navbar = () => {
  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");

  return (
    <Box
      as="nav"
      position="sticky"
      top={0}
      zIndex={10}
      bg={bgColor}
      borderBottom="1px"
      borderColor={borderColor}
      shadow="sm"
    >
      <Flex
        maxW="1200px"
        mx="auto"
        px={4}
        h="16"
        alignItems="center"
        justifyContent="space-between"
      >
        <RouterLink to="/">
          <Flex alignItems="center" gap={2}>
            <FaBook color="#8b5cf6" size="24px" />
            <Heading size="md" color="brand.500">
              BookChat
            </Heading>
          </Flex>
        </RouterLink>

        <Flex gap={4}>
          <Button as={RouterLink} to="/" variant="ghost" colorScheme="brand">
            Home
          </Button>
        </Flex>
      </Flex>
    </Box>
  );
};

export default Navbar;
