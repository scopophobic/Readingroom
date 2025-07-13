"use client";

import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Search, BookOpen, X } from "lucide-react";
import { booksApi } from "@/lib/api-client";
import { Book } from "@/lib/api-client";
import Image from "next/image";

interface BookSearchProps {
  onBookSelect: (book: Book | null) => void;
  selectedBook: Book | null;
  placeholder?: string;
}

export function BookSearch({ onBookSelect, selectedBook, placeholder = "Search for a book..." }: BookSearchProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Book[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout>();
  const containerRef = useRef<HTMLDivElement>(null);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Debounced search
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (searchQuery.trim().length < 2) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    searchTimeoutRef.current = setTimeout(async () => {
      setIsSearching(true);
      try {
        const response = await booksApi.searchBooks(searchQuery);
        setSearchResults(response.data.items || []);
        setShowResults(true);
      } catch (error) {
        console.error("Failed to search books:", error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery]);

  const handleBookSelect = (book: Book) => {
    onBookSelect(book);
    setSearchQuery(book.volumeInfo.title);
    setShowResults(false);
  };

  const handleClearSelection = () => {
    onBookSelect(null);
    setSearchQuery("");
    setShowResults(false);
  };

  const formatAuthors = (authors?: string[]) => {
    if (!authors || authors.length === 0) return "Unknown Author";
    return authors.join(", ");
  };

  return (
    <div className="relative" ref={containerRef}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          type="text"
          placeholder={placeholder}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 pr-10"
          onFocus={() => {
            if (searchResults.length > 0) setShowResults(true);
          }}
        />
        {selectedBook && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearSelection}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Search Results Dropdown */}
      {showResults && (
        <Card className="absolute top-full left-0 right-0 z-50 mt-1 max-h-60 overflow-y-auto shadow-lg">
          <CardContent className="p-0">
            {isSearching ? (
              <div className="p-4 text-center text-gray-500">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600 mx-auto mb-2"></div>
                Searching...
              </div>
            ) : searchResults.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {searchResults.map((book) => (
                  <button
                    key={book.id}
                    onClick={() => handleBookSelect(book)}
                    className="w-full p-3 text-left hover:bg-gray-50 transition-colors duration-150 flex items-start space-x-3"
                  >
                    <div className="flex-shrink-0">
                      {book.volumeInfo.imageLinks?.thumbnail ? (
                        <Image
                          src={book.volumeInfo.imageLinks.thumbnail}
                          alt={book.volumeInfo.title}
                          width={40}
                          height={60}
                          className="rounded shadow-sm"
                        />
                      ) : (
                        <div className="w-10 h-15 bg-gray-200 rounded flex items-center justify-center">
                          <BookOpen className="h-5 w-5 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-gray-900 truncate">
                        {book.volumeInfo.title}
                      </h4>
                      <p className="text-sm text-gray-500 truncate">
                        {formatAuthors(book.volumeInfo.authors)}
                      </p>
                      {book.volumeInfo.publishedDate && (
                        <p className="text-xs text-gray-400">
                          {new Date(book.volumeInfo.publishedDate).getFullYear()}
                        </p>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            ) : searchQuery.trim().length >= 2 ? (
              <div className="p-4 text-center text-gray-500">
                No books found for "{searchQuery}"
              </div>
            ) : null}
          </CardContent>
        </Card>
      )}

      {/* Selected Book Display */}
      {selectedBook && (
        <Card className="mt-3 border-purple-200 bg-purple-50">
          <CardContent className="p-3">
            <div className="flex items-start space-x-3">
              {selectedBook.volumeInfo.imageLinks?.thumbnail ? (
                <Image
                  src={selectedBook.volumeInfo.imageLinks.thumbnail}
                  alt={selectedBook.volumeInfo.title}
                  width={50}
                  height={75}
                  className="rounded shadow-sm"
                />
              ) : (
                <div className="w-12 h-18 bg-gray-200 rounded flex items-center justify-center">
                  <BookOpen className="h-6 w-6 text-gray-400" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-gray-900">
                  {selectedBook.volumeInfo.title}
                </h4>
                <p className="text-sm text-gray-600">
                  {formatAuthors(selectedBook.volumeInfo.authors)}
                </p>
                {selectedBook.volumeInfo.publishedDate && (
                  <p className="text-xs text-gray-500">
                    {new Date(selectedBook.volumeInfo.publishedDate).getFullYear()}
                  </p>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearSelection}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 