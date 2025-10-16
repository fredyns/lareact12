import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Input } from "@/components/ui/input"

interface DatePickerProps {
  date?: Date
  onDateChange?: (date: Date | undefined) => void
  placeholder?: string
  className?: string
  disabled?: boolean
  showTime?: boolean
}

export function DatePicker({
  date,
  onDateChange,
  placeholder = "Pick a date",
  className,
  disabled = false,
  showTime = false,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false)
  const [timeValue, setTimeValue] = React.useState("")

  // Initialize time value when date changes
  React.useEffect(() => {
    if (date && showTime) {
      setTimeValue(format(date, "HH:mm"))
    }
  }, [date, showTime])

  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (!selectedDate) {
      onDateChange?.(undefined)
      return
    }

    let newDate = selectedDate
    
    // If showTime is enabled and we have a time value, combine date and time
    if (showTime && timeValue) {
      const [hours, minutes] = timeValue.split(':').map(Number)
      newDate = new Date(selectedDate)
      newDate.setHours(hours, minutes, 0, 0)
    }
    
    onDateChange?.(newDate)
    if (!showTime) {
      setOpen(false)
    }
  }

  const handleTimeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newTimeValue = event.target.value
    setTimeValue(newTimeValue)
    
    if (date && newTimeValue) {
      const [hours, minutes] = newTimeValue.split(':').map(Number)
      const newDate = new Date(date)
      newDate.setHours(hours, minutes, 0, 0)
      onDateChange?.(newDate)
    }
  }

  const formatDisplayDate = (date: Date) => {
    if (showTime) {
      return format(date, "PPP p") // Date with time
    }
    return format(date, "PPP") // Date only
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            !date && "text-muted-foreground",
            className
          )}
          disabled={disabled}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? formatDisplayDate(date) : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 z-[6010]" align="start">
        <Calendar
          selected={date}
          onSelect={handleDateSelect}
        />
        {showTime && (
          <div className="p-3 border-t">
            <label className="text-sm font-medium mb-2 block">Time</label>
            <Input
              type="time"
              value={timeValue}
              onChange={handleTimeChange}
              className="w-full"
            />
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}
