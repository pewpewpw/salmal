import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                 이거 살말?
                </h1>
                <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
                  선택장애를 앓고있는 모든 이에게...
                </p>
              </div>
              <div className="space-x-4">
                <Link href="/categories">
                  <Button className="px-8">
                    카테고리 보기
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/vote">
                  <Button variant="outline" className="px-8">
                    바로 투표
                  </Button>
                </Link>
                <Link href="/ranking">
                  <Button variant="outline" className="px-8">
                    랭킹 보기
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

