import { useIndexedDB } from './useIndexedDB.js'

const useDutyScheduler = () => {
  const { getRedDays, getBlueDays, getSpecialAssignments } = useIndexedDB()

  const generateMonthlySchedule = async (doctors, year, month) => {
    if (!doctors || doctors.length === 0) {
      throw new Error('Doktor listesi boş!')
    }
    
    // Ay başından ay başına planlama
    console.log(`Nöbet planlaması: ${doctors.length} doktor için ${year}-${month} ayı`)

    // Get days in month
    const daysInMonth = new Date(year, month, 0).getDate()
    const schedule = []

    // Load doctor constraints
    const doctorConstraints = await Promise.all(
      doctors.map(async (doctor) => {
        const [redDays, blueDays, specialAssignments] = await Promise.all([
          getRedDays(doctor.id),
          getBlueDays(doctor.id),
          getSpecialAssignments(doctor.id)
        ])
        return {
          ...doctor,
          redDays: redDays || [],
          blueDays: blueDays || [],
          specialAssignments: specialAssignments || {},
          remainingDuties24h: 6, // Her doktor 6 tane 24 saat nöbet
          remainingDuties16h: 2, // Her doktor 2 tane 16 saat nöbet
          lastDutyDate: null
        }
      })
    )

    // Vardiya gereksinimleri (Dinamik doktor sayısı için)
    const shiftRequirements = {
      morning: 4,   // 08:00-16:00 (Sabah) → 4 hekim
      evening: 4,   // 16:00-24:00 (Akşam) → 4 hekim  
      night: 3      // 00:00-08:00 (Gece) → 3 hekim
    }
    // Toplam: 11 hekim/gün × 30 gün = 330 nöbet/ay
    // Her doktor: 6×24h + 2×16h = 176 saat/ay
    // Toplam: 11 hekim/gün

    // Generate schedule for each day
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
      const yearMonth = `${year}-${String(month).padStart(2, '0')}`

      // Vardiyalar haftanın 7 günü ve tüm aya göre planlanır
      const date = new Date(year, month - 1, day)
      const isWeekend = date.getDay() === 0 || date.getDay() === 6 // Sunday or Saturday
      
      // Her gün normal vardiya günü - hafta sonu/hafta içi farkı yok

      // Process special assignments first
      const daySpecialAssignments = []
      doctorConstraints.forEach(doctor => {
        if (doctor.specialAssignments[dateStr]) {
          const shiftType = doctor.specialAssignments[dateStr]
          daySpecialAssignments.push({
            doctor_id: doctor.id,
            shift_type: shiftType,
            date: dateStr,
            year_month: yearMonth,
            is_special: true
          })
          
          // Update doctor's remaining duties
          if (shiftType === 'night') {
            doctor.remainingDuties16h = Math.max(0, doctor.remainingDuties16h - 1)
          } else {
            doctor.remainingDuties24h = Math.max(0, doctor.remainingDuties24h - 1)
          }
          doctor.lastDutyDate = dateStr
        }
      })

      // Add special assignments to schedule
      schedule.push(...daySpecialAssignments)

      // Calculate remaining requirements after special assignments
      const remainingRequirements = { ...shiftRequirements }
      daySpecialAssignments.forEach(assignment => {
        remainingRequirements[assignment.shift_type] = Math.max(0, remainingRequirements[assignment.shift_type] - 1)
      })

      // Assign remaining shifts
      for (const [shiftType, requiredCount] of Object.entries(remainingRequirements)) {
        if (requiredCount === 0) continue

        const assignedDoctors = assignShift(
          doctorConstraints,
          shiftType,
          dateStr,
          requiredCount,
          daySpecialAssignments.map(a => a.doctor_id)
        )

        assignedDoctors.forEach(doctorId => {
          schedule.push({
            doctor_id: doctorId,
            shift_type: shiftType,
            date: dateStr,
            year_month: yearMonth,
            is_special: false
          })

          // Update doctor's remaining duties and last duty date
          const doctor = doctorConstraints.find(d => d.id === doctorId)
          if (doctor) {
            if (shiftType === 'night') {
              doctor.remainingDuties16h = Math.max(0, doctor.remainingDuties16h - 1)
            } else {
              doctor.remainingDuties24h = Math.max(0, doctor.remainingDuties24h - 1)
            }
            doctor.lastDutyDate = dateStr
          }
        })
      }
    }

    return schedule
  }

  const assignShift = (doctorConstraints, shiftType, dateStr, requiredCount, excludedDoctorIds) => {
    const availableDoctors = doctorConstraints.filter(doctor => {
      // Exclude doctors already assigned for this day
      if (excludedDoctorIds.includes(doctor.id)) return false

      // Check red days - Kırmızı gün ise nöbet yazılmaz (tüm günler için geçerli)
      if (doctor.redDays && doctor.redDays.includes(dateStr)) return false

      // Check blue days - Mavi gün ise öncelikli olarak nöbet yazılır
      if (doctor.blueDays && doctor.blueDays.includes(dateStr)) return true

      // Check if doctor has remaining duties
      const hasRemainingDuties = shiftType === 'night' 
        ? doctor.remainingDuties16h > 0 
        : doctor.remainingDuties24h > 0

      if (!hasRemainingDuties) return false

      // Check consecutive duty rule
      if (doctor.lastDutyDate) {
        const lastDate = new Date(doctor.lastDutyDate)
        const currentDate = new Date(dateStr)
        const dayDifference = Math.abs((currentDate - lastDate) / (1000 * 60 * 60 * 24))
        
        if (dayDifference < 1) return false // No consecutive duties
      }

      return true
    })

    // Sort doctors by priority (those with more remaining duties first)
    availableDoctors.sort((a, b) => {
      const aDuties = shiftType === 'night' ? a.remainingDuties16h : a.remainingDuties24h
      const bDuties = shiftType === 'night' ? b.remainingDuties16h : b.remainingDuties24h
      return bDuties - aDuties
    })

    // Select required number of doctors
    const selectedDoctors = availableDoctors.slice(0, requiredCount)
    
    if (selectedDoctors.length < requiredCount) {
      console.warn(`Warning: Could not assign enough doctors for ${shiftType} shift on ${dateStr}. Required: ${requiredCount}, Assigned: ${selectedDoctors.length}`)
    }

    return selectedDoctors.map(doctor => doctor.id)
  }

  const validateSchedule = (schedule, doctors) => {
    const issues = []
    const doctorStats = {}

    // Initialize doctor stats
    doctors.forEach(doctor => {
      doctorStats[doctor.id] = {
        name: doctor.name,
        totalDuties: 0,
        morningDuties: 0,
        eveningDuties: 0,
        nightDuties: 0,
        consecutiveDuties: []
      }
    })

    // Analyze schedule
    schedule.forEach(duty => {
      const stats = doctorStats[duty.doctor_id]
      if (stats) {
        stats.totalDuties++
        stats[`${duty.shift_type}Duties`]++
      }
    })

    // Check for consecutive duties
    const sortedSchedule = schedule.sort((a, b) => new Date(a.date) - new Date(b.date))
    const doctorLastDuty = {}

    sortedSchedule.forEach(duty => {
      const lastDuty = doctorLastDuty[duty.doctor_id]
      if (lastDuty) {
        const lastDate = new Date(lastDuty.date)
        const currentDate = new Date(duty.date)
        const dayDifference = (currentDate - lastDate) / (1000 * 60 * 60 * 24)
        
        if (dayDifference === 1) {
          issues.push({
            type: 'consecutive_duty',
            doctor_id: duty.doctor_id,
            dates: [lastDuty.date, duty.date],
            message: `${doctorStats[duty.doctor_id].name} has consecutive duties on ${lastDuty.date} and ${duty.date}`
          })
        }
      }
      doctorLastDuty[duty.doctor_id] = duty
    })

    // Check duty distribution fairness
    const totalDuties = schedule.length
    const averageDuties = totalDuties / doctors.length
    const tolerance = 2 // Allow 2 duty difference

    Object.entries(doctorStats).forEach(([doctorId, stats]) => {
      if (Math.abs(stats.totalDuties - averageDuties) > tolerance) {
        issues.push({
          type: 'unfair_distribution',
          doctor_id: doctorId,
          actual: stats.totalDuties,
          expected: Math.round(averageDuties),
          message: `${stats.name} has ${stats.totalDuties} duties, expected around ${Math.round(averageDuties)}`
        })
      }
    })

    return {
      isValid: issues.length === 0,
      issues,
      statistics: doctorStats
    }
  }

  return {
    generateMonthlySchedule,
    validateSchedule
  }
}

export { useDutyScheduler }

