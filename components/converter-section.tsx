import type React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowRightIcon } from "lucide-react"
import Link from "next/link"

interface ConverterProps {
  name: string
  description: string
}

interface ConverterSectionProps {
  title: string
  icon: React.ReactNode
  converters: ConverterProps[]
}

export function ConverterSection({ title, icon, converters }: ConverterSectionProps) {
  return (
    <section className="py-8">
      <div className="flex items-center gap-2 mb-6">
        {icon}
        <h2 className="text-2xl font-bold">{title}</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {converters.map((converter, index) => {
          // Convert the converter name to a URL-friendly format
          const converterSlug = converter.name.toLowerCase().replace(/ to /g, "-to-")

          return (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">{converter.name}</CardTitle>
                <CardDescription>{converter.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Link href={`/${converterSlug}`}>
                  <Button className="w-full" variant="outline">
                    Convert <ArrowRightIcon className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </section>
  )
}
