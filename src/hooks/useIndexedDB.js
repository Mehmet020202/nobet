import { useState, useEffect } from 'react'

const DB_NAME = 'NobetSistemiDB'
const DB_VERSION = 1

const useIndexedDB = () => {
  const [db, setDb] = useState(null)

  useEffect(() => {
    initDB()
  }, [])

  const initDB = () => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION)

      request.onerror = () => {
        console.error('IndexedDB error:', request.error)
        reject(request.error)
      }

      request.onsuccess = () => {
        const database = request.result
        setDb(database)
        resolve(database)
      }

      request.onupgradeneeded = (event) => {
        const database = event.target.result

        // Doctors store
        if (!database.objectStoreNames.contains('doctors')) {
          const doctorStore = database.createObjectStore('doctors', { keyPath: 'id' })
          doctorStore.createIndex('name', 'name', { unique: false })
          doctorStore.createIndex('specialty', 'specialty', { unique: false })
        }

        // Duties store
        if (!database.objectStoreNames.contains('duties')) {
          const dutyStore = database.createObjectStore('duties', { keyPath: 'id' })
          dutyStore.createIndex('date', 'date', { unique: false })
          dutyStore.createIndex('doctor_id', 'doctor_id', { unique: false })
          dutyStore.createIndex('shift_type', 'shift_type', { unique: false })
          dutyStore.createIndex('year_month', 'year_month', { unique: false })
        }

        // Settings store
        if (!database.objectStoreNames.contains('settings')) {
          database.createObjectStore('settings', { keyPath: 'id' })
        }

        // Red days store (for doctor-specific red days)
        if (!database.objectStoreNames.contains('red_days')) {
          const redDaysStore = database.createObjectStore('red_days', { keyPath: 'id' })
          redDaysStore.createIndex('doctor_id', 'doctor_id', { unique: false })
          redDaysStore.createIndex('date', 'date', { unique: false })
        }

        // Blue days store (for doctor-specific blue days)
        if (!database.objectStoreNames.contains('blue_days')) {
          const blueDaysStore = database.createObjectStore('blue_days', { keyPath: 'id' })
          blueDaysStore.createIndex('doctor_id', 'doctor_id', { unique: false })
          blueDaysStore.createIndex('date', 'date', { unique: false })
        }

        // Special assignments store
        if (!database.objectStoreNames.contains('special_assignments')) {
          const specialStore = database.createObjectStore('special_assignments', { keyPath: 'id' })
          specialStore.createIndex('doctor_id', 'doctor_id', { unique: false })
          specialStore.createIndex('date', 'date', { unique: false })
        }

        setDb(database)
      }
    })
  }

  // Doctor operations
  const addDoctor = async (doctor) => {
    let database = db
    if (!database) {
      database = await initDB()
    }
    return new Promise((resolve, reject) => {
      const transaction = database.transaction(['doctors'], 'readwrite')
      const store = transaction.objectStore('doctors')
      const request = store.add(doctor)

      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }

  const getDoctors = async () => {
    let database = db
    if (!database) {
      database = await initDB()
    }
    return new Promise((resolve, reject) => {
      if (!database) {
        reject(new Error('Database not initialized'))
        return
      }
      const transaction = database.transaction(['doctors'], 'readonly')
      const store = transaction.objectStore('doctors')
      const request = store.getAll()

      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }

  const updateDoctor = async (doctor) => {
    let database = db
    if (!database) {
      database = await initDB()
    }
    return new Promise((resolve, reject) => {
      const transaction = database.transaction(['doctors'], 'readwrite')
      const store = transaction.objectStore('doctors')
      const request = store.put(doctor)

      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }

  const deleteDoctor = async (doctorId) => {
    let database = db
    if (!database) {
      database = await initDB()
    }
    return new Promise((resolve, reject) => {
      const transaction = database.transaction(['doctors', 'duties', 'red_days', 'special_assignments'], 'readwrite')
      
      // Delete doctor
      const doctorStore = transaction.objectStore('doctors')
      doctorStore.delete(doctorId)

      // Delete related duties
      const dutyStore = transaction.objectStore('duties')
      const dutyIndex = dutyStore.index('doctor_id')
      const dutyRequest = dutyIndex.openCursor(IDBKeyRange.only(doctorId))
      dutyRequest.onsuccess = (event) => {
        const cursor = event.target.result
        if (cursor) {
          cursor.delete()
          cursor.continue()
        }
      }

      // Delete related red days
      const redDaysStore = transaction.objectStore('red_days')
      const redDaysIndex = redDaysStore.index('doctor_id')
      const redDaysRequest = redDaysIndex.openCursor(IDBKeyRange.only(doctorId))
      redDaysRequest.onsuccess = (event) => {
        const cursor = event.target.result
        if (cursor) {
          cursor.delete()
          cursor.continue()
        }
      }

      // Delete related special assignments
      const specialStore = transaction.objectStore('special_assignments')
      const specialIndex = specialStore.index('doctor_id')
      const specialRequest = specialIndex.openCursor(IDBKeyRange.only(doctorId))
      specialRequest.onsuccess = (event) => {
        const cursor = event.target.result
        if (cursor) {
          cursor.delete()
          cursor.continue()
        }
      }

      transaction.oncomplete = () => resolve()
      transaction.onerror = () => reject(transaction.error)
    })
  }

  // Duty operations
  const saveDuties = async (duties) => {
    if (!db) await initDB()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['duties'], 'readwrite')
      const store = transaction.objectStore('duties')

      // Clear existing duties for the same month
      if (duties.length > 0) {
        const firstDuty = duties[0]
        const yearMonth = firstDuty.year_month
        const index = store.index('year_month')
        const deleteRequest = index.openCursor(IDBKeyRange.only(yearMonth))
        
        deleteRequest.onsuccess = (event) => {
          const cursor = event.target.result
          if (cursor) {
            cursor.delete()
            cursor.continue()
          } else {
            // Add new duties
            duties.forEach(duty => {
              store.add({
                ...duty,
                id: crypto.randomUUID()
              })
            })
          }
        }
      }

      transaction.oncomplete = () => resolve()
      transaction.onerror = () => reject(transaction.error)
    })
  }

  const getDuties = async (year, month) => {
    let database = db
    if (!database) {
      database = await initDB()
    }
    return new Promise((resolve, reject) => {
      if (!database) {
        reject(new Error('Database not initialized'))
        return
      }
      const transaction = database.transaction(['duties'], 'readonly')
      const store = transaction.objectStore('duties')
      const index = store.index('year_month')
      const yearMonth = `${year}-${String(month).padStart(2, '0')}`
      const request = index.getAll(IDBKeyRange.only(yearMonth))

      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }

  // Red days operations
  const addRedDay = async (doctorId, date) => {
    if (!db) await initDB()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['red_days'], 'readwrite')
      const store = transaction.objectStore('red_days')
      const request = store.add({
        id: crypto.randomUUID(),
        doctor_id: doctorId,
        date: date,
        created_at: new Date().toISOString()
      })

      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }

  const getRedDays = async (doctorId) => {
    if (!db) await initDB()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['red_days'], 'readonly')
      const store = transaction.objectStore('red_days')
      const index = store.index('doctor_id')
      const request = index.getAll(IDBKeyRange.only(doctorId))

      request.onsuccess = () => resolve(request.result.map(item => item.date))
      request.onerror = () => reject(request.error)
    })
  }

  const deleteRedDay = async (doctorId, date) => {
    if (!db) await initDB()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['red_days'], 'readwrite')
      const store = transaction.objectStore('red_days')
      const index = store.index('doctor_id')
      const request = index.openCursor(IDBKeyRange.only(doctorId))

      request.onsuccess = (event) => {
        const cursor = event.target.result
        if (cursor) {
          if (cursor.value.date === date) {
            cursor.delete()
            resolve()
          } else {
            cursor.continue()
          }
        } else {
          resolve()
        }
      }
      request.onerror = () => reject(request.error)
    })
  }

  // Blue days operations
  const addBlueDay = async (doctorId, date) => {
    if (!db) await initDB()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['blue_days'], 'readwrite')
      const store = transaction.objectStore('blue_days')
      const request = store.add({
        id: crypto.randomUUID(),
        doctor_id: doctorId,
        date: date,
        created_at: new Date().toISOString()
      })

      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }

  const getBlueDays = async (doctorId) => {
    if (!db) await initDB()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['blue_days'], 'readonly')
      const store = transaction.objectStore('blue_days')
      const index = store.index('doctor_id')
      const request = index.getAll(IDBKeyRange.only(doctorId))

      request.onsuccess = () => resolve(request.result.map(item => item.date))
      request.onerror = () => reject(request.error)
    })
  }

  const deleteBlueDay = async (doctorId, date) => {
    if (!db) await initDB()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['blue_days'], 'readwrite')
      const store = transaction.objectStore('blue_days')
      const index = store.index('doctor_id')
      const request = index.openCursor(IDBKeyRange.only(doctorId))

      request.onsuccess = (event) => {
        const cursor = event.target.result
        if (cursor) {
          if (cursor.value.date === date) {
            cursor.delete()
            resolve()
          } else {
            cursor.continue()
          }
        } else {
          resolve()
        }
      }
      request.onerror = () => reject(request.error)
    })
  }

  // Special assignments operations
  const addSpecialAssignment = async (doctorId, date, shiftType) => {
    if (!db) await initDB()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['special_assignments'], 'readwrite')
      const store = transaction.objectStore('special_assignments')
      const request = store.add({
        id: crypto.randomUUID(),
        doctor_id: doctorId,
        date: date,
        shift_type: shiftType,
        created_at: new Date().toISOString()
      })

      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }

  const getSpecialAssignments = async (doctorId) => {
    if (!db) await initDB()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['special_assignments'], 'readonly')
      const store = transaction.objectStore('special_assignments')
      const index = store.index('doctor_id')
      const request = index.getAll(IDBKeyRange.only(doctorId))

      request.onsuccess = () => {
        const assignments = {}
        request.result.forEach(item => {
          assignments[item.date] = item.shift_type
        })
        resolve(assignments)
      }
      request.onerror = () => reject(request.error)
    })
  }

  // Settings operations
  const saveSettings = async (settings) => {
    if (!db) await initDB()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['settings'], 'readwrite')
      const store = transaction.objectStore('settings')
      const request = store.put({
        id: 'app_settings',
        ...settings,
        updated_at: new Date().toISOString()
      })

      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }

  const getSettings = async () => {
    if (!db) await initDB()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['settings'], 'readonly')
      const store = transaction.objectStore('settings')
      const request = store.get('app_settings')

      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }

  return {
    // Doctor operations
    addDoctor,
    getDoctors,
    updateDoctor,
    deleteDoctor,
    
    // Duty operations
    saveDuties,
    getDuties,
    
    // Red days operations
    addRedDay,
    getRedDays,
    deleteRedDay,
    
    // Blue days operations
    addBlueDay,
    getBlueDays,
    deleteBlueDay,
    
    // Special assignments operations
    addSpecialAssignment,
    getSpecialAssignments,
    
    // Settings operations
    saveSettings,
    getSettings
  }
}

export { useIndexedDB }

