// ข้อมูล Google Sheet และ API Key
// **สำคัญ:** หากมีการใช้คีย์นี้ในงานจริง ควรพิจารณาการรักษาความปลอดภัยที่เหมาะสม
const API_KEY = 'AIzaSyBivFhVOiCJdpVF4xNb7vYRNJLxLj60Rk0';
const SHEET_ID = '1jKl6JVfsqvKi0kEKmn-kL62PvuY50c-cOt4EOKjmNgk';
const SHEET_NAME = 'ห้อง';

// รายการช่วงเซลล์ทั้งหมดที่ต้องการดึงข้อมูล
// Sheets API ใช้รูปแบบ SheetName!Range
const RANGES = [
    `${SHEET_NAME}!H1`,      // 0: Header Image URL
    `${SHEET_NAME}!B5:F9`,   // 1: Table Data (5 rows x 5 columns)
    `${SHEET_NAME}!H13`,     // 2: Footer Image URL
    `${SHEET_NAME}!C11:F11`, // 3: Text below image (จะถูกรวมกัน)
    `${SHEET_NAME}!C22`,     // 4: Button 1 Text
    `${SHEET_NAME}!H22`,     // 5: Button 1 URL
    `${SHEET_NAME}!B25`,     // 6: Button 2 Text
    `${SHEET_NAME}!H25`      // 7: Button 2 URL
];

/**
 * ดึงข้อมูลจาก Sheets API โดยใช้ Batch Get Values เพื่อดึงหลายช่วงเซลล์ในการเรียกครั้งเดียว
 * และจัดการโครงสร้างข้อมูลให้เป็นรูปแบบที่โค้ดเดิมใช้งาน
 */
async function fetchSheetData() {
    // เข้ารหัส (Encode) ช่วงเซลล์ทั้งหมดสำหรับ URL
    const rangesQuery = RANGES.map(encodeURIComponent).join('&ranges=');
    const apiUrl = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values:batchGet?ranges=${rangesQuery}&key=${API_KEY}`;
    
    try {
        const res = await fetch(apiUrl);
        const json = await res.json();

        // ตรวจสอบข้อผิดพลาดของ API
        if (json.error) {
            // หากเกิดข้อผิดพลาด ให้โยนข้อความข้อผิดพลาดออกมา
            throw new Error(`Sheets API Error: ${json.error.message}`);
        }

        const valueRanges = json.valueRanges;
        
        // ฟังก์ชันช่วยดึงค่าจากเซลล์เดียว หรือคืนค่า null หากไม่มีข้อมูล
        const getValue = (index) => {
            const range = valueRanges[index];
            // ตรวจสอบว่ามีค่าอยู่หรือไม่
            return range.values && range.values.length > 0 && range.values[0].length > 0
                ? range.values[0][0] // ดึงค่าแรกของแถวแรก
                : null;
        };

        // ฟังก์ชันช่วยดึงค่าตาราง
        const getTableRows = (index) => {
            const range = valueRanges[index];
            return range.values || []; // คืนค่าเป็น Array of Arrays สำหรับตาราง (B5:F9)
        };
        
        // ฟังก์ชันช่วยดึงค่าข้อความที่ต้องรวมเซลล์
        const getJoinedText = (index) => {
            const range = valueRanges[index];
            // ดึงแถวแรกออกมาแล้วนำมา join ด้วย \n เพื่อจำลองการทำงานเดิมของ Apps Script
            return range.values && range.values.length > 0 
                ? range.values[0].join('\n') 
                : null;
        };
        
        // แปลงข้อมูลที่ได้จาก API ให้เป็นรูปแบบสุดท้าย
        return {
            success: true,
            headerImage: getValue(0),
            rows: getTableRows(1),
            image: getValue(2),
            text: getJoinedText(3),
            button1: { text: getValue(4), url: getValue(5) },
            button2: { text: getValue(6), url: getValue(7) }
        };

    } catch (error) {
        console.error("Error fetching data from Sheets API:", error);
        // คืนค่า failure พร้อมข้อความข้อผิดพลาด
        return { success: false, message: error.message };
    }
}

document.addEventListener("DOMContentLoaded", async () => {
    const loader = document.getElementById("loader");
    const tableContainer = document.getElementById("tableContainer");
    const tableBody = document.querySelector("#studioTable tbody");
    const statusCard = document.getElementById("statusCard"); 
    
    // ดึงข้อมูล
    const data = await fetchSheetData();

    if (data.success && data.rows && data.rows.length > 0) {
        
        // ===== แสดงรูปส่วนหัวจาก H1 =====
        if (data.headerImage) {
            const headerImg = document.createElement("img");
            headerImg.src = data.headerImage;
            headerImg.alt = "Header Image";
            headerImg.style.width = "100%";
            headerImg.style.display = "block"; 
            headerImg.style.objectFit = "cover";
            headerImg.style.maxHeight = "120px";
            
            // ปรับให้รูปภาพมีขอบมนเฉพาะด้านล่าง และใช้ margin-top ติดลบเพื่อดึงรูปขึ้นไปติดขอบบน
            headerImg.style.borderRadius = "0 0 12px 12px"; 
            headerImg.style.marginTop = "-36px"; // ชดเชย padding-top เดิมของ status-card (36px)
            headerImg.style.marginBottom = "20px"; 
            headerImg.style.boxShadow = "0 2px 8px rgba(0,0,0,0.08)"; 

            const h1Title = statusCard.querySelector('h1'); 

            if (h1Title) {
                statusCard.insertBefore(headerImg, h1Title);
                statusCard.style.paddingTop = "36px"; 
                h1Title.style.marginTop = "0px"; 
            } else {
                statusCard.insertBefore(headerImg, statusCard.firstChild);
            }
        }
        
        // ===== สร้างตาราง =====
        tableBody.innerHTML = "";
        data.rows.forEach(row => {
            // โค้ดจะอ้างอิงตามคอลัมน์ B, C, D, E, F
            // ใช้ .map(cell => cell || '-') เพื่อรับประกันว่าทุกคอลัมน์จะมีค่า (แม้จะเป็น '-')
            const [room, status, year, people, note] = row.map(cell => cell || '-'); 
            const tr = document.createElement("tr");
            const statusText = (status || "").trim();
            const statusClass = statusText === "ว่าง" ? "status-ว่าง" : "status-ไม่ว่าง";

            tr.innerHTML = `
            <td>${room}</td>
            <td class="${statusClass}">${statusText}</td>
            <td>${year}</td>
            <td>${people}</td>
            <td>${note}</td>
            `;
            tableBody.appendChild(tr);
        });

        loader.style.display = "none";
        tableContainer.style.display = "block";

        // ===== แสดงเวลาอัปเดต =====
        const updateTime = new Date();
        const options = { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" };
        const footer = document.createElement("p");
        footer.textContent = `อัปเดตล่าสุด: ${updateTime.toLocaleString("th-TH", options)}`;
        footer.style.fontSize = "0.75rem";
        footer.style.color = "#6b7280";
        footer.style.marginTop = "10px";
        footer.style.textAlign = "right";
        footer.style.opacity = "0.8";
        tableContainer.appendChild(footer);

        // ===== แสดงรูปจาก H13 =====
        if (data.image) {
            const img = document.createElement("img");
            img.src = data.image;
            img.alt = "studio image";
            img.style.width = "100%";
            img.style.borderRadius = "12px";
            img.style.marginTop = "15px";
            img.style.boxShadow = "0 2px 8px rgba(0,0,0,0.08)";
            tableContainer.appendChild(img);
        }

        // ===== ข้อความจาก C11:F11 =====
        if (data.text) {
            const textBox = document.createElement("p");
            // ใช้ pre-wrap เพื่อรองรับการขึ้นบรรทัดใหม่ (\n) จากการรวมเซลล์
            textBox.textContent = data.text; 
            textBox.style.marginTop = "10px";
            textBox.style.color = "#374151";
            textBox.style.fontSize = "0.9rem";
            textBox.style.textAlign = "center";
            textBox.style.lineHeight = "1.4";
            textBox.style.whiteSpace = "pre-wrap"; 
            tableContainer.appendChild(textBox);
        }

        // ===== ปุ่ม 1 และ 2 =====
        let buttons = [];
        
        // ปุ่ม 1
        if (data.button1.url && data.button1.text) {
            const btn1 = document.createElement("a");
            btn1.href = data.button1.url;
            btn1.target = "_blank";
            btn1.className = "neural-button";
            btn1.style.width = "140px"; 
            btn1.style.margin = "20px 8px 0 8px"; 
            btn1.innerHTML = `
            <div class="button-bg"></div>
            <span class="button-text">${data.button1.text}</span>
            <div class="button-glow"></div>
            `;
            buttons.push(btn1);
        }

        // ปุ่ม 2
        if (data.button2.url && data.button2.text) {
            const btn2 = document.createElement("a");
            btn2.href = data.button2.url;
            btn2.target = "_blank";
            btn2.className = "neural-button";
            btn2.style.width = "140px"; 
            btn2.style.margin = "20px 8px 0 8px";
            btn2.innerHTML = `
            <div class="button-bg"></div>
            <span class="button-text">${data.button2.text}</span>
            <div class="button-glow"></div>
            `;
            buttons.push(btn2);
        }

        // ===== แสดงปุ่มคู่กัน (อยู่ข้างกัน) =====
        if (buttons.length > 0) {
            const wrap = document.createElement("div");
            wrap.style.display = "flex";
            wrap.style.justifyContent = "center";
            wrap.style.flexWrap = "wrap";
            wrap.style.marginTop = "10px";
            buttons.forEach(btn => wrap.appendChild(btn));
            tableContainer.appendChild(wrap);
        }

    } else {
        // แสดงข้อความเมื่อโหลดข้อมูลไม่สำเร็จ
        loader.innerHTML = `<p style='color:#ef4444; font-weight:600;'>ไม่สามารถโหลดข้อมูลได้: ${data.message || 'กรุณาตรวจสอบ API Key และสิทธิ์การเข้าถึงชีต'}</p>`;
    }
});
