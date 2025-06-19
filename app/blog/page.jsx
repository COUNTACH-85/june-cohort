"use client"

import { useState } from "react"
import { useAuth } from "@/components/auth-provider"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Badge from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Calendar, Clock, FileText, Heart, Search, User, Eye, MessageCircle, Share2 } from "lucide-react"

const mockBlogPosts = [
  {
    id: "1",
    title: "Latest Advances in Telemedicine: Transforming Healthcare Delivery",
    excerpt:
      "Explore how telemedicine is revolutionizing patient care and making healthcare more accessible than ever before.",
    content:
      "Telemedicine has emerged as a game-changing technology in healthcare delivery, especially in the post-pandemic era. This comprehensive overview examines the latest developments in remote patient monitoring, virtual consultations, and digital health platforms...",
    author: "Dr. Sarah Johnson",
    publishDate: "2024-01-15",
    category: "Technology",
    readTime: "8 min read",
    views: 1250,
    likes: 89,
    comments: 23,
    tags: ["Telemedicine", "Digital Health", "Remote Care"],
  },
  {
    id: "2",
    title: "AI in Medical Diagnosis: Opportunities and Challenges",
    excerpt: "Understanding the role of artificial intelligence in improving diagnostic accuracy and patient outcomes.",
    content:
      "Artificial Intelligence is transforming medical diagnosis by providing doctors with powerful tools to analyze medical images, predict disease outcomes, and personalize treatment plans. This article explores the current applications and future potential...",
    author: "Dr. Michael Chen",
    publishDate: "2024-01-12",
    category: "AI & Medicine",
    readTime: "12 min read",
    views: 2100,
    likes: 156,
    comments: 45,
    tags: ["AI", "Diagnosis", "Machine Learning"],
  },
  {
    id: "3",
    title: "Preventive Care Strategies for Chronic Disease Management",
    excerpt: "Evidence-based approaches to preventing and managing chronic diseases in primary care settings.",
    content:
      "Chronic diseases account for the majority of healthcare costs and patient mortality. This article discusses proven strategies for prevention, early detection, and effective management of conditions like diabetes, hypertension, and heart disease...",
    author: "Dr. Emily Rodriguez",
    publishDate: "2024-01-10",
    category: "Preventive Care",
    readTime: "10 min read",
    views: 980,
    likes: 67,
    comments: 18,
    tags: ["Prevention", "Chronic Disease", "Primary Care"],
  },
  {
    id: "4",
    title: "Mental Health in Healthcare Workers: Addressing Burnout",
    excerpt: "Strategies for supporting healthcare worker mental health and preventing professional burnout.",
    content:
      "Healthcare worker burnout has reached critical levels, affecting both provider wellbeing and patient care quality. This article examines the causes of burnout and presents evidence-based interventions for creating healthier work environments...",
    author: "Dr. James Wilson",
    publishDate: "2024-01-08",
    category: "Mental Health",
    readTime: "15 min read",
    views: 1800,
    likes: 134,
    comments: 67,
    tags: ["Mental Health", "Burnout", "Healthcare Workers"],
  },
  {
    id: "5",
    title: "Personalized Medicine: The Future of Treatment",
    excerpt: "How genetic testing and biomarkers are enabling more targeted and effective treatments.",
    content:
      "Personalized medicine represents a paradigm shift from one-size-fits-all treatments to therapies tailored to individual patient characteristics. This comprehensive guide explores genomic medicine, pharmacogenomics, and precision therapeutics...",
    author: "Dr. Lisa Park",
    publishDate: "2024-01-05",
    category: "Personalized Medicine",
    readTime: "11 min read",
    views: 1450,
    likes: 98,
    comments: 31,
    tags: ["Personalized Medicine", "Genomics", "Precision Medicine"],
  },
]

export default function BlogPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [selectedPost, setSelectedPost] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")

  if (!user) {
    router.push("/signin")
    return null
  }

  const categories = ["All", "Technology", "AI & Medicine", "Preventive Care", "Mental Health", "Personalized Medicine"]

  const filteredPosts = mockBlogPosts.filter((post) => {
    const matchesSearch =
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesCategory = selectedCategory === "All" || post.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  if (selectedPost) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-4">
                <Button variant="ghost" size="sm" onClick={() => setSelectedPost(null)}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Blog
                </Button>
                <div className="flex items-center space-x-3">
                  <FileText className="h-6 w-6 text-purple-600" />
                  <h1 className="text-xl font-semibold text-gray-900">Healthcare Blog</h1>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={() => router.push("/")}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
            </div>
          </div>
        </header>

        {/* Article Content */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <article className="bg-white rounded-lg shadow-sm p-8">
            <header className="mb-8">
              <div className="flex items-center space-x-2 mb-4">
                <Badge variant="secondary">{selectedPost.category}</Badge>
                <span className="text-sm text-gray-500">•</span>
                <span className="text-sm text-gray-500">{selectedPost.readTime}</span>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{selectedPost.title}</h1>
              <div className="flex items-center justify-between text-sm text-gray-600">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center">
                    <User className="h-4 w-4 mr-1" />
                    <span>{selectedPost.author}</span>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    <span>{selectedPost.publishDate}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center">
                    <Eye className="h-4 w-4 mr-1" />
                    <span>{selectedPost.views}</span>
                  </div>
                  <div className="flex items-center">
                    <Heart className="h-4 w-4 mr-1" />
                    <span>{selectedPost.likes}</span>
                  </div>
                  <div className="flex items-center">
                    <MessageCircle className="h-4 w-4 mr-1" />
                    <span>{selectedPost.comments}</span>
                  </div>
                </div>
              </div>
            </header>

            <div className="prose max-w-none">
              <p className="text-lg text-gray-700 leading-relaxed mb-6">{selectedPost.excerpt}</p>
              <div className="text-gray-900 leading-relaxed space-y-4">
                {selectedPost.content.split("\n").map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>
            </div>

            <footer className="mt-8 pt-6 border-t">
              <div className="flex items-center justify-between">
                <div className="flex flex-wrap gap-2">
                  {selectedPost.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
                <Button variant="outline" size="sm">
                  <Share2 className="h-4 w-4 mr-2" />
                  Share Article
                </Button>
              </div>
            </footer>
          </article>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" onClick={() => router.push("/")}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
              <div className="flex items-center space-x-3">
                <FileText className="h-6 w-6 text-purple-600" />
                <h1 className="text-xl font-semibold text-gray-900">Healthcare Blog</h1>
              </div>
            </div>
            <div className="text-sm text-gray-600">Welcome, {user.name}</div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Latest Medical Insights</h2>
          <p className="text-gray-600">Stay updated with the latest healthcare articles and medical research</p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search articles by title, content, or tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </Button>
            ))}
          </div>
        </div>

        {/* Blog Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPosts.map((post) => (
            <Card
              key={post.id}
              className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => setSelectedPost(post)}
            >
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="secondary" className="text-xs">
                    {post.category}
                  </Badge>
                  <span className="text-xs text-gray-500">{post.readTime}</span>
                </div>
                <CardTitle className="text-lg leading-tight">{post.title}</CardTitle>
                <CardDescription className="line-clamp-3">{post.excerpt}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <User className="h-4 w-4 mr-1" />
                    <span className="mr-4">{post.author}</span>
                    <Calendar className="h-4 w-4 mr-1" />
                    <span>{post.publishDate}</span>
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center">
                        <Eye className="h-3 w-3 mr-1" />
                        <span>{post.views}</span>
                      </div>
                      <div className="flex items-center">
                        <Heart className="h-3 w-3 mr-1" />
                        <span>{post.likes}</span>
                      </div>
                      <div className="flex items-center">
                        <MessageCircle className="h-3 w-3 mr-1" />
                        <span>{post.comments}</span>
                      </div>
                    </div>
                    <Clock className="h-3 w-3" />
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {post.tags.slice(0, 3).map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredPosts.length === 0 && (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No articles found</h3>
            <p className="text-gray-600">Try adjusting your search terms or filters</p>
          </div>
        )}
      </div>
    </div>
  )
}
