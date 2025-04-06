"use client"
import type React from "react"
import { useState, useRef, useEffect } from "react"
import Tesseract from "tesseract.js"
import { queryGemini } from "@/lib/gemini"
import {
  Upload,
  FileText,
  AlertCircle,
  CheckCircle,
  Activity,
  Loader2,
  Camera,
  Trash2,
  Heart,
  AlertTriangle,
  Info,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { motion, AnimatePresence } from "framer-motion"

interface HarmfulComponent {
  name: string
  reason: string
  recommendation?: string
  alternative?: string
}

interface AnalysisResponse {
  riskAssessment: string
  harmfulComponents?: HarmfulComponent[]
  generalAdvice?: string
}

const ImageUpload = () => {
  const [image, setImage] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [processingProgress, setProcessingProgress] = useState(0)
  const [text, setText] = useState<string>("")
  const [medicalConditions, setMedicalConditions] = useState<string>("")
  const [response, setResponse] = useState<AnalysisResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<string>("upload")
  const [dragActive, setDragActive] = useState<boolean>(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Simulate progress during processing
  useEffect(() => {
    let interval: NodeJS.Timeout

    if (isProcessing) {
      setProcessingProgress(0)
      interval = setInterval(() => {
        setProcessingProgress((prev) => {
          const newProgress = prev + Math.random() * 10
          return newProgress >= 95 ? 95 : newProgress
        })
      }, 500)
    } else if (processingProgress > 0) {
      setProcessingProgress(100)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isProcessing])

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files ? event.target.files[0] : null
    if (file) {
      processFile(file)
    }
  }

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()

    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0])
    }
  }

  const processFile = (file: File) => {
    setImage(URL.createObjectURL(file))
    setText("")
    setResponse(null)
    setError(null)
    setActiveTab("preview")
  }

  const handleImageAnalysis = async () => {
    if (!image) {
      setError("Please upload an image first!")
      return
    }

    if (!medicalConditions.trim()) {
      setError("Please enter your medical conditions")
      return
    }

    setIsProcessing(true)
    setText("")
    setResponse(null)
    setError(null)
    setActiveTab("results")

    try {
      const {
        data: { text: extractedText },
      } = await Tesseract.recognize(image, "eng")
      setText(extractedText)
      await sendToGeminiAPI(extractedText, medicalConditions)
    } catch (err) {
      console.error(err)
      setError("Failed to process image. Please try again.")
    } finally {
      setIsProcessing(false)
    }
  }

  const handleMedicalConditionsChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMedicalConditions(event.target.value)
  }

  const sendToGeminiAPI = async (tesseractText: string, conditions: string) => {
    try {
      const geminiResponse = await queryGemini(tesseractText, conditions)
      setResponse(geminiResponse)
    } catch (error) {
      console.error("Error calling Gemini API:", error)
      setError("Error analyzing nutrition data. Please try again.")
    }
  }

  const clearImage = () => {
    setImage(null)
    setText("")
    setResponse(null)
    setError(null)
    setActiveTab("upload")
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const getRiskColor = (risk: string) => {
    switch (risk.toLowerCase()) {
      case "high":
        return "bg-red-500"
      case "medium":
        return "bg-orange-500"
      case "low":
        return "bg-green-500"
      default:
        return "bg-blue-500"
    }
  }

  const getRiskIcon = (risk: string) => {
    switch (risk.toLowerCase()) {
      case "high":
        return <AlertCircle className="h-5 w-5" />
      case "medium":
        return <AlertTriangle className="h-5 w-5" />
      case "low":
        return <CheckCircle className="h-5 w-5" />
      default:
        return <Info className="h-5 w-5" />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 py-12 px-4 sm:px-6 relative">
      {/* Animated background elements */}
      <div className="absolute -top-20 -left-20 w-40 h-40 bg-purple-600 rounded-full filter blur-3xl opacity-10 animate-blob"></div>
      <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-red-600 rounded-full filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-orange-600 rounded-full filter blur-3xl opacity-10 animate-blob animation-delay-4000"></div>
      <div className="absolute inset-0 bg-[url('/placeholder.svg?height=200&width=200')] opacity-5"></div>

      <div className="max-w-4xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl md:text-6xl">
            <span className="block text-red-400">NutriScanAI</span>
          </h1>
          <p className="mt-3 max-w-md mx-auto text-base text-gray-400 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            Upload a nutrition label and enter your medical conditions to get personalized health insights.
          </p>
        </motion.div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8 bg-gray-800/50 border border-gray-700">
            <TabsTrigger
              value="upload"
              className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-600 data-[state=active]:to-orange-600 data-[state=active]:text-white"
            >
              <Upload className="h-4 w-4" />
              <span>Upload</span>
            </TabsTrigger>
            <TabsTrigger
              value="preview"
              disabled={!image}
              className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-600 data-[state=active]:to-orange-600 data-[state=active]:text-white"
            >
              <FileText className="h-4 w-4" />
              <span>Preview</span>
            </TabsTrigger>
            <TabsTrigger
              value="results"
              disabled={!response && !isProcessing}
              className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-600 data-[state=active]:to-orange-600 data-[state=active]:text-white"
            >
              <Activity className="h-4 w-4" />
              <span>Results</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload">
            <Card className="backdrop-blur-sm bg-black/40 border border-gray-800 shadow-2xl">
              <CardHeader>
                <CardTitle className="text-white">Upload Nutrition Label</CardTitle>
                <CardDescription className="text-gray-400">
                  Upload a clear image of a nutrition facts label to analyze
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div
                  className={`border-2 border-dashed rounded-lg p-12 text-center ${
                    dragActive ? "border-red-500 bg-red-500/10" : "border-gray-700 dark:border-gray-700"
                  } transition-colors duration-200 ease-in-out cursor-pointer`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <div className="flex flex-col items-center justify-center space-y-4">
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="bg-gradient-to-r from-red-600/20 to-orange-600/20 rounded-full p-4"
                    >
                      <Camera className="h-10 w-10 text-red-400" />
                    </motion.div>
                    <div>
                      <p className="text-lg font-medium text-white">Drag & drop or click to upload</p>
                      <p className="text-sm text-gray-400">Supports JPG, PNG, and WEBP</p>
                    </div>
                  </div>
                </div>

                <div className="mt-8">
                  <label className="block text-lg font-medium text-white mb-2">Your Medical Conditions</label>
                  <Textarea
                    placeholder="e.g. Diabetes, High Blood Pressure, Gluten Intolerance"
                    value={medicalConditions}
                    onChange={handleMedicalConditionsChange}
                    className="min-h-[120px] bg-gray-800/50 border border-gray-700 text-white placeholder:text-gray-500 focus:ring-red-500"
                  />
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button
                  variant="outline"
                  disabled={!medicalConditions.trim()}
                  className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
                >
                  Save Conditions
                </Button>
                <Button
                  onClick={handleImageAnalysis}
                  disabled={!image || !medicalConditions.trim()}
                  className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white"
                >
                  Analyze Label
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="preview">
            {image && (
              <Card className="backdrop-blur-sm bg-black/40 border border-gray-800 shadow-2xl">
                <CardHeader>
                  <CardTitle className="text-white">Preview Nutrition Label</CardTitle>
                  <CardDescription className="text-gray-400">
                    Confirm this is the correct image before analysis
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="relative">
                    <img
                      src={image || "/placeholder.svg"}
                      alt="Uploaded nutrition label"
                      className="max-h-[400px] mx-auto rounded-lg shadow-md object-contain"
                    />
                    <Button variant="destructive" size="icon" className="absolute top-2 right-2" onClick={clearImage}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="mt-8">
                    <label className="block text-lg font-medium text-white mb-2">Your Medical Conditions</label>
                    <Textarea
                      placeholder="e.g. Diabetes, High Blood Pressure, Gluten Intolerance"
                      value={medicalConditions}
                      onChange={handleMedicalConditionsChange}
                      className="min-h-[120px] bg-gray-800/50 border border-gray-700 text-white placeholder:text-gray-500 focus:ring-red-500"
                    />
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end">
                  <Button
                    onClick={handleImageAnalysis}
                    disabled={!medicalConditions.trim()}
                    className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white"
                  >
                    Analyze Label
                  </Button>
                </CardFooter>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="results">
            <Card className="backdrop-blur-sm bg-black/40 border border-gray-800 shadow-2xl">
              <CardHeader>
                <CardTitle className="text-white">Analysis Results</CardTitle>
                <CardDescription className="text-gray-400">
                  Personalized insights based on your nutrition label and medical conditions
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isProcessing ? (
                  <div className="py-12 flex flex-col items-center justify-center space-y-6">
                    <Loader2 className="h-12 w-12 text-red-400 animate-spin" />
                    <div className="text-center">
                      <h3 className="text-lg font-medium text-white">Analyzing nutrition information...</h3>
                      <p className="text-sm text-gray-400 mt-1">This may take a moment</p>
                    </div>
                    <div className="w-full max-w-md">
                      <Progress
                        value={processingProgress}
                        className="h-2 bg-gray-700"
                        style={{ background: 'linear-gradient(to right, #dc2626, #ea580c)' }}
                      />
                      <p className="text-xs text-right mt-1 text-gray-400">{Math.round(processingProgress)}%</p>
                    </div>
                  </div>
                ) : error ? (
                  <div className="py-12 flex flex-col items-center justify-center">
                    <div className="bg-red-900/20 rounded-full p-4 mb-4">
                      <AlertCircle className="h-8 w-8 text-red-400" />
                    </div>
                    <h3 className="text-lg font-medium text-white">Error</h3>
                    <p className="text-sm text-gray-400 mt-1">{error}</p>
                    <Button
                      variant="outline"
                      className="mt-6 border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
                      onClick={() => setActiveTab("upload")}
                    >
                      Try Again
                    </Button>
                  </div>
                ) : response ? (
                  <AnimatePresence>
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
                      <div className="mb-8 flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <h3 className="text-lg font-medium text-white">Risk Assessment:</h3>
                          <Badge
                            className={`${getRiskColor(response.riskAssessment)} text-white px-3 py-1 flex items-center gap-1`}
                          >
                            {getRiskIcon(response.riskAssessment)}
                            <span>{response.riskAssessment}</span>
                          </Badge>
                        </div>
                        <div className="flex items-center">
                          <Heart className="h-5 w-5 text-red-400 mr-1" />
                          <span className="text-sm text-gray-400">Personalized for your conditions</span>
                        </div>
                      </div>

                      {response.harmfulComponents && response.harmfulComponents.length > 0 && (
                        <div className="mb-8">
                          <h3 className="text-lg font-medium text-white mb-4">Potential Issues:</h3>
                          <div className="space-y-4">
                            {response.harmfulComponents.map((item, index) => (
                              <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3, delay: index * 0.1 }}
                                className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-4 shadow-sm border border-gray-700"
                              >
                                <div className="flex items-start">
                                  <div className="flex-shrink-0 mt-1">
                                    <AlertCircle className="h-5 w-5 text-amber-400" />
                                  </div>
                                  <div className="ml-3">
                                    <h4 className="text-md font-medium text-white">{item.name}</h4>
                                    <p className="mt-1 text-sm text-gray-400">{item.reason}</p>
                                    {item.recommendation && (
                                      <div className="mt-2 text-sm">
                                        <span className="font-medium text-red-400">Recommendation:</span>{" "}
                                        <span className="text-gray-300">{item.recommendation}</span>
                                      </div>
                                    )}
                                    {item.alternative && (
                                      <div className="mt-1 text-sm">
                                        <span className="font-medium text-orange-400">Alternative:</span>{" "}
                                        <span className="text-gray-300">{item.alternative}</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </motion.div>
                            ))}
                          </div>
                        </div>
                      )}

                      {response.generalAdvice && (
                        <div className="bg-gray-800/30 backdrop-blur-sm rounded-lg p-6 border border-gray-700">
                          <h3 className="text-lg font-medium text-white mb-2 flex items-center">
                            <Info className="h-5 w-5 text-blue-400 mr-2" />
                            General Advice
                          </h3>
                          <p className="text-gray-300">{response.generalAdvice}</p>
                        </div>
                      )}

                      {text && (
                        <div className="mt-8 pt-6 border-t border-gray-700">
                          <details className="text-sm">
                            <summary className="text-gray-400 cursor-pointer">View extracted text</summary>
                            <div className="mt-2 p-3 bg-gray-800/50 rounded text-gray-300 text-xs font-mono overflow-auto max-h-[200px]">
                              {text}
                            </div>
                          </details>
                        </div>
                      )}
                    </motion.div>
                  </AnimatePresence>
                ) : (
                  <div className="py-12 flex flex-col items-center justify-center">
                    <p className="text-gray-400">No results yet. Please analyze a nutrition label.</p>
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={clearImage}
                  className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
                >
                  Upload New Image
                </Button>
                {response && (
                  <Button className="bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white">
                    Save Results
                  </Button>
                )}
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>

        {error && !isProcessing && activeTab !== "results" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-4 bg-red-900/20 rounded-lg border border-red-800 text-red-400 flex items-center"
          >
            <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
            <p>{error}</p>
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default ImageUpload

