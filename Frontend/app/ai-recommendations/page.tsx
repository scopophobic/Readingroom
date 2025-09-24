"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, BookOpen, Sparkles, Search } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Client } from "@gradio/client";

interface BookRecommendation {
  title: string;
  image: string;
  description: string;
  author?: string;
  category?: string;
}

interface ApiBookData {
  image: {
    url?: string;
    path?: string;
  };
  caption: string;
}

const TONE_OPTIONS = [
  { value: "All", label: "All Tones" },
  { value: "Happy", label: "Happy" },
  { value: "Surprising", label: "Surprising" },
  { value: "Angry", label: "Angry" },
  { value: "Suspenseful", label: "Suspenseful" },
  { value: "Sad", label: "Sad" },
];

const CATEGORY_OPTIONS = [
  { value: "All", label: "All Categories" },
  { value: "Children's Fiction", label: "Children's Fiction" },
  { value: "Children's Nonfiction", label: "Children's Nonfiction" },
  { value: "Fiction", label: "Fiction" },
  { value: "Nonfiction", label: "Nonfiction" },
];

export default function AIRecommendationsPage() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [tone, setTone] = useState("All");
  const [recommendations, setRecommendations] = useState<BookRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleRecommendation = async () => {
    if (!query.trim()) {
      toast({
        title: "Error",
        description: "Please enter a description of the book you're looking for.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const client = await Client.connect("sc0pophobic/semantic_book_recommender");
      const result = await client.predict("/recommend_books", {
        query: query.trim(),
        category: category,
        tone: tone,
      });

      console.log("AI Recommendation Result:", result.data);

      // Parse the result data - handle the nested array structure
      if (result.data && Array.isArray(result.data) && result.data.length > 0) {
        const booksData = result.data[0]; // Get the first element which contains the books array
        
        if (Array.isArray(booksData)) {
          const parsedBooks: BookRecommendation[] = booksData.map((book: ApiBookData) => {
            // Extract title from caption
            const caption = book.caption;
            
            // Try to match "Title by Author:" pattern
            // Use a more specific regex that looks for the last " by " before the colon
            const titleAuthorMatch = caption.match(/^(.+) by ([^:]+):\s*(.+)/);
            
            let title = "Unknown Title";
            let author = "Unknown Author";
            let description = caption;
            
            if (titleAuthorMatch) {
              title = titleAuthorMatch[1].trim();
              author = titleAuthorMatch[2].trim();
              description = titleAuthorMatch[3].trim();
            } else {
              // Fallback: try to extract title before colon
              const colonMatch = caption.match(/^([^:]+):\s*(.+)/);
              if (colonMatch) {
                title = colonMatch[1].trim();
                description = colonMatch[2].trim();
                
                // Try to extract author from title if it contains "by"
                const byMatch = title.match(/^(.+) by (.+)$/);
                if (byMatch) {
                  title = byMatch[1].trim();
                  author = byMatch[2].trim();
                }
              }
            }
            
            return {
              title,
              author,
              description,
              image: book.image?.url || book.image?.path || "",
              category: category !== "All" ? category : undefined,
            };
          });
          
          setRecommendations(parsedBooks);
          toast({
            title: "Success",
            description: `Found ${parsedBooks.length} book recommendations!`,
          });
        } else {
          throw new Error("Invalid books data format");
        }
      } else {
        throw new Error("Invalid response format from AI service");
      }
    } catch (error) {
      console.error("AI recommendation error:", error);
      toast({
        title: "Error",
        description: "Failed to get book recommendations. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearResults = () => {
    setRecommendations([]);
    setQuery("");
    setCategory("All");
    setTone("All");
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Sparkles className="h-8 w-8 text-purple-600" />
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            AI Book Recommendations
          </h1>
        </div>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Discover your next great read with our AI-powered book recommendation system. 
          Describe what you're looking for, and let our AI find the perfect books for you.
        </p>
      </div>

      {/* Recommendation Form */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Find Your Perfect Book
          </CardTitle>
          <CardDescription>
            Tell us what kind of book you're in the mood for, and we'll find recommendations tailored to your preferences.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="query">
              Book Description <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="query"
              placeholder="Describe the kind of book you're looking for... (e.g., 'A thrilling mystery set in Victorian London with a strong female protagonist')"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="min-h-[100px]"
              disabled={isLoading}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={category} onValueChange={setCategory} disabled={isLoading}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORY_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tone">Tone</Label>
              <Select value={tone} onValueChange={setTone} disabled={isLoading}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a tone" />
                </SelectTrigger>
                <SelectContent>
                  {TONE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-3">
            <Button 
              onClick={handleRecommendation} 
              disabled={isLoading || !query.trim()}
              className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Getting Recommendations...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Get AI Recommendations
                </>
              )}
            </Button>
            {recommendations.length > 0 && (
              <Button 
                variant="outline" 
                onClick={handleClearResults}
                disabled={isLoading}
              >
                Clear Results
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Results Section */}
      {recommendations.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold flex items-center gap-2">
              <BookOpen className="h-6 w-6" />
              Recommended Books ({recommendations.length})
            </h2>
            <Badge variant="secondary" className="text-sm">
              AI-Powered Results
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommendations.map((book, index) => (
              <Card key={index} className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
                <div className="aspect-[3/4] relative overflow-hidden bg-gray-100">
                  {book.image ? (
                    <img
                      src={book.image}
                      alt={book.title}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        // Hide broken image and show placeholder instead
                        e.currentTarget.style.display = 'none';
                        const placeholder = e.currentTarget.nextElementSibling as HTMLElement;
                        if (placeholder) placeholder.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div 
                    className={`w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 ${
                      book.image ? 'hidden' : 'flex'
                    }`}
                  >
                    <BookOpen className="h-16 w-16 text-gray-400" />
                  </div>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-lg mb-2" style={{
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}>
                    {book.title}
                  </h3>
                  {book.author && (
                    <p className="text-sm text-muted-foreground mb-2">
                      by {book.author}
                    </p>
                  )}
                  {book.category && (
                    <Badge variant="outline" className="mb-3 text-xs">
                      {book.category}
                    </Badge>
                  )}
                  <p className="text-sm text-muted-foreground" style={{
                    display: '-webkit-box',
                    WebkitLineClamp: 4,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}>
                    {book.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && recommendations.length === 0 && query && (
        <Card className="text-center py-12">
          <CardContent>
            <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Recommendations Yet</h3>
            <p className="text-muted-foreground">
              Click "Get AI Recommendations" to discover books tailored to your preferences.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
