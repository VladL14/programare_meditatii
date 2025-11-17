import { useState, useEffect } from "react";
import React from "react";
import Calendar from "react-calendar";
import axios from "axios";
import "react-calendar/dist/Calendar.css";

const ORAR = {
    1: [{ start: '15:00', end: '21:00' }],
    2: [{ start: '09:00', end: '11:00' }, { start: '15:00', end: '20:00' }],
    3: [{ start: '13:30', end: '20:00' }],
    4: [{ start: '09:00', end: '11:00' }, { start: '14:30', end: '20:00' }],
    5: [{ start: '11:30', end: '20:00' }],
    6: [{ start: '10:30', end: '20:00' }],
    0: []
};

const getSlots = (intervale) => {
    const slots = [];
    if (!intervale) return slots;

    intervale.forEach(interval => {
        const [startHour, startMin] = interval.start.split(':').map(Number);
        const [endHour, endMin] = interval.end.split(':').map(Number);

        let currentMinutes = startHour * 60 + startMin;
        const endMinutes = endHour * 60 + endMin;

        while (currentMinutes + 90 <= endMinutes) {
            const startH = Math.floor(currentMinutes / 60).toString().padStart(2, '0');
            const startM = (currentMinutes % 60).toString().padStart(2, '0');

            const endSessionMin = currentMinutes + 90;
            const endH = Math.floor(endSessionMin / 60).toString().padStart(2, '0');
            const endM = (endSessionMin % 60).toString().padStart(2, '0');

            slots.push(`${startH}:${startM} - ${endH}:${endM}`);

            currentMinutes += 90;
        }
    });
    return slots;
};

function CalendarProgramari() {
    const [date, setDate] = useState(() => new Date());
    const [programari, setProgramari] = useState([]);
    const [slotSelectat, setSlotSelectat] = useState(null);
    const [nume, setNume] = useState("");

    // Funcție pentru a aduce datele de pe server
    const fetchProgramari = () => {
        axios.get("https://vladl14.pythonanywhere.com/api/programari/")
            .then((response) => {
                setProgramari(response.data);
            })
            .catch(err => console.error("Eroare la încărcare:", err));
    };

    // Încărcăm datele la prima deschidere
    useEffect(() => {
        fetchProgramari();
    }, []);

    const rezervaSlot = () => {
        if (!nume) {
            alert("Te rog introdu numele!");
            return;
        }
        const [oraInceput, oraSfarsit] = slotSelectat.split(' - ');

        // Construim data fixă locală pentru a trimite corect către server
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const dataFormatata = `${year}-${month}-${day}`;

        const payload = {
            nume_elev: nume,
            data: dataFormatata,
            ora_inceput: oraInceput,
            ora_sfarsit: oraSfarsit,
            este_blocat: true
        };

        axios.post("https://vladl14.pythonanywhere.com/api/programari/", payload)
            .then(() => {
                alert("Rezervare reușită! 🚀");
                setSlotSelectat(null);
                setNume("");
                // Reîncărcăm datele imediat ca să dispară slotul ocupat
                fetchProgramari();
            })
            .catch(error => {
                console.error("Eroare la rezervare:", error);
                alert("A apărut o eroare. Verifică consola.");
            });
    };

    const programulZilei = ORAR[date.getDay()];

    // --- FIX FUS ORAR ---
    // Construim data manual (YYYY-MM-DD) bazat pe ce vezi tu în calendar (Local)
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dataFormatata = `${year}-${month}-${day}`;

    // Filtrăm rezervările folosind data corectă
    const oreOcupate = programari
        .filter(p => p.data === dataFormatata)
        .map(p => p.ora_inceput.slice(0, 5));

    // Generăm sloturile și eliminăm ce e ocupat
    const slots = getSlots(programulZilei).filter(slot => {
        const oraStartSlot = slot.split(' - ')[0];
        return !oreOcupate.includes(oraStartSlot);
    });

    const onDateChange = (newDate) => {
        setDate(newDate);
        setSlotSelectat(null);
        setNume("");
    };

    return (
        <div className="flex flex-col items-center gap-6">
            <div className="p-4 bg-white rounded-lg shadow-md flex justify-center">
                <Calendar
                    onChange={onDateChange}
                    value={date}
                    minDate={new Date()}
                />
            </div>

            {/* Aici vom afișa lista de ore */}
            <div className="p-4 bg-white rounded-lg shadow-md w-full max-w-md">
                <h3 className="text-lg font-bold mb-4 text-center">
                    Program pentru {date.toLocaleDateString()}
                </h3>
                <div className="grid grid-cols-3 gap-2">
                    {slots.map((slot) => (
                        <button
                            key={slot}
                            className={`p-2 text-white rounded hover:bg-opacity-80 ${slot === slotSelectat ? "bg-green-500" : "bg-blue-500"
                                }`}
                            onClick={() => setSlotSelectat(slot === slotSelectat ? null : slot)}
                        >
                            {slot}
                        </button>
                    ))}

                    {slots.length === 0 && (
                        <p className="col-span-3 text-center text-gray-400 italic">
                            Nu sunt locuri disponibile.
                        </p>
                    )}

                </div>
                {/* Secțiunea apare DOAR dacă ai ales o oră */}
                {slotSelectat && (
                    <div className="mt-6 p-4 bg-gray-50 rounded-lg w-full max-w-md border border-gray-200">
                        <h4 className="font-bold mb-2">Completează rezervarea:</h4>
                        <p className="text-sm text-gray-600 mb-4">
                            Data: {date.toLocaleDateString()} <br />
                            Ora: {slotSelectat}
                        </p>

                        <input
                            type="text"
                            placeholder="Numele tău"
                            className="w-full p-2 border rounded mb-4 text-black"
                            value={nume}
                            onChange={(e) => setNume(e.target.value)}
                        />

                        <button
                            onClick={rezervaSlot}
                            className="w-full bg-green-600 text-white p-3 rounded font-bold hover:bg-green-700 transition"
                        >
                            Confirmă Rezervarea
                        </button>

                    </div>
                )}
            </div>
        </div>
    );
}

export default CalendarProgramari;