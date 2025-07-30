"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"

// 카테고리 타입 정의
interface Category {
  id: string
  name: string
  description: string
  image: string
  itemCount: number
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // 카테고리 데이터 로드
    const categoryData: Category[] = [
      {
        id: "신발",
        name: "신발",
        description: "다양한 스타일의 신발 컬렉션",
        image: "/placeholder.svg?height=400&width=600",
        itemCount: 3,
      },
      {
        id: "의류",
        name: "의류",
        description: "트렌디한 의류 아이템",
        image: "/placeholder.svg?height=400&width=600",
        itemCount: 3,
      },
      {
        id: "악세사리",
        name: "악세사리",
        description: "스타일을 완성하는 악세사리",
        image: "/placeholder.svg?height=400&width=600",
        itemCount: 3,
      },
    ]

    setCategories(categoryData)
    setIsLoading(false)
  }, [])

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <Link href="/">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            홈으로
          </Button>
        </Link>
        <h1 className="text-2xl font-bold text-center">카테고리</h1>
        <div className="w-24"></div> {/* 균형을 위한 빈 공간 */}
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {categories.map((category) => (
          <Card key={category.id} className="overflow-hidden">
            <div className="relative aspect-[4/3] w-full">
              <Image src={category.image || "/placeholder.svg"} alt={category.name} fill className="object-cover" />
            </div>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-2">{category.name}</h2>
              <p className="text-muted-foreground">{category.description}</p>
              <p className="text-sm mt-2">아이템 수: {category.itemCount}</p>
            </CardContent>
            <CardFooter className="p-6 pt-0 flex gap-2">
              <Link href={`/vote?category=${category.id}`} className="flex-1">
                <Button variant="outline" className="w-full">
                  투표하기
                </Button>
              </Link>
              <Link href={`/ranking?category=${category.id}`} className="flex-1">
                <Button className="w-full">랭킹 보기</Button>
              </Link>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}

