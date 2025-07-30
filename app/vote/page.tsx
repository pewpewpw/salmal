"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Check, X } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useToast } from "@/hooks/use-toast"
import { itemsApi, Item } from "@/lib/api"

export default function VotePage() {
  const { toast } = useToast()
  const [items, setItems] = useState<Item[]>([])
  const [currentItemIndex, setCurrentItemIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [isVoting, setIsVoting] = useState(false)
  const [votedAll, setVotedAll] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [filteredItems, setFilteredItems] = useState<Item[]>([])

  // 초기 아이템 데이터 로드
  useEffect(() => {
    const loadItems = async () => {
      try {
        const data = await itemsApi.getAll()
        setItems(data)
      } catch (error) {
        console.error('아이템 로드 오류:', error)
        toast({
          title: "오류",
          description: "아이템을 불러오는데 실패했습니다.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadItems()
  }, [toast])

  // 카테고리 변경 시 필터링된 아이템 업데이트
  useEffect(() => {
    if (items.length > 0) {
      let filtered = items
      if (selectedCategory !== "all") {
        filtered = items.filter((item) => item.category === selectedCategory)
      }
      setFilteredItems(filtered)
      setCurrentItemIndex(0)
      setVotedAll(false)
    }
  }, [selectedCategory, items])

  // 현재 표시할 아이템
  const currentItem = filteredItems[currentItemIndex]

  // 선택 또는 패스 처리
  const handleVote = async (isSelect: boolean) => {
    if (isVoting || !currentItem) return

    setIsVoting(true)

    try {
      // 백엔드 API로 투표 전송
      await itemsApi.vote(currentItem.id, isSelect ? 'select' : 'pass')

      // 로컬 상태 업데이트
      const updatedItems = items.map(item => 
        item.id === currentItem.id 
          ? { 
              ...item, 
              selects: isSelect ? item.selects + 1 : item.selects,
              passes: isSelect ? item.passes : item.passes + 1
            }
          : item
      )
      setItems(updatedItems)

      toast({
        title: isSelect ? "선택 완료!" : "패스 완료!",
        description: `${currentItem.name}을(를) ${isSelect ? '선택' : '패스'}했습니다.`,
      })

      // 다음 아이템으로 이동 또는 종료
      setTimeout(() => {
        if (currentItemIndex < filteredItems.length - 1) {
          setCurrentItemIndex(currentItemIndex + 1)
        } else {
          setVotedAll(true)
        }
        setIsVoting(false)
      }, 500)

    } catch (error) {
      console.error('투표 처리 오류:', error)
      toast({
        title: "오류",
        description: "투표 처리에 실패했습니다.",
        variant: "destructive",
      })
      setIsVoting(false)
    }
  }

  // 카테고리 변경 핸들러
  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category)
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (votedAll) {
    return (
      <div className="container mx-auto px-4 py-12 flex flex-col items-center justify-center min-h-[70vh]">
        <h1 className="text-2xl font-bold mb-6">
          {selectedCategory === "all" ? "모든 아이템" : `${selectedCategory} 카테고리의 모든 아이템`}에 투표했습니다!
        </h1>
        <p className="text-muted-foreground mb-8">랭킹 페이지에서 결과를 확인해보세요.</p>
        <div className="flex gap-4">
          <Link href="/ranking">
            <Button size="lg">랭킹 보기</Button>
          </Link>
          <Button variant="outline" size="lg" onClick={() => setSelectedCategory("all")}>
            모든 카테고리 투표하기
          </Button>
        </div>
      </div>
    )
  }

  if (!currentItem) {
    return (
      <div className="container mx-auto px-4 py-12 flex flex-col items-center justify-center min-h-[70vh]">
        <h1 className="text-2xl font-bold mb-6">이 카테고리에 아이템이 없습니다</h1>
        <Button variant="outline" size="lg" onClick={() => setSelectedCategory("all")}>
          모든 카테고리 보기
        </Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-center mb-8">아이템 투표</h1>

      <div className="flex justify-center mb-6">
        <div className="inline-flex rounded-md shadow-sm" role="group">
          <Button
            variant={selectedCategory === "all" ? "default" : "outline"}
            className="rounded-l-md rounded-r-none"
            onClick={() => handleCategoryChange("all")}
          >
            전체
          </Button>
          <Button
            variant={selectedCategory === "신발" ? "default" : "outline"}
            className="rounded-none border-x-0"
            onClick={() => handleCategoryChange("신발")}
          >
            신발
          </Button>
          <Button
            variant={selectedCategory === "의류" ? "default" : "outline"}
            className="rounded-none border-x-0"
            onClick={() => handleCategoryChange("의류")}
          >
            의류
          </Button>
          <Button
            variant={selectedCategory === "악세사리" ? "default" : "outline"}
            className="rounded-r-md rounded-l-none"
            onClick={() => handleCategoryChange("악세사리")}
          >
            악세사리
          </Button>
        </div>
      </div>

      <div className="flex justify-center mb-4">
        <p className="text-sm text-muted-foreground">
          {currentItemIndex + 1} / {filteredItems.length} • {currentItem.category}
        </p>
      </div>

      <div className="flex justify-center">
        <Card className="w-full max-w-md overflow-hidden">
          <div className="relative aspect-[4/3] w-full">
            <Image
              src={currentItem.image || "/placeholder.svg"}
              alt={currentItem.name}
              fill
              className="object-cover"
              priority
            />
          </div>
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-2">
              <h2 className="text-xl font-semibold">{currentItem.name}</h2>
              <span className="inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium">
                {currentItem.category}
              </span>
            </div>
            <p className="text-muted-foreground mb-6">{currentItem.description}</p>

            <div className="flex justify-between gap-4">
              <Button
                variant="outline"
                size="lg"
                className="w-1/2 border-red-500 hover:bg-red-500/10 text-red-500"
                onClick={() => handleVote(false)}
                disabled={isVoting}
              >
                <X className="mr-2 h-5 w-5" />
                패스
              </Button>
              <Button
                size="lg"
                className="w-1/2 bg-green-500 hover:bg-green-600"
                onClick={() => handleVote(true)}
                disabled={isVoting}
              >
                <Check className="mr-2 h-5 w-5" />
                선택
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

