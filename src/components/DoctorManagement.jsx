import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Save, X, Users, Calendar as CalendarIcon } from 'lucide-react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Label } from '@/components/ui/label.jsx'
import { Switch } from '@/components/ui/switch.jsx'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Calendar } from '@/components/ui/calendar.jsx'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover.jsx'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx'
import { useIndexedDB } from '../hooks/useIndexedDB.js'

const DoctorManagement = () => {
  const [doctors, setDoctors] = useState([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingDoctor, setEditingDoctor] = useState(null)
    const [formData, setFormData] = useState({
    name: '',
    specialty: '',
    duty_rights_24h: 6, // Standart: 6 tane 24 saat nöbet
    duty_rights_16h: 2, // Standart: 2 tane 16 saat nöbet
    red_days: [],
    special_assignments: {}
  })
  const [selectedRedDays, setSelectedRedDays] = useState([])
  const [selectedBlueDays, setSelectedBlueDays] = useState([])
  const [isRedCalendarOpen, setIsRedCalendarOpen] = useState(false)
  const [isBlueCalendarOpen, setIsBlueCalendarOpen] = useState(false)

  const { addDoctor, getDoctors, updateDoctor, deleteDoctor, getRedDays, addRedDay, deleteRedDay, getBlueDays, addBlueDay, deleteBlueDay } = useIndexedDB()

  useEffect(() => {
    loadDoctors()
  }, [])

  const loadDoctors = async () => {
    try {
      const doctorList = await getDoctors()
      
      // Load red days and blue days for each doctor
      const doctorsWithDays = await Promise.all(
        doctorList.map(async (doctor) => {
          const [redDays, blueDays] = await Promise.all([
            getRedDays(doctor.id),
            getBlueDays(doctor.id)
          ])
          return {
            ...doctor,
            redDaysCount: redDays.length,
            blueDaysCount: blueDays.length
          }
        })
      )
      
      setDoctors(doctorsWithDays)
    } catch (error) {
      console.error('Error loading doctors:', error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      let doctorId
      if (editingDoctor) {
        await updateDoctor({ ...formData, id: editingDoctor.id })
        doctorId = editingDoctor.id
      } else {
        doctorId = crypto.randomUUID()
        await addDoctor({
          ...formData,
          id: doctorId,
          created_at: new Date().toISOString()
        })
      }
      
      // Save red days and blue days
      await saveRedDays(doctorId)
      await saveBlueDays(doctorId)
      
      await loadDoctors()
      resetForm()
      setIsDialogOpen(false)
    } catch (error) {
      console.error('Error saving doctor:', error)
    }
  }

  const handleEdit = async (doctor) => {
    setEditingDoctor(doctor)
    
    // Load red days and blue days for this doctor from database
    const [redDays, blueDays] = await Promise.all([
      getRedDays(doctor.id),
      getBlueDays(doctor.id)
    ])
    
    const redDayDates = redDays.map(dateStr => new Date(dateStr))
    const blueDayDates = blueDays.map(dateStr => new Date(dateStr))
    
    setFormData({
      name: doctor.name,
      specialty: doctor.specialty,
      duty_rights_24h: doctor.duty_rights_24h,
      duty_rights_16h: doctor.duty_rights_16h,
      blue_day_permission: doctor.blue_day_permission,
      red_days: redDays || [],
      special_assignments: doctor.special_assignments || {}
    })
    setSelectedRedDays(redDayDates)
    setSelectedBlueDays(blueDayDates)
    setIsDialogOpen(true)
  }

  const handleDelete = async (doctorId) => {
    if (confirm('Bu doktoru silmek istediğinizden emin misiniz?')) {
      try {
        await deleteDoctor(doctorId)
        await loadDoctors()
      } catch (error) {
        console.error('Error deleting doctor:', error)
      }
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      specialty: '',
      duty_rights_24h: 6,
      duty_rights_16h: 2,
      blue_day_permission: true,
      red_days: [],
      special_assignments: {}
    })
    setSelectedRedDays([])
    setSelectedBlueDays([])
    setEditingDoctor(null)
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }



  const handleRedDaySelect = (date) => {
    if (!date) return
    
    const dateExists = selectedRedDays.some(d => 
      d.getFullYear() === date.getFullYear() &&
      d.getMonth() === date.getMonth() &&
      d.getDate() === date.getDate()
    )
    
    if (dateExists) {
      // Remove date if already selected
      setSelectedRedDays(prev => prev.filter(d => 
        !(d.getFullYear() === date.getFullYear() &&
          d.getMonth() === date.getMonth() &&
          d.getDate() === date.getDate())
      ))
    } else {
      // Add date if not selected
      setSelectedRedDays(prev => [...prev, date])
    }
  }

  const handleBlueDaySelect = (date) => {
    if (!date) return
    
    const dateExists = selectedBlueDays.some(d => 
      d.getFullYear() === date.getFullYear() &&
      d.getMonth() === date.getMonth() &&
      d.getDate() === date.getDate()
    )
    
    if (dateExists) {
      // Remove date if already selected
      setSelectedBlueDays(prev => prev.filter(d => 
        !(d.getFullYear() === date.getFullYear() &&
          d.getMonth() === date.getMonth() &&
          d.getDate() === date.getDate())
      ))
    } else {
      // Add date if not selected
      setSelectedBlueDays(prev => [...prev, date])
    }
  }

  const formatRedDaysList = () => {
    return selectedRedDays
      .sort((a, b) => a - b)
      .map(date => 
        `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`
      )
      .join(', ')
  }

  const formatBlueDaysList = () => {
    return selectedBlueDays
      .sort((a, b) => a - b)
      .map(date => 
        `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`
      )
      .join(', ')
  }

  const saveRedDays = async (doctorId) => {
    try {
      // First, get existing red days and delete them
      const existingRedDays = await getRedDays(doctorId)
      for (const dateStr of existingRedDays) {
        await deleteRedDay(doctorId, dateStr)
      }
      
      // Add new red days
      for (const date of selectedRedDays) {
        const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
        await addRedDay(doctorId, dateStr)
      }
    } catch (error) {
      console.error('Error saving red days:', error)
    }
  }

  const saveBlueDays = async (doctorId) => {
    try {
      // First, get existing blue days and delete them
      const existingBlueDays = await getBlueDays(doctorId)
      for (const dateStr of existingBlueDays) {
        await deleteBlueDay(doctorId, dateStr)
      }
      
      // Add new blue days
      for (const date of selectedBlueDays) {
        const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
        await addBlueDay(doctorId, dateStr)
      }
    } catch (error) {
      console.error('Error saving blue days:', error)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Doktor Yönetimi</h2>
          <p className="text-muted-foreground">Doktor bilgilerini ekleyin, düzenleyin ve yönetin</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="mr-2 h-4 w-4" />
              Yeni Doktor
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>
                {editingDoctor ? 'Doktor Düzenle' : 'Yeni Doktor Ekle'}
              </DialogTitle>
              <DialogDescription>
                Doktor bilgilerini girin. Tüm alanlar zorunludur.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Ad Soyad</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Dr. Ahmet Yılmaz"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="specialty">Branş</Label>
                  <Input
                    id="specialty"
                    value={formData.specialty}
                    onChange={(e) => handleInputChange('specialty', e.target.value)}
                    placeholder="Kardiyoloji"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="duty_24h">24 Saat Nöbet Hakkı</Label>
                  <Input
                    id="duty_24h"
                    type="number"
                    min="0"
                    max="31"
                    value={formData.duty_rights_24h}
                    onChange={(e) => handleInputChange('duty_rights_24h', parseInt(e.target.value))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="duty_16h">16 Saat Nöbet Hakkı</Label>
                  <Input
                    id="duty_16h"
                    type="number"
                    min="0"
                    max="31"
                    value={formData.duty_rights_16h}
                    onChange={(e) => handleInputChange('duty_rights_16h', parseInt(e.target.value))}
                    required
                  />
                </div>
              </div>

              
              {/* Kırmızı Günler */}
              <div className="space-y-2">
                <Label>Kırmızı Günler (Özel İzin Günleri - Opsiyonel)</Label>
                <div className="flex items-center space-x-2">
                  <Popover open={isRedCalendarOpen} onOpenChange={setIsRedCalendarOpen}>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {selectedRedDays.length > 0 ? `${selectedRedDays.length} gün seçildi` : "Kırmızı günleri seçin"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="multiple"
                        selected={selectedRedDays}
                        onSelect={(dates) => setSelectedRedDays(dates || [])}
                        initialFocus
                      />
                      <div className="p-3 border-t">
                        <Button 
                          onClick={() => setIsRedCalendarOpen(false)} 
                          className="w-full"
                          size="sm"
                        >
                          Tamam
                        </Button>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
                {selectedRedDays.length > 0 && (
                  <div className="text-sm text-muted-foreground">
                    <strong>Seçilen günler:</strong> {formatRedDaysList()}
                  </div>
                )}
              </div>

              {/* Mavi Günler */}
              <div className="space-y-2">
                <Label>Mavi Günler (Özel Çalışma Günleri - Opsiyonel)</Label>
                <div className="flex items-center space-x-2">
                  <Popover open={isBlueCalendarOpen} onOpenChange={setIsBlueCalendarOpen}>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {selectedBlueDays.length === 0 
                          ? "Mavi gün seçin (opsiyonel)" 
                          : `${selectedBlueDays.length} gün seçildi`
                        }
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="multiple"
                        selected={selectedBlueDays}
                        onSelect={(dates) => setSelectedBlueDays(dates || [])}
                        initialFocus
                      />
                      <div className="p-3 border-t">
                        <Button 
                          onClick={() => setIsBlueCalendarOpen(false)} 
                          className="w-full"
                          size="sm"
                        >
                          Tamam
                        </Button>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
                {selectedBlueDays.length > 0 && (
                  <div className="text-sm text-muted-foreground">
                    <strong>Seçilen günler:</strong> {formatBlueDaysList()}
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  İptal
                </Button>
                <Button type="submit">
                  <Save className="mr-2 h-4 w-4" />
                  Kaydet
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {doctors.map((doctor) => (
          <Card key={doctor.id}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{doctor.name}</CardTitle>
                <div className="flex space-x-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEdit(doctor)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(doctor.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <CardDescription>{doctor.specialty}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>24 Saat Nöbet:</span>
                  <Badge variant="secondary">{doctor.duty_rights_24h}</Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span>16 Saat Nöbet:</span>
                  <Badge variant="secondary">{doctor.duty_rights_16h}</Badge>
                </div>

                <div className="flex justify-between text-sm">
                  <span>Kırmızı Günler:</span>
                  <Badge variant="secondary">
                    {doctor.redDaysCount || 0} gün
                  </Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Mavi Günler:</span>
                  <Badge variant="secondary">
                    {doctor.blueDaysCount || 0} gün
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {doctors.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Henüz doktor eklenmemiş</h3>
            <p className="text-muted-foreground text-center mb-4">
              Nöbet sistemi için doktor bilgilerini ekleyerek başlayın
            </p>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              İlk Doktoru Ekle
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default DoctorManagement

