import * as React from "react"
import { Clock } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface TimePickerProps {
  value?: string
  onChange?: (value: string) => void
  className?: string
  placeholder?: string
  disabled?: boolean
  id?: string
}

export function TimePicker({
  value = "",
  onChange,
  className,
  placeholder = "Select time",
  disabled = false,
  id,
}: TimePickerProps) {
  const [open, setOpen] = React.useState(false)
  const [hours, setHours] = React.useState("12")
  const [minutes, setMinutes] = React.useState("00")
  const [period, setPeriod] = React.useState("AM")

  // Parse the value when it changes
  React.useEffect(() => {
    if (value) {
      const [time] = value.split(' ')
      const [h, m] = time.split(':')
      
      if (h && m) {
        const hour24 = parseInt(h, 10)
        const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24
        const newPeriod = hour24 >= 12 ? "PM" : "AM"
        
        setHours(hour12.toString().padStart(2, '0'))
        setMinutes(m)
        setPeriod(newPeriod)
      }
    }
  }, [value])

  const formatTime = (h: string, m: string, p: string) => {
    const hour24 = p === "AM" 
      ? (h === "12" ? "00" : h.padStart(2, '0'))
      : (h === "12" ? "12" : (parseInt(h, 10) + 12).toString())
    
    return `${hour24}:${m.padStart(2, '0')}`
  }

  const handleTimeChange = (newHours: string, newMinutes: string, newPeriod: string) => {
    const formattedTime = formatTime(newHours, newMinutes, newPeriod)
    onChange?.(formattedTime)
  }

  const handleHourChange = (newHours: string) => {
    setHours(newHours)
    handleTimeChange(newHours, minutes, period)
  }

  const handleMinuteChange = (newMinutes: string) => {
    setMinutes(newMinutes)
    handleTimeChange(hours, newMinutes, period)
  }

  const handlePeriodChange = (newPeriod: string) => {
    setPeriod(newPeriod)
    handleTimeChange(hours, minutes, newPeriod)
  }

  const displayTime = value 
    ? `${hours}:${minutes} ${period}`
    : ""

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            !value && "text-muted-foreground",
            className
          )}
          disabled={disabled}
        >
          <Clock className="mr-2 h-4 w-4" />
          {displayTime || placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-4 z-[10001]" align="start">
        <div className="flex items-center space-x-2">
          <div className="flex flex-col space-y-2">
            <label className="text-sm font-medium">Hour</label>
            <select
              value={hours}
              onChange={(e) => handleHourChange(e.target.value)}
              className="px-3 py-2 border border-input rounded-md text-sm"
            >
              {Array.from({ length: 12 }, (_, i) => {
                const hour = (i + 1).toString().padStart(2, '0')
                return (
                  <option key={hour} value={hour}>
                    {hour}
                  </option>
                )
              })}
            </select>
          </div>
          
          <div className="flex flex-col space-y-2">
            <label className="text-sm font-medium">Minute</label>
            <select
              value={minutes}
              onChange={(e) => handleMinuteChange(e.target.value)}
              className="px-3 py-2 border border-input rounded-md text-sm"
            >
              {Array.from({ length: 60 }, (_, i) => {
                const minute = i.toString().padStart(2, '0')
                return (
                  <option key={minute} value={minute}>
                    {minute}
                  </option>
                )
              })}
            </select>
          </div>
          
          <div className="flex flex-col space-y-2">
            <label className="text-sm font-medium">Period</label>
            <select
              value={period}
              onChange={(e) => handlePeriodChange(e.target.value)}
              className="px-3 py-2 border border-input rounded-md text-sm"
            >
              <option value="AM">AM</option>
              <option value="PM">PM</option>
            </select>
          </div>
        </div>
        
        <div className="mt-4 flex justify-end space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const now = new Date()
              const currentHours = now.getHours()
              const currentMinutes = now.getMinutes()
              const hour12 = currentHours === 0 ? 12 : currentHours > 12 ? currentHours - 12 : currentHours
              const currentPeriod = currentHours >= 12 ? "PM" : "AM"
              
              setHours(hour12.toString().padStart(2, '0'))
              setMinutes(currentMinutes.toString().padStart(2, '0'))
              setPeriod(currentPeriod)
              handleTimeChange(
                hour12.toString().padStart(2, '0'),
                currentMinutes.toString().padStart(2, '0'),
                currentPeriod
              )
            }}
          >
            Now
          </Button>
          <Button
            size="sm"
            onClick={() => setOpen(false)}
          >
            Done
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
