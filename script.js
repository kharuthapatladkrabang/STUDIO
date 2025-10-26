document.addEventListener("DOMContentLoaded", async () => {
  const loader = document.getElementById("loader");
  const tableContainer = document.getElementById("tableContainer");
  const tableBody = document.querySelector("#studioTable tbody");

  // URL Web App ของ Google Apps Script (อ่านข้อมูลจากชีต)
  const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbx1234567890abcdEFghiJKlmnopQRstUvWXyz/exec"; // 👉 แก้เป็นของปลั๊ก

  try {
    const res = await fetch(WEB_APP_URL + "?action=get_studio_status");
    const data = await res.json();

    if (data.success && data.rows) {
      tableBody.innerHTML = "";
      data.rows.forEach(row => {
        const tr = document.createElement("tr");
        const [room, status, year, people, note] = row;
        tr.innerHTML = `
          <td>${room || "-"}</td>
          <td class="status-cell ${status === "ว่าง" ? "status-ว่าง" : "status-ไม่ว่าง"}">${status || "-"}</td>
          <td>${year || "-"}</td>
          <td>${people || "-"}</td>
          <td>${note || "-"}</td>
        `;
        tableBody.appendChild(tr);
      });
      loader.style.display = "none";
      tableContainer.style.display = "block";
    } else {
      loader.innerHTML = "<p style='color:#ef4444'>ไม่พบข้อมูลจากชีต</p>";
    }
  } catch (err) {
    loader.innerHTML = "<p style='color:#ef4444'>โหลดข้อมูลไม่สำเร็จ</p>";
    console.error(err);
  }
});
