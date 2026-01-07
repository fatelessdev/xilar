"use client" // Client component for interactivity

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { MessageCircle, X, Send } from "lucide-react"
import { cn } from "@/lib/utils"

export function BargainAI() {
    const [isOpen, setIsOpen] = useState(false)
    const [messages, setMessages] = useState([
        { role: "ai", text: "Yo! I'm Bargain AI. Looking for a fresh fit? I can hook you up with discounts." }
    ])
    const [input, setInput] = useState("")

    const handleSend = () => {
        if (!input.trim()) return
        setMessages([...messages, { role: "user", text: input }])

        // Mock Response Logic
        setTimeout(() => {
            let response = "That's fire! Check out the Cargo pants."
            if (input.toLowerCase().includes("discount") || input.toLowerCase().includes("code")) {
                response = "I got you. Use code 'STREET10' for 10% off. Don't tell anyone."
            }
            setMessages(prev => [...prev, { role: "ai", text: response }])
        }, 1000)

        setInput("")
    }

    return (
        <div className="fixed bottom-6 right-6 z-50">
            {!isOpen && (
                <Button
                    onClick={() => setIsOpen(true)}
                    size="icon"
                    className="h-14 w-14 rounded-full shadow-2xl bg-foreground text-background hover:scale-110 transition-transform duration-300"
                >
                    <MessageCircle className="h-6 w-6" />
                </Button>
            )}

            {isOpen && (
                <div className="w-80 sm:w-96 bg-background border border-border shadow-2xl rounded-lg overflow-hidden flex flex-col h-[500px] animate-in slide-in-from-bottom-5 fade-in duration-300">
                    {/* Header */}
                    <div className="p-4 bg-foreground text-background flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                            <span className="font-bold tracking-tight">Bargain AI</span>
                        </div>
                        <Button variant="ghost" size="icon" className="h-6 w-6 text-background" onClick={() => setIsOpen(false)}>
                            <X className="h-4 w-4" />
                        </Button>
                    </div>

                    {/* Chat Area */}
                    <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-secondary/30">
                        {messages.map((msg, idx) => (
                            <div key={idx} className={cn("flex w-full", msg.role === 'user' ? "justify-end" : "justify-start")}>
                                <div className={cn(
                                    "max-w-[80%] p-3 text-sm rounded-lg",
                                    msg.role === 'user'
                                        ? "bg-primary text-primary-foreground rounded-br-none"
                                        : "bg-card border border-border rounded-bl-none"
                                )}>
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Input Area */}
                    <div className="p-3 border-t bg-background flex gap-2">
                        <input
                            className="flex-1 bg-transparent border-none focus:outline-none text-sm px-2"
                            placeholder="Ask for a discount..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        />
                        <Button size="icon" onClick={handleSend} className="rounded-full h-8 w-8">
                            <Send className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            )}
        </div>
    )
}
