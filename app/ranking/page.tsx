"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, Trophy } from "lucide-react"
import { itemsApi, Item } from "@/lib/api"

export default function RankingPage() {
  const [items, setItems] = useState<Item[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [filteredItems, setFilteredItems] = useState<Item[]>([])

  useEffect(() => {
    const loadItems = async () => {
      try {
        const data = await itemsApi.getAll()
        setItems(data)
      } catch (error) {
        console.error('아이템 로드 오류:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadItems()
  }, [])

  // 카테고리 변경 시 필터링된 아이템 업데이트
  useEffect(() => {
    if (items.length > 0) {
      let filtered = [...items]
      if (selectedCategory !== "all") {
        filtered = items.filter((item) => item.category === selectedCategory)
      }

      // 랭킹 계산 및 정렬
      filtered.sort((a, b) => {
        // 선택 비율 계산 (선택 / (선택 + 패스))
        const aRatio = a.selects / (a.selects + a.passes) || 0
        const bRatio = b.selects / (b.selects + b.passes) || 0

        // 내림차순 정렬 (높은 비율이 상위 랭킹)
        return bRatio - aRatio
      })

      setFilteredItems(filtered)
    }
  }, [selectedCategory, items])

  // 카테고리 변경 핸들러
  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category)
  }

  // 카테고리별 아이템 수 계산
  const getCategoryCounts = () => {
    const counts = {
      all: items.length,
      신발: items.filter((item) => item.category === "신발").length,
      의류: items.filter((item) => item.category === "의류").length,
      악세사리: items.filter((item) => item.category === "악세사리").length,
    }
    return counts
  }

  const categoryCounts = getCategoryCounts()

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
        <h1 className="text-2xl font-bold text-center">아이템 랭킹</h1>
        <div className="w-24"></div> {/* 균형을 위한 빈 공간 */}
      </div>

      <div className="flex justify-center mb-6">
        <div className="inline-flex rounded-md shadow-sm" role="group">
          <Button
            variant={selectedCategory === "all" ? "default" : "outline"}
            className="rounded-l-md rounded-r-none"
            onClick={() => handleCategoryChange("all")}
          >
            전체 ({categoryCounts.all})
          </Button>
          <Button
            variant={selectedCategory === "신발" ? "default" : "outline"}
            className="rounded-none border-x-0"
            onClick={() => handleCategoryChange("신발")}
          >
            신발 ({categoryCounts.신발})
          </Button>
          <Button
            variant={selectedCategory === "의류" ? "default" : "outline"}
            className="rounded-none border-x-0"
            onClick={() => handleCategoryChange("의류")}
          >
            의류 ({categoryCounts.의류})
          </Button>
          <Button
            variant={selectedCategory === "악세사리" ? "default" : "outline"}
            className="rounded-r-md rounded-l-none"
            onClick={() => handleCategoryChange("악세사리")}
          >
            악세사리 ({categoryCounts.악세사리})
          </Button>
        </div>
      </div>

      {filteredItems.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">이 카테고리에 아이템이 없습니다.</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {filteredItems.map((item, index) => {
            // 선택 비율 계산
            const totalVotes = item.selects + item.passes
            const selectRatio = totalVotes > 0 ? (item.selects / totalVotes) * 100 : 0

            // 메달 색상 결정
            let medalColor = ""
            if (index === 0) medalColor = "text-yellow-500"
            else if (index === 1) medalColor = "text-gray-400"
            else if (index === 2) medalColor = "text-amber-700"

            return (
              <Card key={item.id} className="overflow-hidden">
                <div className="flex flex-col md:flex-row">
                  <div className="relative w-full md:w-48 h-48">
                    <Image src={item.image || "/placeholder.svg"} alt={item.name} fill className="object-cover" />
                  </div>
                  <CardContent className="flex-1 p-6">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted">
                        {index < 3 ? (
                          <Trophy className={`h-4 w-4 ${medalColor}`} />
                        ) : (
                          <span className="text-sm font-medium">{index + 1}</span>
                        )}
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                        <h2 className="text-xl font-semibold">{item.name}</h2>
                        <span className="inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium">
                          {item.category}
                        </span>
                      </div>
                    </div>

                    <p className="text-muted-foreground mb-4">{item.description}</p>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>선택 비율</span>
                        <span className="font-medium">{selectRatio.toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2.5">
                        <div className="bg-primary h-2.5 rounded-full" style={{ width: `${selectRatio}%` }}></div>
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>선택: {item.selects}</span>
                        <span>패스: {item.passes}</span>
                        <span>총 투표: {totalVotes}</span>
                      </div>
                    </div>
                  </CardContent>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      <div className="mt-8 text-center">
        <Link href="/vote">
          <Button>더 투표하기</Button>
        </Link>
      </div>
    </div>
  )
}

