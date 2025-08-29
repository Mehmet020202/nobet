import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Calendar, RefreshCw, Users } from 'lucide-react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx'
import { useIndexedDB } from '../hooks/useIndexedDB.js'
import { useDutyScheduler } from '../hooks/useDutyScheduler.js'

const DutyCalendar = () => {
  // Ay başından ay başına planlama için
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth())
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [duties, setDuties] = useState([])
  const [doctors, setDoctors] = useState([])
  const [isGenerating, setIsGenerating] = useState(false)

  const { getDoctors, getDuties, saveDuties } = useIndexedDB()
  const { generateMonthlySchedule } = useDutyScheduler()

  useEffect(() => {
    loadData()
  }, [selectedMonth, selectedYear])

  const loadData = async () => {
    try {
      const [doctorList, dutyList] = await Promise.all([
        getDoctors(),
        getDuties(selectedYear, selectedMonth + 1)
      ])
      setDoctors(doctorList)
      setDuties(dutyList)
    } catch (error) {
      console.error('Error loading data:', error)
    }
  }

  const generateSchedule = async () => {
    if (doctors.length === 0) {
      alert('Önce doktor ekleyiniz!')
      return
    }

    setIsGenerating(true)
    try {
      const schedule = await generateMonthlySchedule(doctors, selectedYear, selectedMonth + 1)
      await saveDuties(schedule)
      await loadData()
    } catch (error) {
      console.error('Error generating schedule:', error)
      alert('Nöbet programı oluşturulurken hata oluştu!')
    } finally {
      setIsGenerating(false)
    }
  }

  const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (year, month) => {
    return new Date(year, month, 1).getDay()
  }

  const getDutiesForDate = (date) => {
    const dateStr = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-${String(date).padStart(2, '0')}`
    return duties.filter(duty => duty.date === dateStr)
  }

  const getDoctorName = (doctorId) => {
    const doctor = doctors.find(d => d.id === doctorId)
    return doctor ? doctor.name : 'Bilinmeyen'
  }

  const getShiftLabel = (shiftType) => {
    switch (shiftType) {
      case 'morning': return 'Sabah'
      case 'evening': return 'Akşam'
      case 'night': return 'Gece'
      default: return shiftType
    }
  }

  const getShiftColor = (shiftType) => {
    switch (shiftType) {
      case 'morning': return 'bg-yellow-100 text-yellow-800'
      case 'evening': return 'bg-orange-100 text-orange-800'
      case 'night': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(selectedYear, selectedMonth)
    const firstDay = getFirstDayOfMonth(selectedYear, selectedMonth)
    const days = []

    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="p-2"></div>)
    }

    // Days of the month
    for (let date = 1; date <= daysInMonth; date++) {
      const dayDuties = getDutiesForDate(date)
      const isToday = new Date().getDate() === date && 
                     new Date().getMonth() === selectedMonth && 
                     new Date().getFullYear() === selectedYear

      days.push(
        <div
          key={date}
          className={`p-2 border rounded-lg min-h-[120px] ${
            isToday ? 'bg-primary/10 border-primary' : 'bg-card border-border'
          }`}
        >
          <div className="font-semibold mb-2">{date}</div>
          <div className="space-y-1">
            {dayDuties.map((duty, index) => (
              <div
                key={index}
                className={`text-xs p-1 rounded ${getShiftColor(duty.shift_type)}`}
              >
                <div className="font-medium">{getShiftLabel(duty.shift_type)}</div>
                <div className="truncate">{getDoctorName(duty.doctor_id)}</div>
              </div>
            ))}
          </div>
        </div>
      )
    }

    return days
  }

  const months = [
    'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
    'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
  ]

  const years = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - 2 + i)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Nöbet Takvimi</h2>
          <p className="text-muted-foreground">Ay başından ay başına nöbet programını görüntüleyin ve yönetin</p>
        </div>
        <Button onClick={generateSchedule} disabled={isGenerating}>
          <RefreshCw className={`mr-2 h-4 w-4 ${isGenerating ? 'animate-spin' : ''}`} />
          {isGenerating ? 'Oluşturuluyor...' : 'Program Oluştur'}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Select value={selectedMonth.toString()} onValueChange={(value) => setSelectedMonth(parseInt(value))}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {months.map((month, index) => (
                    <SelectItem key={index} value={index.toString()}>
                      {month}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(parseInt(value))}>
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {years.map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="outline">
                <Users className="mr-1 h-3 w-3" />
                {doctors.length} Doktor
              </Badge>
              <Badge variant="outline">
                <Calendar className="mr-1 h-3 w-3" />
                {duties.length} Nöbet
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2 mb-4">
            {['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'].map((day) => (
              <div key={day} className="p-2 text-center font-semibold text-muted-foreground">
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-2">
            {renderCalendar()}
          </div>
        </CardContent>
      </Card>

      {duties.length === 0 && doctors.length > 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nöbet programı oluşturulmamış</h3>
            <p className="text-muted-foreground text-center mb-4">
              Bu ay için nöbet programı oluşturmak için "Program Oluştur" butonuna tıklayın
            </p>
            <Button onClick={generateSchedule} disabled={isGenerating}>
              <RefreshCw className={`mr-2 h-4 w-4 ${isGenerating ? 'animate-spin' : ''}`} />
              Program Oluştur
            </Button>
          </CardContent>
        </Card>
      )}

      {doctors.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Doktor bilgisi bulunamadı</h3>
            <p className="text-muted-foreground text-center mb-4">
              Nöbet programı oluşturmak için önce doktor bilgilerini ekleyiniz
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default DutyCalendar

