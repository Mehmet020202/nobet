import * as XLSX from 'xlsx'

const useExport = () => {
  const exportToPDF = async (duties, doctors, year, month) => {
    try {
      if (!duties || duties.length === 0) {
        throw new Error('Nöbet verisi bulunamadı')
      }
      if (!doctors || doctors.length === 0) {
        throw new Error('Doktor verisi bulunamadı')
      }
      
      console.log('HTML PDF export başlıyor...', { duties: duties.length, doctors: doctors.length })
      
      // Ay isimleri
      const months = [
        'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
        'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
      ]
      
      // Doktor ismi fonksiyonu
      const getDoctorName = (doctorId) => {
        const doctor = doctors.find(d => d.id === doctorId)
        return doctor ? doctor.name : 'Bilinmeyen'
      }
      
      // Nöbetleri tarihe göre grupla
      const dutiesByDate = {}
      duties.forEach(duty => {
        if (!dutiesByDate[duty.date]) {
          dutiesByDate[duty.date] = { morning: [], evening: [], night: [] }
        }
        dutiesByDate[duty.date][duty.shift_type].push(duty)
      })
      
      // HTML içeriği oluştur
      let htmlContent = `
        <!DOCTYPE html>
        <html lang="tr">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Hastane Nöbet Programı</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .title { font-size: 24px; font-weight: bold; margin-bottom: 10px; }
            .subtitle { font-size: 18px; color: #666; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; font-weight: bold; }
            .morning { background-color: #fff3cd; }
            .evening { background-color: #f8d7da; }
            .night { background-color: #d1ecf1; }
            .stats-table { margin-top: 40px; }
            .page-break { page-break-before: always; }
            @media print {
              body { margin: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="title">Hastane Nöbet Programı</div>
            <div class="subtitle">${months[month - 1]} ${year}</div>
          </div>
          
          <table>
            <thead>
              <tr>
                <th>Tarih</th>
                <th>Sabah (08:00-16:00)</th>
                <th>Akşam (16:00-24:00)</th>
                <th>Gece (00:00-08:00)</th>
              </tr>
            </thead>
            <tbody>
      `
      
      // Tarihleri sırala ve tablo satırları oluştur
      const sortedDates = Object.keys(dutiesByDate).sort()
      sortedDates.forEach(date => {
        const dayDuties = dutiesByDate[date]
        const dateObj = new Date(date)
        const dayName = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'][dateObj.getDay()]
        const dayMonth = `${dateObj.getDate()}/${dateObj.getMonth() + 1} ${dayName}`
        
        htmlContent += `
          <tr>
            <td><strong>${dayMonth}</strong></td>
            <td class="morning">${dayDuties.morning && dayDuties.morning.length > 0 ? dayDuties.morning.map(d => getDoctorName(d.doctor_id)).join(', ') : '-'}</td>
            <td class="evening">${dayDuties.evening && dayDuties.evening.length > 0 ? dayDuties.evening.map(d => getDoctorName(d.doctor_id)).join(', ') : '-'}</td>
            <td class="night">${dayDuties.night && dayDuties.night.length > 0 ? dayDuties.night.map(d => getDoctorName(d.doctor_id)).join(', ') : '-'}</td>
          </tr>
        `
      })
      
      htmlContent += `
            </tbody>
          </table>
          
          <div class="page-break"></div>
          
          <div class="header">
            <div class="title">Doktor İstatistikleri</div>
          </div>
          
          <table class="stats-table">
            <thead>
              <tr>
                <th>Doktor Adı</th>
                <th>Toplam Nöbet</th>
                <th>Sabah</th>
                <th>Akşam</th>
                <th>Gece</th>
                <th>Branş</th>
              </tr>
            </thead>
            <tbody>
      `
      
      // Doktor istatistikleri
      doctors.forEach(doctor => {
        const doctorDuties = duties.filter(d => d.doctor_id === doctor.id)
        const stats = {
          total: doctorDuties.length,
          morning: doctorDuties.filter(d => d.shift_type === 'morning').length,
          evening: doctorDuties.filter(d => d.shift_type === 'evening').length,
          night: doctorDuties.filter(d => d.shift_type === 'night').length
        }
        
        htmlContent += `
          <tr>
            <td><strong>${doctor.name}</strong></td>
            <td>${stats.total}</td>
            <td>${stats.morning}</td>
            <td>${stats.evening}</td>
            <td>${stats.night}</td>
            <td>${doctor.specialty || '-'}</td>
          </tr>
        `
      })
      
      htmlContent += `
            </tbody>
          </table>
          
          <div class="no-print" style="margin-top: 30px; text-align: center;">
            <button onclick="window.print()" style="padding: 10px 20px; font-size: 16px; background-color: #007bff; color: white; border: none; border-radius: 5px; cursor: pointer;">
              Yazdır / PDF Olarak Kaydet
            </button>
          </div>
          
          <div style="margin-top: 20px; text-align: center; font-size: 12px; color: #666;">
            ALTUĞ KUYUMCULUK 05432405202 KAHTA ADIYAMAN
          </div>
        </body>
        </html>
      `
      
      // HTML dosyasını oluştur ve indir
      const fileName = `nobet-programi-${months[month - 1]}-${year}.html`
      const blob = new Blob([htmlContent], { type: 'text/html' })
      const url = URL.createObjectURL(blob)
      
      const link = document.createElement('a')
      link.href = url
      link.download = fileName
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      
      console.log('HTML PDF export tamamlandı:', fileName)
      
    } catch (error) {
      console.error('HTML PDF export hatası:', error)
      throw error
    }
  }
  
  const exportToExcel = async (duties, doctors, year, month) => {
    try {
      if (!duties || duties.length === 0) {
        throw new Error('Nöbet verisi bulunamadı')
      }
      if (!doctors || doctors.length === 0) {
        throw new Error('Doktor verisi bulunamadı')
      }
      
      console.log('Excel export başlıyor...', { duties: duties.length, doctors: doctors.length })
    const months = [
      'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
      'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
    ]
    
    // Get doctor abbreviation (first letters of name)
    const getDoctorAbbr = (doctorId) => {
      const doctor = doctors.find(d => d.id === doctorId)
      if (!doctor) return 'XX'
      const nameParts = doctor.name.split(' ')
      if (nameParts.length >= 2) {
        return nameParts[0].charAt(0).toUpperCase() + nameParts[1].charAt(0).toUpperCase()
      }
      return doctor.name.substring(0, 2).toUpperCase()
    }
    
    // Create workbook
    const wb = XLSX.utils.book_new()
    
    // Group duties by date
    const dutiesByDate = {}
    duties.forEach(duty => {
      if (!dutiesByDate[duty.date]) {
        dutiesByDate[duty.date] = { morning: [], evening: [], night: [] }
      }
      dutiesByDate[duty.date][duty.shift_type].push(duty)
    })
    
    // Get days in month
    const daysInMonth = new Date(year, month, 0).getDate()
    
    // Create main schedule data (örneğinize uygun format)
    const scheduleData = []
    
    // Title row
    scheduleData.push([`Hastane Nöbet Sistemi ${months[month - 1].toUpperCase()} ${year} Doktor Nöbet Listesi`])
    scheduleData.push([]) // Empty row
    
    // Header row
    const headerRow = [
      'Tarih', '', 
      '08:00-16:00', '', '', '', '',
      '16:00-24:00', '', '', '', '',
      '24:00-08:00', '', '', 
      '', // Doktor listesi için boşluk
      'Doktor Listesi'
    ]
    scheduleData.push(headerRow)
    
    // Sub-header row
    const subHeaderRow = [
      '', '',
      'Sabah Vardiyası', '', '', '', '',
      'Akşam Vardiyası', '', '', '', '',
      'Gece Vardiyası', '', '',
      'No', 'Doktor Adı'
    ]
    scheduleData.push(subHeaderRow)
    
    // Days data
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
      const dateObj = new Date(year, month - 1, day)
      const dayName = ['PAZAR', 'PAZARTESİ', 'SALI', 'ÇARŞAMBA', 'PERŞEMBE', 'CUMA', 'CUMARTESİ'][dateObj.getDay()]
      const isWeekend = dateObj.getDay() === 0 || dateObj.getDay() === 6
      
      const dayDuties = dutiesByDate[dateStr] || { morning: [], evening: [], night: [] }
      
      // Format date
      const formattedDate = `${String(day).padStart(2, '0')}.${String(month).padStart(2, '0')}.${String(year).substring(2)}`
      
      // Get doctor abbreviations for each shift
      const morningDocs = dayDuties.morning.slice(0, 4).map(d => getDoctorAbbr(d.doctor_id))
      const eveningDocs = dayDuties.evening.slice(0, 4).map(d => getDoctorAbbr(d.doctor_id))
      const nightDocs = dayDuties.night.slice(0, 3).map(d => getDoctorAbbr(d.doctor_id))
      
      // Pad arrays to required lengths
      while (morningDocs.length < 4) morningDocs.push('')
      while (eveningDocs.length < 4) eveningDocs.push('')
      while (nightDocs.length < 3) nightDocs.push('')
      
      // Create row
      const row = [
        formattedDate,
        dayName,
        ...morningDocs, '', // 4 morning + 1 empty
        ...eveningDocs, '', // 4 evening + 1 empty
        ...nightDocs, '', // 3 night + 1 empty
        day <= doctors.length ? day : '', // Doctor number
        day <= doctors.length ? doctors[day - 1]?.name || '' : '' // Doctor name
      ]
      
      scheduleData.push(row)
    }
    
    // Add empty rows and doctor info
    for (let i = daysInMonth + 1; i <= doctors.length; i++) {
      const row = Array(17).fill('') // 17 columns total
      row[15] = i // Doctor number
      row[16] = doctors[i - 1]?.name || '' // Doctor name
      scheduleData.push(row)
    }
    
    const scheduleSheet = XLSX.utils.aoa_to_sheet(scheduleData)
    
    // Set column widths
    scheduleSheet['!cols'] = [
      { width: 10 }, // Date
      { width: 12 }, // Day
      { width: 8 }, { width: 8 }, { width: 8 }, { width: 8 }, { width: 3 }, // Morning
      { width: 8 }, { width: 8 }, { width: 8 }, { width: 8 }, { width: 3 }, // Evening
      { width: 8 }, { width: 8 }, { width: 8 }, { width: 3 }, // Night
      { width: 5 }, // No
      { width: 20 } // Doctor name
    ]
    
    XLSX.utils.book_append_sheet(wb, scheduleSheet, 'Nöbet Programı')
    
    // Statistics sheet
    const statsData = []
    statsData.push(['Doktor İstatistikleri'])
    statsData.push([])
    statsData.push(['Doktor Adı', 'Toplam Nöbet', 'Sabah', 'Akşam', 'Gece', 'Branş'])
    
    doctors.forEach(doctor => {
      const doctorDuties = duties.filter(d => d.doctor_id === doctor.id)
      const stats = {
        total: doctorDuties.length,
        morning: doctorDuties.filter(d => d.shift_type === 'morning').length,
        evening: doctorDuties.filter(d => d.shift_type === 'evening').length,
        night: doctorDuties.filter(d => d.shift_type === 'night').length
      }
      
      statsData.push([
        doctor.name,
        stats.total,
        stats.morning,
        stats.evening,
        stats.night,
        doctor.specialty
      ])
    })
    
    const statsSheet = XLSX.utils.aoa_to_sheet(statsData)
    XLSX.utils.book_append_sheet(wb, statsSheet, 'İstatistikler')
    
    // Save Excel file
    const fileName = `nobet-programi-${months[month - 1]}-${year}.xlsx`
    XLSX.writeFile(wb, fileName)
    console.log('Excel export tamamlandı:', fileName)
    } catch (error) {
      console.error('Excel export hatası:', error)
      throw error
    }
  }
  
  return {
    exportToPDF,
    exportToExcel
  }
}

export { useExport }

