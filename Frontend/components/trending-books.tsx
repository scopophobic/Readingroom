import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { TrendingUp, Star } from "lucide-react"
import Image from "next/image"

const trendingBooks = [
  {
    title: "Fourth Wing",
    author: "Rebecca Yarros",
    cover: "http://books.google.com/books/content?id=EP-gEAAAQBAJ&printsec=frontcover&img=1&zoom=5&edge=curl&source=gbs_api",
    rating: 4.8,
    trend: "+12%",
  },
  {
    title: "Tomorrow, and Tomorrow, and Tomorrow",
    author: "Gabrielle Zevin",
    cover: "http://books.google.com/books/content?id=uW_8EAAAQBAJ&printsec=frontcover&img=1&zoom=5&edge=curl&source=gbs_api",
    rating: 4.6,
    trend: "+8%",
  },
  {
    title: "The Atlas Six",
    author: "Olivie Blake",
    cover: "http://books.google.com/books/content?id=rwtGEAAAQBAJ&printsec=frontcover&img=1&zoom=5&source=gbs_api",
    rating: 4.2,
    trend: "+15%",
  },
  {
    title: "Book Lovers",
    author: "Emily Henry",
    cover: "http://books.google.com/books/content?id=3GY7EAAAQBAJ&printsec=frontcover&img=1&zoom=5&source=gbs_api",
    rating: 4.5,
    trend: "+6%",
  },
]

const suggestedUsers = [
  {
    name: "Literary Luna",
    username: "literaryluna",
    avatar: "/placeholder-user.jpg",
    followers: "2.3k",
  },
  {
    name: "BookWorm Ben",
    username: "bookwormben",
    avatar: "/placeholder-user.jpg",
    followers: "1.8k",
  },
  {
    name: "Novel Nora",
    username: "novelnora",
    avatar: "/placeholder-user.jpg",
    followers: "3.1k",
  },
]

export function TrendingBooks() {
  return (
    <div className="space-y-6">
      {/* Trending Books - Only section kept */}
      <Card className="border-[#D9BDF4]/20 bg-gradient-to-br from-[#D9BDF4]/5 to-purple-50/30">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center text-purple-800">
            <TrendingUp className="h-5 w-5 mr-2 text-[#D9BDF4]" />
            Trending Books
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {trendingBooks.map((book, index) => (
            <div
              key={index}
              className="flex items-center space-x-3 p-2 rounded-lg hover:bg-[#D9BDF4]/10 transition-colors"
            >
              <Image
                src={book.cover || "/placeholder.svg"}
                alt={book.title}
                width={40}
                height={60}
                className="rounded-sm object-cover shadow-sm"
              />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm line-clamp-1">{book.title}</p>
                <p className="text-xs text-muted-foreground line-clamp-1">{book.author}</p>
                <div className="flex items-center space-x-2 mt-1">
                  <div className="flex items-center">
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    <span className="text-xs ml-1">{book.rating}</span>
                  </div>
                  <span className="text-xs text-green-600 bg-green-50 px-1 rounded">{book.trend}</span>
                </div>
              </div>
            </div>
          ))}
          <Button variant="outline" size="sm" className="w-full border-[#D9BDF4] text-purple-700 hover:bg-[#D9BDF4]/10">
            View All Trending
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
