const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const WHITE = "#FFFFFF";
const BLACK = "#000000";
const BLUE = "#0080FF";
const GREEN = "#00c800";
const RED = "#C80000";
const PINK = "rgb(255, 138, 228)";
const BBYBLUE = "rgb(150, 183, 254)";
const BOSSCOLOR = "#640064";

const FONTSIZE = 28;
const STARTTIMELIMIT = 10;
const BOSSTIMELIMIT = 5;

// คำถาม
const questions = [
    ["แรงโน้มถ่วงของโลกมีค่าเท่าไหร่", ["12.3m/s^2", "5.5m/s^2", "9.8m/s^2"], 2],
    ["หน่วยของพลังงานในระบบSIคือ", ["Newton", "Joule", "Watt"], 1],
    ["ความเร็วของแสงในสุญญากาศประมาณเท่าไหร่", ["3*10^8m/s", "5*10^6m/s", "1.5*10^8m/s"], 0],
    ["พลังงานศักย์โน้มถ่วงคำนวณจากสูตรใด", ["s/t", "1/2mv^2", "mgh"], 2],
    ["เสียงเดินทางได้ดีที่สุดในตัวกลางใด", ["solid", "liquid", "gas"], 0],
    ["ความร้อนที่จำเป็นในการทำให้1กิโลกรัมของน้ำเพิ่มอุณหภูมิ 1 องศาเซลเซียสคืออะไร", ["5.20kJ", "4.18kJ", "2.50kJ"], 1],
    ["แรงที่ทำให้วัตถุเคลื่อนที่จากที่สูงลงที่ต่ำคือ", ["gravity force", "kinetic force", "magnetic force"], 0],
];

// ฟังก์ชัน random คำถาม
function getRandomQuestion() {
    const [question, options, answerIndex] = questions[Math.floor(Math.random() * questions.length)];
    const indices = [0, 1, 2];
    indices.sort(() => Math.random() - 0.5);
    const shuffledOptions = indices.map(i => options[i]);
    const newAnswerIndex = indices.indexOf(answerIndex);
    return [question, shuffledOptions, newAnswerIndex];
}

// ฟังก์ชันแสดงข้อความ
function drawText(text, x, y, color = PINK, size = FONTSIZE) {
    ctx.fillStyle = color;
    ctx.font = `${size}px Arial`;
    ctx.fillText(text, x, y);
}

let score = 0;
let questionCount = 0;
let maxQuestions = 7;
let timeLimit = STARTTIMELIMIT;
let bossHp = 500;  // เริ่มต้น HP ของบอสที่ 500
let selected = null;
let message = "";
let isBossFight = false;

// โหมดปกติ
function gameLoop() {
    if (questionCount < maxQuestions) {
        const [currentQuestion, options, correctAnswer] = getRandomQuestion();
        const startTime = Date.now();
        let remainingTime = timeLimit;

        function loop() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            drawText(`คะแนน: ${score}`, 50, 20, BLUE);
            drawText(`ข้อที่ ${questionCount + 1} / ${maxQuestions}`, 50, 60, BBYBLUE);
            drawText(currentQuestion, (canvas.width - ctx.measureText(currentQuestion).width) / 2, canvas.height / 4, BLACK);

            // แสดงตัวเลือก
            options.forEach((option, i) => {
                const color = selected === i && i === correctAnswer ? GREEN : (selected === i ? RED : BLUE);
                ctx.fillStyle = color;
                ctx.fillRect(50, canvas.height / 2 + i * 60, 400, 40);
                drawText(option, 60, canvas.height / 2 + i * 60 + 30, WHITE);
            });

            remainingTime = Math.max(0, timeLimit - Math.floor((Date.now() - startTime) / 1000));
            drawText(`เวลาที่เหลือ: ${remainingTime} วินาที`, 600, 550, RED);

            if (remainingTime === 0) {
                message = 'TIME OUT !!⌛';
                setTimeout(() => {
                    questionCount++;
                    timeLimit = Math.max(3, timeLimit - 1);
                    gameLoop();
                }, 1500);
            }

            // คลิกเลือกคำตอบ
            canvas.addEventListener("click", (event) => {
                const x = event.offsetX;
                const y = event.offsetY;
                options.forEach((option, i) => {
                    if (50 <= x && x <= 450 && canvas.height / 2 + i * 60 <= y && y <= canvas.height / 2 + i * 60 + 40) {
                        selected = i;
                        if (i === correctAnswer) {
                            score++;
                            message = "CORRECT !🥳";
                        } else {
                            message = "WRONG ❌❌❌❌";
                        }
                        setTimeout(() => {
                            questionCount++;
                            timeLimit = Math.max(3, timeLimit - 1);
                            if (questionCount >= maxQuestions) {
                                isBossFight = true;
                                bossFight();
                            } else {
                                gameLoop();
                            }
                        }, 1500);
                    }
                });
            });

            drawText(message, (canvas.width - ctx.measureText(message).width) / 2, canvas.height / 2 + 200, RED, 36);
            requestAnimationFrame(loop);
        }

        loop();
    }
}

// โหมดบอส
function bossFight() {
    if (bossHp > 0) {
        const [currentQuestion, options, correctAnswer] = getRandomQuestion();
        const startTime = Date.now();
        let remainingTime = BOSSTIMELIMIT;

        function loop() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = BOSSCOLOR;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            drawText("🔥🐦‍🔥 BOSS FIGHT ! 🐦‍🔥🔥", (canvas.width - ctx.measureText("🔥🐦‍🔥 BOSS FIGHT ! 🐦‍🔥🔥").width) / 2, 50, WHITE, 40);
            drawText(`HP BOSS: ${bossHp} ❤️‍🔥`, (canvas.width - ctx.measureText(`HP BOSS: ${bossHp} ❤️‍🔥`).width) / 2, 100, RED, 36);

            drawText(currentQuestion, (canvas.width - ctx.measureText(currentQuestion).width) / 2, 200, PINK);

            options.forEach((option, i) => {
                ctx.fillStyle = BLUE;
                ctx.fillRect(50, canvas.height / 2 + i * 60, 400, 40);
                drawText(option, 60, canvas.height / 2 + i * 60 + 30, WHITE);
            });

            remainingTime = Math.max(0, BOSSTIMELIMIT - Math.floor((Date.now() - startTime) / 1000));
            drawText(`เวลาที่เหลือ: ${remainingTime} วินาที`, 600, 550, RED);

            if (remainingTime === 0) {
                message = 'TIME OUT !!⌛';
                setTimeout(() => {
                    if (selected === correctAnswer) {
                        bossHp -= 50; // ลด HP ของบอสทีละน้อย
                        message = "CORRECT! BOSS HP -50";
                    } else {
                        message = "WRONG! BOSS ไม่ลด HP";
                    }
                    if (bossHp <= 0) {
                        message = "CONGRATS!! YOU DEFEATED THE BOSS!";
                    }
                    setTimeout(() => {
                        if (bossHp <= 0) {
                            alert("You won the game!");
                            return;
                        }
                        questionCount++;
                        gameLoop();
                    }, 1500);
                }, 1500);
            }

            drawText(message, (canvas.width - ctx.measureText(message).width) / 2, canvas.height / 2 + 200, RED, 36);
            requestAnimationFrame(loop);
        }

        loop();
    }
}

// เริ่มเกม
gameLoop();
