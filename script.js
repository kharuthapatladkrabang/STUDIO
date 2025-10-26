document.addEventListener("DOMContentLoaded", async () => {
  const loader = document.getElementById("loader");
  const tableContainer = document.getElementById("tableContainer");
  const tableBody = document.querySelector("#studioTable tbody");
  const statusCard = document.getElementById("statusCard"); 

  // ✅ ใช้ URL ใหม่ของปลั๊ก (อัปเดต URL ล่าสุดตามที่คุณแจ้งมา)
  const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbzHUzShlYGLAbFkMdACeJvBYJ6P7SUiYAiM2tzfRRjABEPxVxuc0HCGiyPm-iGZT7wP/exec";

  try {
    const res = await fetch(WEB_APP_URL + "?action=get_studio_status");
    const data = await res.json();

    if (data.success && data.rows) {

      // ===== แสดงรูปส่วนหัวจาก H1 (โค้ดที่ได้รับการแก้ไข) =====
      if (data.headerImage) {
        const headerImg = document.createElement("img");
        headerImg.src = data.headerImage;
        headerImg.alt = "Header Image";
        headerImg.style.width = "100%";
        headerImg.style.display = "block"; 
        headerImg.style.objectFit = "cover";
        headerImg.style.maxHeight = "120px";
        
        // สร้าง div ห่อหุ้มรูปภาพและกำหนดโค้งมนภายนอก
        const imgWrap = document.createElement("div");
        imgWrap.style.borderRadius = "18px 18px 0 0";
        imgWrap.style.overflow = "hidden"; // สำคัญ: ใช้ overflow เพื่อซ่อนขอบที่ไม่ต้องการ
        imgWrap.style.marginBottom = "15px";

        imgWrap.appendChild(headerImg);
        
        const h1Title = statusCard.querySelector('h1'); 

        if (h1Title) {
            // แทรก div ห่อหุ้มรูปภาพก่อน h1
            statusCard.insertBefore(imgWrap, h1Title);
            
            // ปรับ padding ด้านบนของ card ให้เป็น 0 (เพราะรูปภาพจะครอบคลุม)
            statusCard.style.paddingTop = "0"; 

            // ปรับ margin-top ของ h1
            h1Title.style.marginTop = "20px"; 
        } else {
            statusCard.insertBefore(imgWrap, statusCard.firstChild);
        }
      }
      
      // ===== สร้างตาราง =====
      tableBody.innerHTML = "";
      data.rows.forEach(row => {
        const [room, status, year, people, note] = row;
        const tr = document.createElement("tr");
        const statusClass = status === "ว่าง" ? "status-ว่าง" : "status-ไม่ว่าง";

        tr.innerHTML = `
          <td>${room || "-"}</td>
          <td class="${statusClass}">${status || "-"}</td>
          <td>${year || "-"}</td>
          <td>${people || "-"}</td>
          <td>${note || "-"}</td>
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

      // ===== ข้อความจาก C11:F11 (รองรับ Line breaks) =====
      if (data.text) {
        const textBox = document.createElement("p");
        textBox.textContent = data.text;
        textBox.style.marginTop = "10px";
        textBox.style.color = "#374151";
        textBox.style.fontSize = "0.9rem";
        textBox.style.textAlign = "center";
        textBox.style.lineHeight = "1.4";
        textBox.style.whiteSpace = "pre-wrap"; 
        tableContainer.appendChild(textBox);
      }

      // ===== ปุ่ม 1 และ 2 (รวมกัน) =====
      let buttons = [];
      
      // ปุ่ม 1
      if (data.button1 && data.button1.url && data.button1.text) {
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
      if (data.button2 && data.button2.url && data.button2.text) {
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
      loader.innerHTML = "<p style='color:#ef4444; font-weight:600;'>ไม่พบข้อมูลจากชีต หรือไม่สามารถอ่านได้</p>";
    }
  } catch (err) {
    loader.innerHTML = "<p style='color:#ef4444; font-weight:600;'>โหลดข้อมูลไม่สำเร็จ (เชื่อมต่อไม่สำเร็จ)</p>";
    console.error("Error fetching data:", err);
  }
});
