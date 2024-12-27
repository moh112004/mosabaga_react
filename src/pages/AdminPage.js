import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import "../AdminPage.css";
import * as XLSX from 'xlsx';

const socket = io('https://mosabaga-project.onrender.com/');

export default function AdminPage() {

    const [question, setQuestion] = useState(''); // نص السؤال الحالي
    const [questions, setQuestions] = useState(JSON.parse(localStorage.getItem("questions")) || []); // قائمة الأسئلة

    const handleAddQuestion = () => {
        if (question.trim()) {
            setQuestions([...questions, question]);
            localStorage.setItem("questions", JSON.stringify([...questions, question]));
            setQuestion('');
        }
    };

    const handleSendQuestion = (q) => {
        socket.emit('setQuestion', q); // إرسال السؤال إلى السيرفر
    };

    const handleDeleteQuestion = (q) => {
        setQuestions(questions.filter(question => question !== q));
        localStorage.setItem("questions", JSON.stringify(questions.filter(question => question !== q)));
    };

    const handlePauseTimer = () => {
        socket.emit('pauseTimer'); // إرسال أمر إيقاف المؤقت إلى السيرفر
    };

    const handleResumeTimer = () => {
        socket.emit('resumeTimer'); // إرسال أمر استئناف المؤقت إلى السيرفر
    };

    const handleResetTimer = () => {
        socket.emit('resetTimer'); // إرسال أمر إعادة ضبط المؤقت إلى السيرفر
    };

    const handleStartHalfMinuteTimer = () => {
        socket.emit('startHalfMinuteTimer'); // إرسال أمر إعادة ضبط المؤقت إلى السيرفر
    };


    const handleResetLamps = () => {
        socket.emit('resetLamps'); // إرسال أمر إعادة ضبط المؤقت إلى السيرفر
    };

    const handleHideQuestion = () => {
        socket.emit('hideQuestion'); // إرسال أمر إعادة ضبط المؤقت إلى السيرفر
    };

    const handleDeleteAll = () => {
        const confirmed = window.confirm('هل أنت متأكد من حذف كل الأسئلة؟');

        if (confirmed) {
            setQuestions([]);
            localStorage.setItem("questions", JSON.stringify([]));
        }
    };




    const [contestants, setContestants] =
        useState(
            JSON.parse(localStorage.getItem("contestants")) ||
        [
        { id: 1, score: 0 },
        { id: 2, score: 0 },
        { id: 3, score: 0 },
        { id: 4, score: 0 },
    ]);

    // تحديث الاسم


    // تحديث الدرجات
    const updateScore = (id, newScore) => {
        setContestants((prevContestants) =>
            prevContestants.map((contestant) =>
                contestant.id === id ? { ...contestant, score: parseInt(newScore) || 0 } : contestant
            )
        );
    };

    // حفظ البيانات
    const saveData = (contestants) => {
        socket.emit('saveData', contestants);
        localStorage.setItem("contestants", JSON.stringify(contestants));

    };
    const resetContestantsScores = () => {
        setContestants([
            { id: 1, score: 0 },
            { id: 2, score: 0 },
            { id: 3, score: 0 },
            { id: 4, score: 0 },
        ]);
        localStorage.setItem("contestants", JSON.stringify([
            { id: 1, score: 0 },
            { id: 2, score: 0 },
            { id: 3, score: 0 },
            { id: 4, score: 0 },
        ]));

    };




    const handleFileUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const sheetName = workbook.SheetNames[0]; // أول شيت في الملف
                const sheet = workbook.Sheets[sheetName];
                const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 }); // استخراج البيانات كصفوف
                const columnItems = rows.map((row) => row[0]).filter((item) => item); // العمود الأول فقط
                console.log(columnItems);
                setQuestions((prevQuestions) => [...prevQuestions, ...columnItems]);
                localStorage.setItem("questions", JSON.stringify([...questions, ...columnItems]));
            };
            reader.readAsArrayBuffer(file);
        }
    };




    const handleShowResult = (result) => {
        socket.emit('showResult', result); // إرسال السؤال إلى السيرفر
    };
    const handleHideResult = () => {
        socket.emit('hideResult'); // إرسال السؤال إلى السيرفر
    };




    return (
        <div lang="ar" dir="rtl">
            <h1>صفحة التحكم</h1>
            <div className='AdminMainRow'>
                <div className='RightColumn'>
                    <div style={{ width: "80%", display: "flex", flexDirection: "row", justifyContent: "space-between", }}>
                        <input
                            type="text"
                            value={question}
                            onChange={(e) => setQuestion(e.target.value)}
                            onKeyDown={(event) => {
                                if (event.key === 'Enter') {
                                    handleAddQuestion();
                                }
                            }}
                            placeholder="أدخل السؤال هنا"
                            style={{
                                width: "80%",
                                height: "25px",
                            }}
                        />
                        <button onClick={handleAddQuestion}
                            style={{ width: "15%" }}>إضافة</button>
                    </div>
                    <br />
                    <label className="UploadButton">
                        <input type="file" accept=".xlsx, .xls" onChange={handleFileUpload} style={{ display: "none" }} />
                        إضافة ملف إكسيل
                    </label>

                    <div>
                        <h2>قائمة الأسئلة</h2>
                        <ol>
                            {questions.map((q, index) => (
                                <li key={index}>
                                    <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'start' }}>
                                        {index + 1}.
                                        &nbsp;
                                        <p style={{ margin: '0' }}>{q}</p>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'start' }}>
                                        <button onClick={() => handleSendQuestion(q.toString())} style={{ marginLeft: '10px' }}>عرض</button>
                                        <button onClick={() => handleDeleteQuestion(q)}>حذف</button>
                                    </div>
                                </li>
                            ))}
                        </ol>
                        <button onClick={() => handleDeleteAll()} style={{ display: questions.length > 1 ? 'block' : 'none' }}>حذف الكل</button>
                    </div>
                </div>

                <div className='LeftColumn'>

                    <h1>أزرار التحكم</h1>

                    <div className='Buttons'>
                        <button className="CircleButton" onClick={handlePauseTimer}>
                            إيقاف المؤقت
                        </button>
                        <button className="CircleButton" onClick={handleResumeTimer}>
                            استئناف المؤقت
                        </button>
                        <button className="CircleButton" onClick={handleResetTimer}>
                            إعادة ضبط المؤقت 10 ثواني
                        </button>
                        <button className="CircleButton" onClick={handleStartHalfMinuteTimer}>
                            إعادة ضبط المؤقت 30 ثانية
                        </button>
                        <button className="CircleButton" onClick={handleResetLamps}>
                            إعادة تعيين المصابيح
                        </button>
                        <button className="CircleButton" onClick={handleHideQuestion}>
                            إخفاء السؤال
                        </button>

                        <button className="CircleButton" onClick={() => handleShowResult(true)}>
                            إجابة صحيحة                        </button>
                        <button className="CircleButton" onClick={() => handleShowResult(false)}>
                            إجابة خاطئة
                        </button>
                        <button className="CircleButton" onClick={handleHideResult}>
                            إخفاء النتيجة
                        </button>

                    </div>
                    <table>
                        <thead>
                            <tr>
                                <th>الرقم</th>
                                <th>إسم الفريق</th>
                                <th>الدرجات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {contestants.map((contestant, i) => (
                                <tr key={contestant.id}>
                                    <td>{i + 1}</td>
                                    <td>
                                        <span>
                                            {["الأحمر", "الأخضر", "الأزرق", "الأصفر"][i]}
                                        </span>
                                    </td>
                                    <td>
                                        <input
                                            type="number"
                                            value={contestant.score}
                                            onChange={(e) => updateScore(contestant.id, e.target.value)}
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <button onClick={() => saveData(contestants)} style={{ width: "13%", height: "30px" }}>حفظ</button>
                    &nbsp;
                    &nbsp;
                    <button onClick={resetContestantsScores} style={{ height: "30px" }}>إعادة تعيين</button>
                </div>
            </div>
        </div>
    );
}
